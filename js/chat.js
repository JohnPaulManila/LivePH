import { DM_REPLY_LINES } from "./data.js";
import {
  applyVipBadgeEl,
  bridge,
  dmThreadKey,
  els,
  escapeHtml,
  formatInboxTime,
  getVipLevelFor,
  initialsFrom,
  isBlocked,
  isUserOnline,
  myChatName,
  peerFromThreadKey,
  pickRandom,
  requireAuth,
  saveDmThreads,
  setPresenceEl,
  showToast,
  state,
  vipBadgeHtml,
} from "./core.js";

function stopDmReply() {
  if (state.dmReplyTimer) {
    clearTimeout(state.dmReplyTimer);
    state.dmReplyTimer = null;
  }
}

function renderDmMessages(peerName) {
  const key = dmThreadKey(peerName);
  const messages = state.dmThreads[key] || [];
  els.dmList.innerHTML = "";

  if (!messages.length) {
    const empty = document.createElement("div");
    empty.className = "dm-bubble is-system";
    empty.textContent = `Start a private chat with ${peerName}. Only the two of you can see it.`;
    els.dmList.appendChild(empty);
    return;
  }

  messages.forEach((msg) => {
    const bubble = document.createElement("div");
    bubble.className = `dm-bubble is-${msg.from === "me" ? "me" : msg.from === "system" ? "system" : "them"}`;
    bubble.textContent = msg.text;
    els.dmList.appendChild(bubble);
  });
  els.dmList.scrollTop = els.dmList.scrollHeight;
}

export function pushDmMessage(peerName, from, text) {
  const key = dmThreadKey(peerName);
  if (!state.dmThreads[key]) state.dmThreads[key] = [];
  state.dmThreads[key].push({
    from,
    text,
    at: Date.now(),
    peer: peerName,
  });
  if (state.dmThreads[key].length > 100) {
    state.dmThreads[key] = state.dmThreads[key].slice(-100);
  }
  saveDmThreads();
  if (state.dmPeer === peerName) renderDmMessages(peerName);
  if (!els.panels.chat.hidden) renderInbox();
}

export function openDm(peerName) {
  if (!requireAuth("send messages")) return;
  const name = String(peerName || "").trim();
  if (!name) return;
  if (name === myChatName()) {
    showToast("That's you");
    return;
  }
  if (isBlocked(name)) {
    showToast(`${name} is blocked. Unblock them in Settings.`);
    return;
  }
  if (!state.settings.allowDms) {
    showToast("Private messages are turned off in Settings");
    return;
  }

  state.dmPeer = name;
  const online = isUserOnline(name);
  els.dmPeerName.textContent = name;
  applyVipBadgeEl(els.dmPeerVip, getVipLevelFor(name));
  setPresenceEl(els.dmPeerPresence, online);
  els.dmInput.disabled = false;
  els.dmInput.placeholder = online
    ? "Private message…"
    : "User is offline — you can still leave a message";
  renderDmMessages(name);
  els.dmSheet.hidden = false;
  els.dmInput.focus();
}

export function closeDm() {
  stopDmReply();
  state.dmPeer = null;
  els.dmSheet.hidden = true;
}

function sendDmMessage(raw) {
  const text = String(raw || "").trim();
  const peer = state.dmPeer;
  if (!text || !peer) return;

  pushDmMessage(peer, "me", text);

  const online = isUserOnline(peer);
  if (!online) {
    pushDmMessage(peer, "system", `${peer} is offline. They’ll see this when they’re back.`);
    return;
  }

  stopDmReply();
  state.dmReplyTimer = setTimeout(() => {
    if (state.dmPeer !== peer) return;
    pushDmMessage(peer, "them", pickRandom(DM_REPLY_LINES));
  }, 900 + Math.random() * 1600);
}

export function renderInbox() {
  const threads = Object.entries(state.dmThreads)
    .map(([key, messages]) => {
      const storedPeer = messages.find((m) => m.peer)?.peer;
      const peer = storedPeer || peerFromThreadKey(key);
      if (isBlocked(peer)) return null;
      const last =
        [...messages].reverse().find((m) => m.from !== "system") ||
        messages[messages.length - 1];
      return {
        key,
        peer,
        preview: last?.text || "No messages yet",
        at: last?.at || 0,
        online: isUserOnline(peer),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.at - a.at);

  if (!threads.length) {
    els.inboxList.innerHTML = `
        <div class="inbox-empty">
          No private chats yet.<br />
          Tap a name in a live to start a DM.
        </div>`;
    return;
  }

  els.inboxList.innerHTML = threads
    .map(
      (t) => `
      <button type="button" class="inbox-item" data-peer="${escapeHtml(t.peer)}">
        <div class="inbox-ava">
          ${escapeHtml(initialsFrom(t.peer))}
          <span class="presence-dot ${t.online ? "is-online" : "is-offline"}" aria-hidden="true"></span>
        </div>
        <div class="inbox-meta">
          <strong>${escapeHtml(t.peer)} ${vipBadgeHtml(getVipLevelFor(t.peer))}</strong>
          <p>${escapeHtml(t.preview)}</p>
        </div>
        <span class="inbox-time">${formatInboxTime(t.at)}</span>
      </button>`
    )
    .join("");

  els.inboxList.querySelectorAll("[data-peer]").forEach((btn) => {
    btn.addEventListener("click", () => openDm(btn.dataset.peer));
  });
}

export function initChat() {
  bridge.openDm = openDm;
  bridge.closeDm = closeDm;
  bridge.renderInbox = renderInbox;

  els.btnCloseDm.addEventListener("click", () => {
    closeDm();
    if (!els.panels.chat.hidden) renderInbox();
  });
  els.dmBackdrop.addEventListener("click", () => {
    closeDm();
    if (!els.panels.chat.hidden) renderInbox();
  });

  els.dmForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sendDmMessage(els.dmInput.value);
    els.dmInput.value = "";
    els.dmInput.focus();
  });

  els.btnBlockPeer.addEventListener("click", () => {
    if (!state.dmPeer) return;
    const ok = window.confirm(
      `Block ${state.dmPeer}? They won’t be able to message you.`
    );
    if (ok) bridge.blockUser?.(state.dmPeer);
  });
}
