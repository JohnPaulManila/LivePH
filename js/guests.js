import { CHAT_VIEWERS, DEMO_PK_LIVES } from "./data.js";
import {
  bridge,
  escapeHtml,
  formatCoins,
  getProfileData,
  getVipLevelFor,
  initialsFrom,
  myChatName,
  pickRandom,
  requireAuth,
  saveSession,
  setAvatarEl,
  showToast,
  state,
} from "./core.js";

export const MAX_GUESTS = 10;
export const WITHDRAW_MIN = 1000;
export const WITHDRAW_FEE_RATE = 0.05;

export const PK_DURATIONS = [
  { id: "5m", label: "5 minutes", ms: 5 * 60 * 1000 },
  { id: "15m", label: "15 minutes", ms: 15 * 60 * 1000 },
  { id: "30m", label: "30 minutes", ms: 30 * 60 * 1000 },
  { id: "1h", label: "1 hour", ms: 60 * 60 * 1000 },
];

let joinSimTimer = null;
let pkTickTimer = null;
let pendingPkInvitee = null;
let pkEnding = false;

function roomIsInPk() {
  if (state.pk || pkEnding) return true;
  return DEMO_PK_LIVES.some((p) => p.streamId === state.activeStreamId);
}

export function getPkStats(name) {
  const key = String(name || "");
  const mine = myChatName();
  if (key === mine || key === state.user?.displayName || key === state.user?.username) {
    return state.pkStats?.me || { wins: 0, losses: 0 };
  }
  const stored = state.pkStats?.[key];
  if (stored) return stored;
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash + key.charCodeAt(i) * (i + 1)) % 97;
  return { wins: 3 + (hash % 12), losses: 1 + (hash % 8) };
}

export function recordPkResult(winner, loser) {
  const bump = (name, field) => {
    const mine = myChatName();
    const isMe =
      name === mine || name === state.user?.displayName || name === state.user?.username;
    if (isMe) {
      state.pkStats.me = state.pkStats.me || { wins: 0, losses: 0 };
      state.pkStats.me[field] += 1;
    } else {
      const base = state.pkStats[name] || getPkStats(name);
      state.pkStats[name] = { wins: base.wins, losses: base.losses };
      state.pkStats[name][field] += 1;
    }
  };
  bump(winner, "wins");
  bump(loser, "losses");
  saveSession();
}

function hostName() {
  return state.myLive?.host || document.getElementById("live-room-name")?.textContent || "Host";
}

export function resetLiveSocial() {
  clearTimeout(joinSimTimer);
  joinSimTimer = null;
  clearInterval(pkTickTimer);
  pkTickTimer = null;
  pkEnding = false;
  state.guestSeats = [];
  state.joinRequests = [];
  state.pk = null;
  state.giftTarget = null;
  pendingPkInvitee = null;
  clearPkResultBadges();
  renderGuestGrid();
  renderJoinRequests();
  renderPkBar();
  updateLiveSocialButtons();
  closeJoinSheet();
  closePkSheet();
}

function isMeOnSeat() {
  const me = myChatName();
  return state.guestSeats.some((g) => g.name === me);
}

function hasPendingRequest() {
  const me = myChatName();
  return state.joinRequests.some((r) => r.name === me);
}

export function updateLiveSocialButtons() {
  const reqBtn = document.getElementById("btn-request-join");
  const leaveBtn = document.getElementById("btn-leave-seat");
  const reqListBtn = document.getElementById("btn-open-join-requests");
  const pkBtn = document.getElementById("btn-open-pk");
  const host = state.isHosting;
  const inPk = roomIsInPk();

  if (reqBtn) {
    const blocked = inPk || state.guestSeats.length >= MAX_GUESTS;
    reqBtn.hidden = host || isMeOnSeat() || hasPendingRequest();
    reqBtn.disabled = blocked;
    if (inPk) reqBtn.textContent = "Join locked (PK)";
    else if (state.guestSeats.length >= MAX_GUESTS) reqBtn.textContent = "Room full (10)";
    else reqBtn.textContent = "Request to join";
  }
  if (leaveBtn) leaveBtn.hidden = host || !isMeOnSeat();
  const social = document.getElementById("live-social-actions");
  if (social) {
    social.hidden = Boolean(host) || (reqBtn?.hidden && leaveBtn?.hidden);
  }
  if (reqListBtn) {
    reqListBtn.hidden = !host;
    const n = state.joinRequests.length;
    if (inPk && host) {
      reqListBtn.textContent = "Joins paused (PK)";
      reqListBtn.disabled = true;
    } else {
      reqListBtn.disabled = false;
      reqListBtn.textContent = n ? `Join requests (${n})` : "Join requests";
    }
  }
  if (pkBtn) {
    pkBtn.hidden = !host;
    pkBtn.textContent = state.pk ? "PK live" : "Start PK";
    pkBtn.disabled = Boolean(state.pk || pkEnding);
  }
}

export function renderGuestGrid() {
  const grid = document.getElementById("guest-grid");
  if (!grid) return;

  // During PK the opponent is already in the split view — hide guest seats
  if (state.pk) {
    grid.innerHTML = "";
    grid.hidden = true;
    return;
  }

  if (!state.guestSeats.length) {
    grid.innerHTML = "";
    grid.hidden = true;
    return;
  }

  grid.hidden = false;
  grid.innerHTML = state.guestSeats
    .map((g, i) => {
      const profile = getProfileData(g.name);
      const vip = getVipLevelFor(g.name);
      const avatarStyle = profile.avatar
        ? `background-image:url('${profile.avatar}');background-size:cover`
        : `background:linear-gradient(145deg, ${profile.avatarColor || "#2ec4b6"}, #0d2a35)`;
      return `
        <button type="button" class="guest-seat" data-guest="${escapeHtml(g.name)}" title="${escapeHtml(g.name)}">
          <span class="guest-seat-avatar" style="${avatarStyle}">${profile.avatar ? "" : escapeHtml(initialsFrom(g.name))}</span>
          <span class="guest-seat-name">${escapeHtml(g.name)}${vip > 0 ? ` <span class="vip-badge vip-${Math.min(vip, 10)}">VIP${vip}</span>` : ""}</span>
          <span class="guest-seat-slot">#${i + 1}</span>
        </button>`;
    })
    .join("");

  grid.querySelectorAll("[data-guest]").forEach((btn) => {
    btn.addEventListener("click", () => bridge.openProfile?.(btn.dataset.guest));
  });
}

export function renderJoinRequests() {
  const list = document.getElementById("join-request-list");
  const empty = document.getElementById("join-request-empty");
  if (!list) return;

  if (!state.joinRequests.length) {
    list.innerHTML = "";
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  list.innerHTML = state.joinRequests
    .map((r) => {
      const profile = getProfileData(r.name);
      const avatarStyle = profile.avatar
        ? `background-image:url('${profile.avatar}');background-size:cover`
        : `background:linear-gradient(145deg, ${profile.avatarColor || "#2ec4b6"}, #0d2a35)`;
      return `
        <div class="join-request-row" data-req-id="${escapeHtml(r.id)}">
          <span class="guest-seat-avatar" style="${avatarStyle}">${profile.avatar ? "" : escapeHtml(initialsFrom(r.name))}</span>
          <div class="join-request-meta">
            <strong>${escapeHtml(r.name)}</strong>
            <small>Wants to join your live</small>
          </div>
          <div class="join-request-actions">
            <button type="button" class="btn btn-ghost btn-sm" data-reject="${escapeHtml(r.id)}">Reject</button>
            <button type="button" class="btn btn-primary btn-sm" data-accept="${escapeHtml(r.id)}">Accept</button>
          </div>
        </div>`;
    })
    .join("");

  list.querySelectorAll("[data-accept]").forEach((btn) => {
    btn.addEventListener("click", () => acceptJoinRequest(btn.dataset.accept));
  });
  list.querySelectorAll("[data-reject]").forEach((btn) => {
    btn.addEventListener("click", () => rejectJoinRequest(btn.dataset.reject));
  });
}

function openJoinSheet() {
  if (roomIsInPk()) {
    showToast("Can't accept joins during PK — wait until PK ends");
    return;
  }
  renderJoinRequests();
  const sheet = document.getElementById("join-request-sheet");
  if (sheet) sheet.hidden = false;
}

function closeJoinSheet() {
  const sheet = document.getElementById("join-request-sheet");
  if (sheet) sheet.hidden = true;
}

export function requestToJoin() {
  if (!requireAuth("join a live")) return;
  if (state.isHosting) return;
  if (roomIsInPk()) {
    showToast("Joining is not allowed during PK live");
    return;
  }
  if (state.guestSeats.length >= MAX_GUESTS) {
    showToast("This live is full (10 guests max)");
    return;
  }
  if (isMeOnSeat() || hasPendingRequest()) return;

  const me = myChatName();
  const req = { id: `req-${Date.now()}`, name: me, at: Date.now() };

  state.joinRequests.push(req);
  showToast("Join request sent — waiting for host…");
  updateLiveSocialButtons();

  // Demo hosts auto-accept after a short delay (not during PK)
  setTimeout(() => {
    if (!state.activeStreamId || roomIsInPk()) {
      state.joinRequests = state.joinRequests.filter((r) => r.id !== req.id);
      updateLiveSocialButtons();
      if (roomIsInPk()) showToast("Join cancelled — room entered PK");
      return;
    }
    const still = state.joinRequests.find((r) => r.id === req.id);
    if (!still) return;
    if (state.guestSeats.length >= MAX_GUESTS) {
      state.joinRequests = state.joinRequests.filter((r) => r.id !== req.id);
      showToast("Room filled up before you could join");
      updateLiveSocialButtons();
      return;
    }
    acceptJoinRequest(req.id, { silentHost: true });
  }, 1600 + Math.random() * 1200);
}

export function acceptJoinRequest(id, { silentHost = false } = {}) {
  if (roomIsInPk()) {
    showToast("Can't accept guests during PK");
    return;
  }
  const req = state.joinRequests.find((r) => r.id === id);
  if (!req) return;
  if (state.guestSeats.length >= MAX_GUESTS) {
    showToast("Guest limit reached (10)");
    return;
  }
  if (state.guestSeats.some((g) => g.name === req.name)) {
    state.joinRequests = state.joinRequests.filter((r) => r.id !== id);
    renderJoinRequests();
    updateLiveSocialButtons();
    return;
  }

  state.joinRequests = state.joinRequests.filter((r) => r.id !== id);
  state.guestSeats.push({ id: `seat-${Date.now()}`, name: req.name });
  renderGuestGrid();
  renderJoinRequests();
  updateLiveSocialButtons();
  bridge.appendLiveSystem?.(
    silentHost ? `${req.name} joined the live` : `Host accepted ${req.name}`
  );
  showToast(`${req.name} joined the live`);
}

export function rejectJoinRequest(id) {
  const req = state.joinRequests.find((r) => r.id === id);
  state.joinRequests = state.joinRequests.filter((r) => r.id !== id);
  renderJoinRequests();
  updateLiveSocialButtons();
  if (req) showToast(`Rejected ${req.name}`);
}

export function leaveGuestSeat() {
  const me = myChatName();
  state.guestSeats = state.guestSeats.filter((g) => g.name !== me);
  renderGuestGrid();
  updateLiveSocialButtons();
  showToast("You left the guest seat");
}

function scheduleSimulatedJoinRequests() {
  clearTimeout(joinSimTimer);
  if (!state.isHosting || !state.activeStreamId) return;

  const tick = () => {
    if (!state.isHosting || !state.activeStreamId) return;
    if (roomIsInPk()) {
      joinSimTimer = setTimeout(tick, 8000);
      return;
    }
    if (state.guestSeats.length < MAX_GUESTS && state.joinRequests.length < 5) {
      const pool = CHAT_VIEWERS.filter(
        (n) =>
          !state.guestSeats.some((g) => g.name === n) &&
          !state.joinRequests.some((r) => r.name === n)
      );
      if (pool.length) {
        const name = pickRandom(pool);
        state.joinRequests.push({ id: `req-${Date.now()}-${name}`, name, at: Date.now() });
        renderJoinRequests();
        updateLiveSocialButtons();
        showToast(`${name} requested to join`);
      }
    }
    joinSimTimer = setTimeout(tick, 14000 + Math.random() * 16000);
  };
  joinSimTimer = setTimeout(tick, 5000);
}

function formatPkRemain(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function fillPkLaneAvatar(el, name) {
  if (!el) return;
  const profile = getProfileData(name);
  setAvatarEl(el, {
    src: profile.avatar,
    name,
    color: profile.avatarColor,
  });
  if (!profile.avatar) el.textContent = initialsFrom(name);
  el.hidden = false;
}

export function syncPkMedia() {
  const arena = document.getElementById("pk-arena");
  if (!arena || !state.pk) return;

  const leftVideo = document.getElementById("pk-left-video");
  const leftAvatar = document.getElementById("pk-left-avatar");
  const leftBadge = document.getElementById("pk-left-cam-badge");
  const rightVideo = document.getElementById("pk-right-video");
  const rightAvatar = document.getElementById("pk-right-avatar");
  const rightBadge = document.getElementById("pk-right-cam-badge");

  // Full-stage cam/avatar hide while PK split is showing
  const fullCam = document.getElementById("live-camera-preview");
  if (fullCam) {
    fullCam.hidden = true;
  }
  document.getElementById("live-room-stage")?.classList.remove("has-camera");
  const center = document.getElementById("live-room-center");
  if (center) center.hidden = true;
  const avatarStage = document.getElementById("live-avatar-stage");
  if (avatarStage) avatarStage.hidden = true;

  const hostCamOn =
    state.isHosting &&
    state.mediaStream &&
    state.mediaStream.getVideoTracks().some((t) => t.enabled && t.readyState === "live");

  fillPkLaneAvatar(leftAvatar, state.pk.left);
  if (hostCamOn && leftVideo) {
    leftVideo.srcObject = state.mediaStream;
    leftVideo.hidden = false;
    if (leftAvatar) leftAvatar.hidden = true;
    if (leftBadge) {
      leftBadge.textContent = "Cam on";
      leftBadge.classList.add("is-on");
    }
    leftVideo.play?.().catch(() => {});
  } else {
    if (leftVideo) {
      leftVideo.srcObject = null;
      leftVideo.hidden = true;
    }
    if (leftAvatar) leftAvatar.hidden = false;
    if (leftBadge) {
      leftBadge.textContent = "Cam off";
      leftBadge.classList.remove("is-on");
    }
  }

  // Opponent: demo has no camera feed — profile photo under their name
  fillPkLaneAvatar(rightAvatar, state.pk.right);
  if (rightVideo) {
    rightVideo.srcObject = null;
    rightVideo.hidden = true;
  }
  if (rightAvatar) rightAvatar.hidden = false;
  if (rightBadge) {
    rightBadge.textContent = "Cam off";
    rightBadge.classList.remove("is-on");
  }
}

function wirePkTargetButtons(root) {
  root?.querySelectorAll("[data-pk-target]").forEach((btn) => {
    btn.classList.toggle("is-gift-target", state.giftTarget === btn.dataset.pkTarget);
  });
}

export function renderPkBar() {
  const bar = document.getElementById("pk-battle-bar");
  const arena = document.getElementById("pk-arena");
  const board = document.getElementById("pk-scoreboard");

  if (!state.pk) {
    if (bar) {
      bar.hidden = true;
      bar.innerHTML = "";
    }
    if (arena) arena.hidden = true;
    const leftVideo = document.getElementById("pk-left-video");
    if (leftVideo) {
      leftVideo.srcObject = null;
      leftVideo.hidden = true;
    }
    const center = document.getElementById("live-room-center");
    if (center) center.hidden = false;
    bridge.refreshLiveStage?.();
    return;
  }

  const { left, right, leftScore, rightScore, endsAt } = state.pk;
  const remain = endsAt - Date.now();
  const total = leftScore + rightScore;
  const leftPct = total > 0 ? Math.round((leftScore / total) * 100) : 50;

  if (bar) bar.hidden = true; // replaced by arena scoreboard
  if (arena) arena.hidden = false;

  if (board) {
    board.innerHTML = `
      <div class="pk-score-row">
        <span class="pk-score-chip pk-score-chip-left">${formatCoins(leftScore)} <small>pts</small></span>
        <div class="pk-timer-pill"><span class="pk-tag">PK</span> <span id="pk-timer">${formatPkRemain(remain)}</span></div>
        <span class="pk-score-chip pk-score-chip-right">${formatCoins(rightScore)} <small>pts</small></span>
      </div>
      <div class="pk-meter pk-meter-wide" aria-hidden="true">
        <div class="pk-meter-left" style="width:${leftPct}%"></div>
      </div>
    `;
  }

  const leftName = document.getElementById("pk-left-name");
  const rightName = document.getElementById("pk-right-name");
  if (leftName) {
    leftName.textContent = left;
    leftName.dataset.pkTarget = left;
  }
  if (rightName) {
    rightName.textContent = right;
    rightName.dataset.pkTarget = right;
  }

  wirePkTargetButtons(arena);
  syncPkMedia();
  renderGuestGrid();
}

function showPkResultBadges(winner, loser) {
  const leftBadge = document.getElementById("pk-left-result");
  const rightBadge = document.getElementById("pk-right-result");
  const pk = state.pk;
  if (!pk || !leftBadge || !rightBadge) return;

  const setBadge = (el, name) => {
    if (!winner) {
      el.hidden = false;
      el.className = "pk-result-badge is-draw";
      el.textContent = "DRAW";
      return;
    }
    if (name === winner) {
      el.hidden = false;
      el.className = "pk-result-badge is-win";
      el.textContent = "WIN";
    } else if (name === loser) {
      el.hidden = false;
      el.className = "pk-result-badge is-lose";
      el.textContent = "LOSE";
    }
  };

  setBadge(leftBadge, pk.left);
  setBadge(rightBadge, pk.right);
}

function clearPkResultBadges() {
  ["pk-left-result", "pk-right-result"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.hidden = true;
    el.textContent = "";
    el.className = "pk-result-badge";
  });
}

function endPk() {
  if (pkEnding || !state.pk) return;
  pkEnding = true;
  clearInterval(pkTickTimer);
  pkTickTimer = null;
  const pk = state.pk;

  let winner = null;
  let loser = null;
  // Highest gift points wins; lower score loses
  if (pk.leftScore > pk.rightScore) {
    winner = pk.left;
    loser = pk.right;
  } else if (pk.rightScore > pk.leftScore) {
    winner = pk.right;
    loser = pk.left;
  }

  showPkResultBadges(winner, loser);

  const finish = () => {
    state.pk = null;
    state.giftTarget = null;
    clearPkResultBadges();
    renderPkBar();
    renderGuestGrid();
    updateLiveSocialButtons();
    bridge.refreshLiveStage?.();
    bridge.renderLive?.();

    if (winner) {
      recordPkResult(winner, loser);
      bridge.appendLiveSystem?.(
        `PK over — ${winner} WINS (${formatCoins(Math.max(pk.leftScore, pk.rightScore))} pts) · ${loser} LOSE (${formatCoins(Math.min(pk.leftScore, pk.rightScore))} pts)`
      );
      showToast(`${winner} won the PK!`);
    } else {
      bridge.appendLiveSystem?.(
        `PK ended in a draw (${formatCoins(pk.leftScore)} pts each)`
      );
      showToast("PK draw — same gift points");
    }
  };

  // Show WIN / LOSE briefly on each camera panel
  setTimeout(() => {
    finish();
    pkEnding = false;
  }, 2800);
}

export function startPk(invitee, durationMs) {
  if (!state.isHosting) {
    showToast("Only the host can start a PK");
    return;
  }
  if (state.pk || pkEnding) {
    showToast("A PK is already running");
    return;
  }
  const left = hostName();
  const right = invitee;
  if (!right || right === left) {
    showToast("Pick someone to PK");
    return;
  }

  clearPkResultBadges();
  // Pending join requests are cancelled when PK starts
  if (state.joinRequests.length) {
    state.joinRequests = [];
    renderJoinRequests();
    closeJoinSheet();
    showToast("Join requests paused — PK started");
  }
  state.pk = {
    left,
    right,
    leftScore: 0,
    rightScore: 0,
    leftGifts: 0,
    rightGifts: 0,
    endsAt: Date.now() + durationMs,
    durationMs,
  };
  state.giftTarget = left;
  closePkSheet();
  renderPkBar();
  renderGuestGrid();
  updateLiveSocialButtons();
  bridge.renderLive?.();
  bridge.appendLiveSystem?.(
    `PK started: ${left} vs ${right} — gifts add points; most points wins · joins locked`
  );
  showToast(`PK started — guest joins locked until PK ends`);

  clearInterval(pkTickTimer);
  pkTickTimer = setInterval(() => {
    if (!state.pk) {
      clearInterval(pkTickTimer);
      return;
    }
    // Don't tick down during result splash
    if (document.getElementById("pk-left-result") && !document.getElementById("pk-left-result").hidden) {
      return;
    }
    const remain = state.pk.endsAt - Date.now();
    const timer = document.getElementById("pk-timer");
    if (timer) timer.textContent = formatPkRemain(remain);
    if (remain <= 0) endPk();
  }, 500);
}

export function applyGiftToPk(targetName, amount) {
  if (!state.pk || !amount) return false;
  const name = targetName || state.giftTarget || state.pk.left;
  if (name === state.pk.left) {
    state.pk.leftScore += amount;
    state.pk.leftGifts = (state.pk.leftGifts || 0) + 1;
    renderPkBar();
    return true;
  }
  if (name === state.pk.right) {
    state.pk.rightScore += amount;
    state.pk.rightGifts = (state.pk.rightGifts || 0) + 1;
    renderPkBar();
    return true;
  }
  // Fallback: if name doesn't match exactly, still try host side
  if (state.isHosting && (name === hostName() || name === myChatName())) {
    state.pk.leftScore += amount;
    state.pk.leftGifts = (state.pk.leftGifts || 0) + 1;
    renderPkBar();
    return true;
  }
  return false;
}

function openPkSheet() {
  if (!state.isHosting) return;
  if (state.pk) {
    showToast("PK already in progress");
    return;
  }

  const opponents = [
    ...state.guestSeats.map((g) => g.name),
    ...CHAT_VIEWERS.slice(0, 8),
  ].filter((n, i, arr) => n !== hostName() && arr.indexOf(n) === i);

  const list = document.getElementById("pk-opponent-list");
  const dur = document.getElementById("pk-duration-list");
  if (list) {
    list.innerHTML = opponents
      .map(
        (n) => `
      <button type="button" class="pk-pick${pendingPkInvitee === n ? " is-selected" : ""}" data-pk-invitee="${escapeHtml(n)}">
        ${escapeHtml(n)}
        <small>PK ${getPkStats(n).wins}W · ${getPkStats(n).losses}L</small>
      </button>`
      )
      .join("");
    list.querySelectorAll("[data-pk-invitee]").forEach((btn) => {
      btn.addEventListener("click", () => {
        pendingPkInvitee = btn.dataset.pkInvitee;
        openPkSheet();
      });
    });
  }
  if (dur) {
    dur.innerHTML = PK_DURATIONS.map(
      (d) => `
      <button type="button" class="chip pk-duration-chip" data-pk-ms="${d.ms}">${d.label}</button>`
    ).join("");
    dur.querySelectorAll("[data-pk-ms]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!pendingPkInvitee) {
          showToast("Pick an opponent first");
          return;
        }
        startPk(pendingPkInvitee, Number(btn.dataset.pkMs));
        pendingPkInvitee = null;
      });
    });
  }

  const sheet = document.getElementById("pk-sheet");
  if (sheet) sheet.hidden = false;
}

function closePkSheet() {
  const sheet = document.getElementById("pk-sheet");
  if (sheet) sheet.hidden = true;
}

export function calcWithdraw(coins) {
  const amount = Math.floor(Number(coins) || 0);
  const fee = Math.ceil(amount * WITHDRAW_FEE_RATE);
  const net = Math.max(0, amount - fee);
  return { amount, fee, net, pesos: net };
}

export function submitWithdraw(coins) {
  if (!requireAuth("withdraw coins")) return false;
  const { amount, fee, pesos } = calcWithdraw(coins);
  if (amount < WITHDRAW_MIN) {
    showToast(`Minimum withdraw is ${formatCoins(WITHDRAW_MIN)} coins`);
    return false;
  }
  if (amount > state.coins) {
    showToast("Not enough coins");
    return false;
  }
  state.coins -= amount;
  state.totalWithdrawn = (state.totalWithdrawn || 0) + pesos;
  saveSession();
  bridge.updateHeader?.();
  showToast(`Withdrew PHP ${formatCoins(pesos)} (fee ${formatCoins(fee)} coins)`);
  return true;
}

export function onLiveRoomOpened() {
  renderGuestGrid();
  renderPkBar();
  updateLiveSocialButtons();
  if (state.isHosting) scheduleSimulatedJoinRequests();
}

export function onLiveRoomClosed() {
  resetLiveSocial();
}

export function initGuests() {
  document.getElementById("btn-request-join")?.addEventListener("click", requestToJoin);
  document.getElementById("btn-leave-seat")?.addEventListener("click", leaveGuestSeat);
  document.getElementById("btn-open-join-requests")?.addEventListener("click", openJoinSheet);
  document.getElementById("btn-close-join-requests")?.addEventListener("click", closeJoinSheet);
  document.getElementById("join-request-backdrop")?.addEventListener("click", closeJoinSheet);
  document.getElementById("btn-open-pk")?.addEventListener("click", openPkSheet);
  document.getElementById("btn-close-pk")?.addEventListener("click", closePkSheet);
  document.getElementById("pk-backdrop")?.addEventListener("click", closePkSheet);

  document.getElementById("pk-arena")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-pk-target]");
    if (!btn || !state.pk) return;
    state.giftTarget = btn.dataset.pkTarget;
    wirePkTargetButtons(document.getElementById("pk-arena"));
    showToast(`Gifts will go to ${state.giftTarget}`);
  });

  const withdrawForm = document.getElementById("form-withdraw");
  const withdrawInput = document.getElementById("withdraw-amount");
  const withdrawPreview = document.getElementById("withdraw-preview");

  const refreshPreview = () => {
    if (!withdrawPreview || !withdrawInput) return;
    const { amount, fee, pesos } = calcWithdraw(withdrawInput.value);
    if (!amount) {
      withdrawPreview.textContent = `Min ${formatCoins(WITHDRAW_MIN)} coins · 5% fee`;
      return;
    }
    withdrawPreview.textContent = `${formatCoins(amount)} coins − ${formatCoins(fee)} fee (5%) = PHP ${formatCoins(pesos)}`;
  };

  withdrawInput?.addEventListener("input", refreshPreview);
  withdrawForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (submitWithdraw(withdrawInput?.value)) {
      withdrawInput.value = "";
      refreshPreview();
      bridge.renderMyProfile?.();
    }
  });
  refreshPreview();
}
