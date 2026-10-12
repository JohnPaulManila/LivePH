import {
  applyGiftToPk,
  initGuests,
  onLiveRoomClosed,
  onLiveRoomOpened,
  syncPkMedia,
} from "./guests.js";
import {
  CHAT_LINES,
  CHAT_VIEWERS,
  DEMO_PK_LIVES,
  GIFT_LIST,
  LIVE_STREAMS,
} from "./data.js";
import {
  applyVipBadgeEl,
  bridge,
  currentPanelName,
  els,
  escapeHtml,
  formatCoins,
  getProfileData,
  getVipLevelFor,
  initialsFrom,
  isUserOnline,
  myChatName,
  pickRandom,
  publicName,
  recordReceivedGift,
  requireAuth,
  saveSession,
  setAvatarEl,
  setPresenceEl,
  showToast,
  state,
  updateHeader,
  vipBadgeHtml,
} from "./core.js";

function allStreams() {
  return state.myLive ? [state.myLive, ...LIVE_STREAMS] : [...LIVE_STREAMS];
}

function findStream(streamId) {
  return allStreams().find((s) => s.id === streamId);
}

/** PK match info for a stream (your live or demo PK rooms). */
export function getPkMatchForStream(stream) {
  if (!stream) return null;
  if (state.myLive && stream.id === state.myLive.id && state.pk) {
    return {
      left: state.pk.left,
      right: state.pk.right,
      live: true,
    };
  }
  const demo = DEMO_PK_LIVES.find((p) => p.streamId === stream.id);
  return demo ? { left: demo.left, right: demo.right, live: true } : null;
}

export function isStreamInPk(streamOrId) {
  const stream =
    typeof streamOrId === "string" ? findStream(streamOrId) : streamOrId;
  return Boolean(getPkMatchForStream(stream));
}

export function isActiveLiveInPk() {
  if (state.pk) return true;
  return isStreamInPk(state.activeStreamId);
}

function stopChatSimulation() {
  if (state.chatTimer) {
    clearTimeout(state.chatTimer);
    state.chatTimer = null;
  }
}

function appendChatMessage({ name, text, kind = "viewer" }) {
  const row = document.createElement("div");
  row.className = `chat-bubble is-${kind}`;

  if (kind === "system") {
    row.textContent = text;
  } else {
    const online = isUserOnline(name);
    const vip = getVipLevelFor(name);
    const clickable = kind !== "me";
    const who = document.createElement(clickable ? "button" : "span");
    who.className = "who";
    if (clickable) who.type = "button";
    who.innerHTML = `<span class="presence-dot ${online ? "is-online" : "is-offline"}" aria-hidden="true"></span>${escapeHtml(name)}${vipBadgeHtml(vip)}`;
    if (clickable) {
      who.title = `View ${name}`;
      who.addEventListener("click", (e) => {
        e.stopPropagation();
        bridge.openProfile?.(name);
      });
    }
    row.appendChild(who);
    row.appendChild(document.createTextNode(` ${text}`));
  }

  els.chatList.appendChild(row);
  while (els.chatList.children.length > 40) {
    els.chatList.firstElementChild.remove();
  }
  els.chatList.scrollTop = els.chatList.scrollHeight;
}

function scheduleSimulatedChat(stream) {
  stopChatSimulation();

  const tick = () => {
    if (!state.activeStreamId) return;

    const roll = Math.random();
    if (roll < 0.12) {
      appendChatMessage({
        name: stream.host,
        text: pickRandom([
          "Thanks for joining!",
          "Don't forget to follow",
          "Appreciate the gifts",
          "Chat with me!",
        ]),
        kind: "host",
      });
    } else if (roll < 0.2) {
      if (state.settings.giftAlerts) {
        appendChatMessage({
          name: pickRandom(CHAT_VIEWERS),
          text: `sent a ${pickRandom(["Rose", "Star", "Heart"])}`,
          kind: "gift",
        });
      }
    } else {
      appendChatMessage({
        name: pickRandom(CHAT_VIEWERS),
        text: pickRandom(CHAT_LINES),
        kind: "viewer",
      });
    }

    state.chatTimer = setTimeout(tick, 1800 + Math.random() * 2800);
  };

  state.chatTimer = setTimeout(tick, 900);
}

function startLiveChat(stream) {
  els.chatList.innerHTML = "";
  if (els.chatInput) els.chatInput.value = "";

  appendChatMessage({
    text: `Welcome to ${stream.host}'s live.`,
    kind: "system",
  });
  appendChatMessage({
    name: stream.host,
    text: "Thanks for watching — drop a message!",
    kind: "host",
  });
  appendChatMessage({
    name: pickRandom(CHAT_VIEWERS),
    text: pickRandom(CHAT_LINES),
    kind: "viewer",
  });

  scheduleSimulatedChat(stream);
}

function sendChatMessage(raw) {
  const text = String(raw || "").trim();
  if (!text || !state.activeStreamId) return;

  appendChatMessage({
    name: myChatName(),
    text,
    kind: "me",
  });
}

function closeGiftSheet() {
  els.giftSheet.hidden = true;
}

function closeRechargePopup() {
  els.rechargePopup.hidden = true;
}

function showRechargePopup(gift) {
  const need = Math.max(0, gift.cost - state.coins);
  els.rechargePopupNeed.textContent = `${gift.name} costs ${formatCoins(gift.cost)} coins. You have ${formatCoins(state.coins)} · need ${formatCoins(need)} more.`;
  els.rechargePopup.hidden = false;
}

function openGiftSheet() {
  if (!state.activeStreamId) return;
  els.giftSheetBalance.textContent = `${formatCoins(state.coins)} coins`;
  els.giftList.innerHTML = GIFT_LIST.map(
    (g) => `
    <button type="button" class="gift-pick${state.coins < g.cost ? " is-locked" : ""}" data-gift-id="${g.id}">
      <span class="gift-pick-name">${escapeHtml(g.name)}</span>
      <span class="gift-pick-desc">${escapeHtml(g.desc)}</span>
      <span class="gift-pick-price">${formatCoins(g.cost)} coins</span>
    </button>`
  ).join("");

  els.giftList.querySelectorAll("[data-gift-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const gift = GIFT_LIST.find((g) => g.id === btn.dataset.giftId);
      if (gift) sendGift(gift);
    });
  });

  els.giftSheet.hidden = false;
}

function sendGift(gift) {
  if (!state.activeStreamId || !gift) return;

  if (state.coins < gift.cost) {
    showRechargePopup(gift);
    return;
  }

  state.coins -= gift.cost;
  const stream = findStream(state.activeStreamId);

  // During PK: gift goes to selected side (or host by default) and adds points
  let target = null;
  if (state.pk) {
    target = state.giftTarget || state.pk.left || stream?.host || null;
  } else {
    target = stream?.host || null;
  }
  if (!target) {
    state.coins += gift.cost;
    showToast("Could not find gift recipient");
    return;
  }

  const scored = Boolean(state.pk && bridge.applyGiftToPk?.(target, gift.cost));
  recordReceivedGift(target, gift.id, 1);
  saveSession();
  updateHeader();
  closeGiftSheet();

  appendChatMessage({
    name: myChatName(),
    text: scored
      ? `sent a ${gift.name} to ${target} · +${formatCoins(gift.cost)} PK pts`
      : `sent a ${gift.name} to ${target}`,
    kind: "gift",
  });
  showToast(
    scored
      ? `+${formatCoins(gift.cost)} pts for ${target}`
      : `Sent ${gift.name} to ${target} — saved on their profile`
  );
}

function stopMediaTracks() {
  stopSpeakingMonitor();
  if (state.mediaStream) {
    state.mediaStream.getTracks().forEach((track) => track.stop());
    state.mediaStream = null;
  }
  if (els.liveCameraPreview) {
    els.liveCameraPreview.srcObject = null;
    els.liveCameraPreview.hidden = true;
  }
  if (els.liveRoomStage) {
    els.liveRoomStage.classList.remove("has-camera");
  }
}

function attachCameraPreview(stream) {
  if (!els.liveCameraPreview || !stream) return;
  els.liveCameraPreview.srcObject = stream;
  els.liveCameraPreview.hidden = false;
  els.liveRoomStage?.classList.add("has-camera");
  els.liveCameraPreview.play?.().catch(() => {});
}

function hasLiveCamera() {
  if (!state.isHosting || !state.mediaStream) return false;
  return state.mediaStream.getVideoTracks().some((t) => t.enabled && t.readyState === "live");
}

function hasLiveMic() {
  if (state.isHosting && state.mediaStream) {
    return state.mediaStream.getAudioTracks().some((t) => t.enabled && t.readyState === "live");
  }
  // Demo streams: treat as mic-on audio live
  return Boolean(state.activeStreamId);
}

let speakRaf = null;
let speakAudioCtx = null;
let speakAnalyser = null;
let speakSource = null;
let speakSimTimer = null;

function setSpeaking(on) {
  els.liveAvatarStage?.classList.toggle("is-speaking", Boolean(on));
}

function stopSpeakingMonitor() {
  if (speakRaf) {
    cancelAnimationFrame(speakRaf);
    speakRaf = null;
  }
  if (speakSimTimer) {
    clearTimeout(speakSimTimer);
    speakSimTimer = null;
  }
  try {
    speakSource?.disconnect();
  } catch {
    /* ignore */
  }
  speakSource = null;
  speakAnalyser = null;
  if (speakAudioCtx) {
    speakAudioCtx.close().catch(() => {});
    speakAudioCtx = null;
  }
  setSpeaking(false);
}

function startSimulatedSpeaking() {
  stopSpeakingMonitor();
  const tick = () => {
    if (!state.activeStreamId || hasLiveCamera()) return;
    setSpeaking(true);
    speakSimTimer = setTimeout(() => {
      setSpeaking(false);
      speakSimTimer = setTimeout(tick, 900 + Math.random() * 2200);
    }, 700 + Math.random() * 1600);
  };
  speakSimTimer = setTimeout(tick, 600);
}

function startMicSpeakingMonitor(mediaStream) {
  stopSpeakingMonitor();
  const audioTracks = mediaStream?.getAudioTracks?.().filter((t) => t.enabled) || [];
  if (!audioTracks.length || !(window.AudioContext || window.webkitAudioContext)) {
    startSimulatedSpeaking();
    return;
  }

  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    speakAudioCtx = new Ctx();
    speakAnalyser = speakAudioCtx.createAnalyser();
    speakAnalyser.fftSize = 256;
    speakAnalyser.smoothingTimeConstant = 0.7;
    speakSource = speakAudioCtx.createMediaStreamSource(mediaStream);
    speakSource.connect(speakAnalyser);
    const data = new Uint8Array(speakAnalyser.frequencyBinCount);

    const loop = () => {
      if (!state.activeStreamId || hasLiveCamera()) {
        setSpeaking(false);
        speakRaf = requestAnimationFrame(loop);
        return;
      }
      speakAnalyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i += 1) sum += data[i];
      const avg = sum / data.length;
      setSpeaking(avg > 18);
      speakRaf = requestAnimationFrame(loop);
    };
    speakAudioCtx.resume?.().catch(() => {});
    speakRaf = requestAnimationFrame(loop);
  } catch {
    startSimulatedSpeaking();
  }
}

function updateLiveStageVisual(stream) {
  if (state.pk) {
    syncPkMedia();
    return;
  }

  const center = document.getElementById("live-room-center");
  if (center) center.hidden = false;

  const cameraOn = hasLiveCamera();
  const micOn = hasLiveMic();
  const showAvatar = !cameraOn && micOn;

  if (els.liveRoomTitle) {
    els.liveRoomTitle.hidden = true;
    els.liveRoomTitle.textContent = "";
  }

  els.liveRoomCenter?.classList.toggle("is-empty", cameraOn);
  els.liveRoomCenter?.classList.toggle("has-avatar", showAvatar);

  if (cameraOn) {
    stopSpeakingMonitor();
    if (els.liveAvatarStage) els.liveAvatarStage.hidden = true;
    if (state.mediaStream) attachCameraPreview(state.mediaStream);
    return;
  }

  if (!showAvatar) {
    stopSpeakingMonitor();
    if (els.liveAvatarStage) els.liveAvatarStage.hidden = true;
    return;
  }

  const profile = getProfileData(stream.host);
  if (els.liveHostAvatar) {
    setAvatarEl(els.liveHostAvatar, {
      src: profile.avatar,
      name: stream.host,
      color: profile.avatarColor,
    });
    if (!profile.avatar) {
      els.liveHostAvatar.textContent = initialsFrom(stream.host);
    }
  }
  if (els.liveSpeakLabel) {
    els.liveSpeakLabel.innerHTML = `<span class="live-mic-dot" aria-hidden="true"></span> Mic on`;
  }
  if (els.liveAvatarStage) els.liveAvatarStage.hidden = false;

  if (state.isHosting && state.mediaStream) {
    startMicSpeakingMonitor(state.mediaStream);
  } else {
    startSimulatedSpeaking();
  }
}

function mediaErrorMessage(err) {
  const name = err?.name || "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Camera or microphone permission was denied. Allow access in your browser, then try again.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No camera or microphone was found on this device.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "Camera or mic is already in use by another app. Close it and try again.";
  }
  if (!window.isSecureContext && location.protocol !== "https:") {
    return "Camera access needs a secure page (localhost or HTTPS).";
  }
  return err?.message || "Could not access camera and microphone.";
}

function showMediaPermissionPopup(message) {
  if (els.mediaPermissionDesc) els.mediaPermissionDesc.textContent = message;
  if (els.mediaPermissionPopup) els.mediaPermissionPopup.hidden = false;
}

function closeMediaPermissionPopup() {
  if (els.mediaPermissionPopup) els.mediaPermissionPopup.hidden = true;
}

async function requestCameraAndMic() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("This browser does not support camera and microphone access.");
  }
  return navigator.mediaDevices.getUserMedia({
    audio: true,
    video: {
      facingMode: "user",
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  });
}

export function openLiveRoom(streamId, fromPanel) {
  if (!requireAuth("watch live")) return;
  const stream = findStream(streamId);
  if (!stream) {
    showToast("This live is unavailable");
    return;
  }

  state.activeStreamId = stream.id;
  state.isHosting = Boolean(state.myLive && state.myLive.id === stream.id);
  state.returnPanel = fromPanel || currentPanelName();

  els.liveRoomName.textContent = stream.host;
  els.liveRoomHandle.textContent = stream.handle || "";
  els.liveRoomViewers.textContent = `${formatCoins(stream.viewers)} watching`;
  els.liveRoomStage.style.setProperty("--a", stream.a);
  els.liveRoomStage.style.setProperty("--b", stream.b);
  setPresenceEl(els.liveRoomPresence, isUserOnline(stream.host) || state.isHosting);
  applyVipBadgeEl(els.liveRoomVip, getVipLevelFor(stream.host));
  els.liveRoomHostBtn.dataset.peer = stream.host;

  clearHostingBannerTimer();
  if (els.hostingBanner) {
    els.hostingBanner.classList.remove("is-fading");
    if (state.isHosting) {
      els.hostingBanner.hidden = false;
      hostingBannerTimer = setTimeout(() => {
        if (!els.hostingBanner || !state.isHosting) return;
        els.hostingBanner.classList.add("is-fading");
        hostingBannerTimer = setTimeout(() => {
          if (els.hostingBanner) els.hostingBanner.hidden = true;
          els.hostingBanner?.classList.remove("is-fading");
          hostingBannerTimer = null;
        }, 400);
      }, 2800);
    } else {
      els.hostingBanner.hidden = true;
    }
  }

  // Host camera / avatar stage (no big title text in the middle)
  if (els.btnOpenGifts) els.btnOpenGifts.hidden = state.isHosting;
  if (els.btnCloseLive) {
    els.btnCloseLive.textContent = state.isHosting ? "End Live" : "← Back";
    els.btnCloseLive.setAttribute("aria-label", state.isHosting ? "End live" : "Leave live");
  }

  const hostControls = document.getElementById("host-live-controls");
  const camBtn = document.getElementById("btn-toggle-camera");
  if (hostControls) hostControls.hidden = !state.isHosting;
  if (camBtn && state.isHosting && state.mediaStream) {
    const camOn = state.mediaStream.getVideoTracks().some((t) => t.enabled);
    camBtn.textContent = camOn ? "Cam on" : "Cam off";
    camBtn.setAttribute("aria-pressed", camOn ? "true" : "false");
  }

  if (state.isHosting && state.mediaStream) {
    const camOn = state.mediaStream.getVideoTracks().some((t) => t.enabled);
    if (camOn) {
      attachCameraPreview(state.mediaStream);
    } else {
      if (els.liveCameraPreview) {
        els.liveCameraPreview.hidden = true;
        els.liveCameraPreview.srcObject = null;
      }
      els.liveRoomStage?.classList.remove("has-camera");
    }
  } else {
    if (els.liveCameraPreview) {
      els.liveCameraPreview.hidden = true;
      els.liveCameraPreview.srcObject = null;
    }
    els.liveRoomStage?.classList.remove("has-camera");
  }

  updateLiveStageVisual(stream);

  els.liveRoom.hidden = false;
  document.body.classList.add("live-room-open");
  startLiveChat(stream);
  onLiveRoomOpened();
  const pkMatch = getPkMatchForStream(stream);
  if (state.isHosting) {
    showToast(state.pk ? "You are in PK — joins locked" : "You are now live!");
  } else if (pkMatch) {
    showToast(`PK live: ${pkMatch.left} vs ${pkMatch.right} · joins locked`);
  } else {
    showToast(`Joined ${stream.host}'s live`);
  }
}

export function closeLiveRoom({ silent = false } = {}) {
  if (els.liveRoom.hidden && !state.activeStreamId) return;

  const wasHosting = state.isHosting;
  const backTo = state.returnPanel || "home";
  state.activeStreamId = null;
  state.isHosting = false;
  clearHostingBannerTimer();
  if (wasHosting) {
    state.myLive = null;
    stopMediaTracks();
    renderLive();
  }
  stopSpeakingMonitor();
  stopChatSimulation();
  onLiveRoomClosed();
  bridge.closeDm?.();
  bridge.closeProfile?.();
  closeGiftSheet();
  closeRechargePopup();
  closeGoLiveSheet();
  closeMediaPermissionPopup();
  els.liveRoom.hidden = true;
  document.body.classList.remove("live-room-open");
  if (els.hostingBanner) {
    els.hostingBanner.hidden = true;
    els.hostingBanner.classList.remove("is-fading");
  }
  const hostControls = document.getElementById("host-live-controls");
  if (hostControls) hostControls.hidden = true;
  if (els.liveAvatarStage) {
    els.liveAvatarStage.hidden = true;
    els.liveAvatarStage.classList.remove("is-speaking");
  }
  if (els.liveRoomTitle) {
    els.liveRoomTitle.hidden = true;
    els.liveRoomTitle.textContent = "";
  }
  els.liveRoomCenter?.classList.remove("is-empty", "has-avatar");
  if (els.btnOpenGifts) els.btnOpenGifts.hidden = false;
  if (els.btnCloseLive) {
    els.btnCloseLive.textContent = "← Back";
    els.btnCloseLive.setAttribute("aria-label", "Leave live");
  }

  if (!silent) {
    Object.entries(els.panels).forEach(([key, panel]) => {
      const on = key === backTo;
      panel.hidden = !on;
      panel.classList.toggle("is-active", on);
    });
    els.navItems.forEach((item) => {
      const on = item.dataset.nav === backTo;
      item.classList.toggle("is-active", on);
      if (on) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
    els.topbarTitle.textContent =
      { home: "News Feed", live: "Live", chat: "Chat", profile: "Profile", recharge: "Recharge", settings: "Settings" }[
        backTo
      ] || "LivePH";
    if (wasHosting) showToast("Live ended — camera & mic turned off");
  }
}

function openGoLiveSheet() {
  if (!requireAuth("go live")) return;
  if (state.myLive && state.mediaStream) {
    openLiveRoom(state.myLive.id, "live");
    return;
  }
  if (els.goLiveTitleInput) {
    els.goLiveTitleInput.value = `${myChatName()}'s live`;
  }
  els.goLiveSheet.hidden = false;
}

function closeGoLiveSheet() {
  if (els.goLiveSheet) els.goLiveSheet.hidden = true;
}

let pendingLiveSetup = null;
let hostingBannerTimer = null;

function clearHostingBannerTimer() {
  if (hostingBannerTimer) {
    clearTimeout(hostingBannerTimer);
    hostingBannerTimer = null;
  }
}

const LIVE_FILTERS = [
  { id: "all", label: "All", icon: "◉" },
  { id: "pk", label: "PK Live", icon: "⚔" },
  { id: "music", label: "Music", icon: "♪" },
  { id: "gaming", label: "Gaming", icon: "▶" },
  { id: "chat", label: "Chat", icon: "◎" },
];

function countByFilter(source) {
  const counts = { all: source.length, pk: 0, music: 0, gaming: 0, chat: 0 };
  source.forEach((s) => {
    if (counts[s.category] != null) counts[s.category] += 1;
    if (isStreamInPk(s)) counts.pk += 1;
  });
  return counts;
}

function updateLiveFilters(source) {
  const bar = document.getElementById("live-filters");
  if (!bar) return;
  const counts = countByFilter(source);
  bar.innerHTML = LIVE_FILTERS.map((f) => {
    const active = state.liveFilter === f.id ? " is-active" : "";
    return `
      <button type="button" class="chip live-filter-chip${active}" data-live-filter="${f.id}" role="tab" aria-selected="${state.liveFilter === f.id}">
        <span class="chip-icon" aria-hidden="true">${f.icon}</span>
        <span class="chip-label">${f.label}</span>
        <span class="chip-count">${counts[f.id] ?? 0}</span>
      </button>`;
  }).join("");

  bar.querySelectorAll("[data-live-filter]").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.liveFilter = chip.dataset.liveFilter;
      renderLive();
    });
  });
}

async function startMyLive(title, category) {
  if (!requireAuth("go live")) return;
  const submitBtn = els.formGoLive?.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Requesting camera & mic…";
  }

  pendingLiveSetup = { title, category };

  try {
    stopMediaTracks();
    showToast("Allow camera and microphone access…");
    const media = await requestCameraAndMic();
    state.mediaStream = media;

    const host = publicName(state.user) || myChatName();
    const stream = {
      id: "my-live",
      host,
      handle: `@${state.user?.username || "me"}`,
      title: title || `${host}'s live`,
      category: category || "chat",
      viewers: 1,
      a: "#ff5a4f",
      b: "#f0c27a",
    };
    state.myLive = stream;
    pendingLiveSetup = null;
    closeGoLiveSheet();
    closeMediaPermissionPopup();
    renderLive();
    openLiveRoom(stream.id, "live");
  } catch (err) {
    stopMediaTracks();
    state.myLive = null;
    const message = mediaErrorMessage(err);
    showMediaPermissionPopup(message);
    showToast("Camera / mic permission needed to go live");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Allow camera & Start Live";
    }
  }
}

export function renderLive() {
  const source = allStreams();
  updateLiveFilters(source);

  const list =
    state.liveFilter === "all"
      ? source
      : state.liveFilter === "pk"
        ? source.filter((s) => isStreamInPk(s))
        : source.filter((s) => s.category === state.liveFilter);

  if (els.btnGoLive) {
    els.btnGoLive.textContent = state.myLive ? "Resume Live" : "Go Live";
  }

  const empty = document.getElementById("live-empty");
  if (empty) {
    empty.hidden = list.length > 0;
    empty.textContent =
      state.liveFilter === "pk"
        ? "No PK lives right now."
        : "No lives in this category right now.";
  }

  els.liveGrid.innerHTML = list
    .map((s) => {
      const vip = getVipLevelFor(s.host);
      const mine = state.myLive && s.id === state.myLive.id;
      const pk = getPkMatchForStream(s);
      return `
      <button type="button" class="live-card${mine ? " is-mine" : ""}${pk ? " is-pk" : ""}" data-stream="${s.id}">
        <div class="live-thumb" style="--a:${s.a};--b:${s.b}">
          <span class="live-badge">${mine ? "You" : "Live"}</span>
          ${pk ? `<span class="live-pk-badge">PK</span>` : ""}
          <span class="viewers">${formatCoins(s.viewers)} watching</span>
          <span class="host">${s.host}${vip > 0 ? ` <span class="vip-badge vip-${Math.min(vip, 10)}">VIP${vip}</span>` : ""}</span>
        </div>
        <div class="live-info">
          <p>${pk ? `PK: ${pk.left} vs ${pk.right}` : s.title}</p>
          <span class="cat">${pk ? "pk live" : s.category}</span>
        </div>
      </button>`;
    })
    .join("");

  els.liveGrid.querySelectorAll("[data-stream]").forEach((card) => {
    card.addEventListener("click", () => openLiveRoom(card.dataset.stream, "live"));
  });
}

export function initLive() {
  bridge.openLiveRoom = openLiveRoom;
  bridge.closeLiveRoom = closeLiveRoom;
  bridge.appendLiveSystem = (text) => appendChatMessage({ text, kind: "system" });
  bridge.applyGiftToPk = applyGiftToPk;
  bridge.updateHeader = updateHeader;
  bridge.renderLive = renderLive;
  bridge.refreshLiveStage = () => {
    const stream = findStream(state.activeStreamId);
    if (stream) updateLiveStageVisual(stream);
  };

  initGuests();

  els.btnCloseLive.addEventListener("click", () => closeLiveRoom());

  document.getElementById("btn-toggle-camera")?.addEventListener("click", () => {
    if (!state.isHosting || !state.mediaStream) return;
    const tracks = state.mediaStream.getVideoTracks();
    if (!tracks.length) {
      showToast("No camera track available");
      return;
    }
    const next = !tracks.some((t) => t.enabled);
    tracks.forEach((t) => {
      t.enabled = next;
    });
    const camBtn = document.getElementById("btn-toggle-camera");
    if (camBtn) {
      camBtn.textContent = next ? "Cam on" : "Cam off";
      camBtn.setAttribute("aria-pressed", next ? "true" : "false");
    }
    const stream = findStream(state.activeStreamId);
    if (state.pk) {
      syncPkMedia();
    } else if (next) {
      attachCameraPreview(state.mediaStream);
      if (stream) updateLiveStageVisual(stream);
    } else {
      if (els.liveCameraPreview) {
        els.liveCameraPreview.hidden = true;
      }
      els.liveRoomStage?.classList.remove("has-camera");
      if (stream) updateLiveStageVisual(stream);
    }
    showToast(next ? "Camera on" : "Camera off — profile photo shown");
  });

  els.chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sendChatMessage(els.chatInput.value);
    els.chatInput.value = "";
    els.chatInput.focus();
  });

  els.btnOpenGifts.addEventListener("click", openGiftSheet);
  els.btnCloseGifts.addEventListener("click", closeGiftSheet);
  els.giftBackdrop.addEventListener("click", closeGiftSheet);

  els.btnRechargePopupCancel.addEventListener("click", closeRechargePopup);
  els.btnRechargePopupGo.addEventListener("click", () => {
    closeRechargePopup();
    closeGiftSheet();
    closeLiveRoom({ silent: true });
    bridge.showPanel("recharge");
  });

  els.btnGoLive?.addEventListener("click", openGoLiveSheet);
  els.btnCloseGoLive?.addEventListener("click", closeGoLiveSheet);
  els.goLiveBackdrop?.addEventListener("click", closeGoLiveSheet);
  els.formGoLive?.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = els.goLiveTitleInput.value.trim();
    const category = els.goLiveCategory.value;
    if (!title) {
      showToast("Add a live title");
      return;
    }
    startMyLive(title, category);
  });

  els.btnMediaPermissionClose?.addEventListener("click", () => {
    closeMediaPermissionPopup();
    pendingLiveSetup = null;
  });
  els.btnMediaPermissionRetry?.addEventListener("click", () => {
    closeMediaPermissionPopup();
    const title = pendingLiveSetup?.title || els.goLiveTitleInput?.value.trim() || `${myChatName()}'s live`;
    const category = pendingLiveSetup?.category || els.goLiveCategory?.value || "chat";
    startMyLive(title, category);
  });

  function openHostProfile() {
    if (state.isHosting) return;
    const peer = els.liveRoomHostBtn?.dataset.peer;
    if (peer) bridge.openProfile?.(peer);
  }

  els.liveRoomHostBtn?.addEventListener("click", openHostProfile);
  els.liveRoomHostBtn?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openHostProfile();
    }
  });
}
