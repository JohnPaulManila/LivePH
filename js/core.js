import { CHAT_USERS, CHAT_VIEWERS, GIFT_LIST } from "./data.js";

export const STORAGE_KEY = "liveph_session_v1";
export const DM_STORAGE_KEY = "liveph_dms_v1";
export const SETTINGS_STORAGE_KEY = "liveph_settings_v1";

export const defaultSettings = () => ({
  showOnline: true,
  readReceipts: true,
  allowDms: true,
  giftAlerts: true,
  chatNotifs: true,
  push: true,
  emailUpdates: true,
  reduceMotion: false,
  showFollowLists: true,
  blocked: [],
});

export const state = {
  user: null,
  pendingRegistration: null,
  coins: 1250,
  totalRecharged: 0,
  followers: 0,
  followingList: [],
  avatar: null,
  album: [],
  liveFilter: "all",
  activeStreamId: null,
  isHosting: false,
  myLive: null,
  mediaStream: null,
  returnPanel: "home",
  chatTimer: null,
  guestSeats: [],
  joinRequests: [],
  pk: null,
  giftTarget: null,
  pkStats: { me: { wins: 0, losses: 0 } },
  totalWithdrawn: 0,
  /** Own received gift counts: { g1: 3, g2: 1, ... } */
  receivedGifts: {},
  /** Other users' received gifts we've recorded: { "Mia Santos": { g1: 2 } } */
  receivedGiftsByUser: {},
  /** Gifts I personally sent to each user: { "Mia Santos": { g1: 1 } } */
  giftsSentTo: {},
  dmPeer: null,
  dmReplyTimer: null,
  dmThreads: {},
  profilePeer: null,
  peopleOwner: null,
  peopleType: null,
  settings: defaultSettings(),
};

export const els = {
  viewAuth: document.getElementById("view-auth"),
  viewApp: document.getElementById("view-app"),
  formLogin: document.getElementById("form-login"),
  formRegister: document.getElementById("form-register"),
  formVerify: document.getElementById("form-verify"),
  authTabs: document.querySelectorAll("[data-auth-tab]"),
  hideRealName: document.getElementById("hide-real-name"),
  verifyCopy: document.getElementById("verify-copy"),
  demoCodeHint: document.getElementById("demo-code-hint"),
  btnResend: document.getElementById("btn-resend"),
  btnDevLogin: document.getElementById("btn-dev-login"),
  topbarTitle: document.getElementById("topbar-title"),
  coinValue: document.getElementById("coin-value"),
  rechargeBalance: document.getElementById("recharge-balance"),
  avatarBtn: document.getElementById("avatar-btn"),
  avatarInitials: document.getElementById("avatar-initials"),
  btnTopSettings: document.getElementById("btn-top-settings"),
  btnGoLive: document.getElementById("btn-go-live"),
  goLiveSheet: document.getElementById("go-live-sheet"),
  goLiveBackdrop: document.getElementById("go-live-backdrop"),
  btnCloseGoLive: document.getElementById("btn-close-go-live"),
  formGoLive: document.getElementById("form-go-live"),
  goLiveTitleInput: document.getElementById("go-live-title-input"),
  goLiveCategory: document.getElementById("go-live-category"),
  hostingBanner: document.getElementById("hosting-banner"),
  liveCameraPreview: document.getElementById("live-camera-preview"),
  formGoLiveSubmit: document.querySelector("#form-go-live button[type='submit']"),
  mediaPermissionPopup: document.getElementById("media-permission-popup"),
  mediaPermissionDesc: document.getElementById("media-permission-desc"),
  btnMediaPermissionClose: document.getElementById("btn-media-permission-close"),
  btnMediaPermissionRetry: document.getElementById("btn-media-permission-retry"),
  feedStories: document.getElementById("feed-stories"),
  feedList: document.getElementById("feed-list"),
  liveGrid: document.getElementById("live-grid"),
  packGrid: document.getElementById("pack-grid"),
  profileAvatar: document.getElementById("profile-avatar"),
  profileDisplay: document.getElementById("profile-display"),
  profileHandle: document.getElementById("profile-handle"),
  profilePrivacy: document.getElementById("profile-privacy"),
  profileVipLine: document.getElementById("profile-vip-line"),
  settingsFollowers: document.getElementById("settings-followers"),
  settingsFollowing: document.getElementById("settings-following"),
  vipProgressText: document.getElementById("vip-progress-text"),
  rechargeVipBadge: document.getElementById("recharge-vip-badge"),
  liveRoomVip: document.getElementById("live-room-vip"),
  dmPeerVip: document.getElementById("dm-peer-vip"),
  profileSheet: document.getElementById("profile-sheet"),
  profileBackdrop: document.getElementById("profile-backdrop"),
  btnCloseProfile: document.getElementById("btn-close-profile"),
  viewProfileName: document.getElementById("view-profile-name"),
  viewProfileVip: document.getElementById("view-profile-vip"),
  viewProfileAvatar: document.getElementById("view-profile-avatar"),
  viewProfileHandle: document.getElementById("view-profile-handle"),
  viewProfilePresence: document.getElementById("view-profile-presence"),
  viewProfileFollowers: document.getElementById("view-profile-followers"),
  viewProfileFollowing: document.getElementById("view-profile-following"),
  viewProfileVipNote: document.getElementById("view-profile-vip-note"),
  btnProfileFollow: document.getElementById("btn-profile-follow"),
  btnProfileMessage: document.getElementById("btn-profile-message"),
  viewAlbumGrid: document.getElementById("view-album-grid"),
  btnViewFollowers: document.getElementById("btn-view-followers"),
  btnViewFollowing: document.getElementById("btn-view-following"),
  followPrivacyNote: document.getElementById("follow-privacy-note"),
  meProfileAvatar: document.getElementById("me-profile-avatar"),
  meProfileName: document.getElementById("me-profile-name"),
  meProfileHandle: document.getElementById("me-profile-handle"),
  meProfileVip: document.getElementById("me-profile-vip"),
  meFollowersCount: document.getElementById("me-followers-count"),
  meFollowingCount: document.getElementById("me-following-count"),
  btnMeFollowers: document.getElementById("btn-me-followers"),
  btnMeFollowing: document.getElementById("btn-me-following"),
  meAlbumGrid: document.getElementById("me-album-grid"),
  btnChangeAvatar: document.getElementById("btn-change-avatar"),
  inputAvatar: document.getElementById("input-avatar"),
  btnAddAlbumPhoto: document.getElementById("btn-add-album-photo"),
  inputAlbum: document.getElementById("input-album"),
  peopleSheet: document.getElementById("people-sheet"),
  peopleBackdrop: document.getElementById("people-backdrop"),
  btnClosePeople: document.getElementById("btn-close-people"),
  peopleSheetTitle: document.getElementById("people-sheet-title"),
  peopleSheetSubtitle: document.getElementById("people-sheet-subtitle"),
  peopleList: document.getElementById("people-list"),
  setShowFollowLists: document.getElementById("set-show-follow-lists"),
  inboxList: document.getElementById("inbox-list"),
  blockedList: document.getElementById("blocked-list"),
  formChangeNames: document.getElementById("form-change-names"),
  formChangeContact: document.getElementById("form-change-contact"),
  formBlockUser: document.getElementById("form-block-user"),
  setDisplayName: document.getElementById("set-display-name"),
  setUsername: document.getElementById("set-username"),
  setFullName: document.getElementById("set-full-name"),
  setMiddleName: document.getElementById("set-middle-name"),
  setLastName: document.getElementById("set-last-name"),
  setEmail: document.getElementById("set-email"),
  setPhone: document.getElementById("set-phone"),
  setHideRealName: document.getElementById("set-hide-real-name"),
  setShowOnline: document.getElementById("set-show-online"),
  setReadReceipts: document.getElementById("set-read-receipts"),
  setAllowDms: document.getElementById("set-allow-dms"),
  setGiftAlerts: document.getElementById("set-gift-alerts"),
  setChatNotifs: document.getElementById("set-chat-notifs"),
  setPush: document.getElementById("set-push"),
  setEmailUpdates: document.getElementById("set-email-updates"),
  setReduceMotion: document.getElementById("set-reduce-motion"),
  btnClearDms: document.getElementById("btn-clear-dms"),
  btnDeleteAccount: document.getElementById("btn-delete-account"),
  btnBlockPeer: document.getElementById("btn-block-peer"),
  btnLogout: document.getElementById("btn-logout"),
  toast: document.getElementById("toast"),
  liveRoom: document.getElementById("live-room"),
  liveRoomStage: document.getElementById("live-room-stage"),
  liveRoomName: document.getElementById("live-room-name"),
  liveRoomHandle: document.getElementById("live-room-handle"),
  liveRoomTitle: document.getElementById("live-room-title"),
  liveRoomCenter: document.getElementById("live-room-center"),
  liveAvatarStage: document.getElementById("live-avatar-stage"),
  liveHostAvatar: document.getElementById("live-host-avatar"),
  liveSpeakLabel: document.getElementById("live-speak-label"),
  liveRoomViewers: document.getElementById("live-room-viewers"),
  liveRoomHostBtn: document.getElementById("live-room-host-btn"),
  liveRoomPresence: document.getElementById("live-room-presence"),
  btnCloseLive: document.getElementById("btn-close-live"),
  giftRow: document.getElementById("gift-row"),
  btnOpenGifts: document.getElementById("btn-open-gifts"),
  giftSheet: document.getElementById("gift-sheet"),
  giftBackdrop: document.getElementById("gift-backdrop"),
  btnCloseGifts: document.getElementById("btn-close-gifts"),
  giftList: document.getElementById("gift-list"),
  giftSheetBalance: document.getElementById("gift-sheet-balance"),
  rechargePopup: document.getElementById("recharge-popup"),
  rechargePopupNeed: document.getElementById("recharge-popup-need"),
  btnRechargePopupCancel: document.getElementById("btn-recharge-popup-cancel"),
  btnRechargePopupGo: document.getElementById("btn-recharge-popup-go"),
  chatList: document.getElementById("live-chat-list"),
  chatForm: document.getElementById("live-chat-form"),
  chatInput: document.getElementById("live-chat-input"),
  dmSheet: document.getElementById("dm-sheet"),
  dmBackdrop: document.getElementById("dm-backdrop"),
  dmList: document.getElementById("dm-list"),
  dmForm: document.getElementById("dm-form"),
  dmInput: document.getElementById("dm-input"),
  dmPeerName: document.getElementById("dm-peer-name"),
  dmPeerPresence: document.getElementById("dm-peer-presence"),
  btnCloseDm: document.getElementById("btn-close-dm"),
  navItems: document.querySelectorAll("[data-nav]"),
  panels: {
    home: document.getElementById("panel-home"),
    live: document.getElementById("panel-live"),
    chat: document.getElementById("panel-chat"),
    profile: document.getElementById("panel-profile"),
    recharge: document.getElementById("panel-recharge"),
    settings: document.getElementById("panel-settings"),
  },
};

export const titles = {
  home: "News Feed",
  live: "Live",
  chat: "Chat",
  profile: "Profile",
  recharge: "Recharge",
  settings: "Settings",
};

/** Filled by app.js to avoid circular imports between features. */
export const bridge = {
  showPanel: null,
  enterApp: null,
  leaveApp: null,
  openLiveRoom: null,
  closeLiveRoom: null,
  openDm: null,
  closeDm: null,
  openProfile: null,
  closeProfile: null,
  renderMyProfile: null,
  openPeopleList: null,
  closePeopleList: null,
  renderInbox: null,
  renderSettings: null,
  renderBlockedList: null,
  showAuthStep: null,
  requireAuth: null,
  blockUser: null,
  updateVipUi: null,
  appendLiveSystem: null,
  updateHeader: null,
  refreshLiveStage: null,
  renderLive: null,
};

export function isLoggedIn() {
  return Boolean(state.user && (state.user.username || state.user.email));
}

/** Force login screen and hide the main app. */
export function requireAuth(actionLabel = "continue") {
  if (isLoggedIn()) return true;

  if (els.viewApp) els.viewApp.hidden = true;
  if (els.viewAuth) {
    els.viewAuth.hidden = false;
    els.viewAuth.classList.add("is-active");
  }
  bridge.closeLiveRoom?.({ silent: true });
  bridge.closeDm?.();
  bridge.closeProfile?.();
  bridge.closePeopleList?.();
  bridge.showAuthStep?.("login");
  showToast(`Log in to ${actionLabel}`);
  return false;
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data?.user) {
      state.user = data.user;
      state.coins = data.coins ?? 1250;
      state.totalRecharged = data.totalRecharged ?? 0;
      state.followers = data.followers ?? 0;
      state.followingList = Array.isArray(data.followingList) ? data.followingList : [];
      state.avatar = data.avatar || null;
      state.album = Array.isArray(data.album) ? data.album : [];
      state.pkStats = data.pkStats || { me: { wins: 0, losses: 0 } };
      if (!state.pkStats.me) state.pkStats.me = { wins: 0, losses: 0 };
      state.totalWithdrawn = data.totalWithdrawn ?? 0;
      state.receivedGifts = data.receivedGifts && typeof data.receivedGifts === "object" ? data.receivedGifts : {};
      state.receivedGiftsByUser =
        data.receivedGiftsByUser && typeof data.receivedGiftsByUser === "object"
          ? data.receivedGiftsByUser
          : {};
      state.giftsSentTo =
        data.giftsSentTo && typeof data.giftsSentTo === "object" ? data.giftsSentTo : {};
    }
  } catch {
    /* ignore */
  }
}

export function saveSession() {
  if (!state.user) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      user: state.user,
      coins: state.coins,
      totalRecharged: state.totalRecharged,
      followers: state.followers,
      followingList: state.followingList,
      avatar: state.avatar,
      album: state.album,
      pkStats: state.pkStats,
      totalWithdrawn: state.totalWithdrawn || 0,
      receivedGifts: state.receivedGifts || {},
      receivedGiftsByUser: state.receivedGiftsByUser || {},
      giftsSentTo: state.giftsSentTo || {},
    })
  );
}

export function loadDmThreads() {
  try {
    const raw = localStorage.getItem(DM_STORAGE_KEY);
    state.dmThreads = raw ? JSON.parse(raw) : {};
  } catch {
    state.dmThreads = {};
  }
}

export function saveDmThreads() {
  localStorage.setItem(DM_STORAGE_KEY, JSON.stringify(state.dmThreads));
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    state.settings = { ...defaultSettings(), ...(raw ? JSON.parse(raw) : {}) };
    if (!Array.isArray(state.settings.blocked)) state.settings.blocked = [];
  } catch {
    state.settings = defaultSettings();
  }
  applyMotionSetting();
}

export function saveSettings() {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state.settings));
  applyMotionSetting();
}

export function applyMotionSetting() {
  document.body.classList.toggle("reduce-motion", Boolean(state.settings.reduceMotion));
}

export function isBlocked(name) {
  return state.settings.blocked.some(
    (n) => n.toLowerCase() === String(name || "").toLowerCase()
  );
}

export function dmThreadKey(peerName) {
  const me = (state.user?.username || "guest").toLowerCase();
  const them = String(peerName).toLowerCase();
  return [me, them].sort().join("::");
}

export function peerFromThreadKey(key) {
  const me = (state.user?.username || "guest").toLowerCase();
  const parts = String(key).split("::");
  const other = parts.find((p) => p !== me) || parts[0];
  const known = Object.keys(CHAT_USERS).find((n) => n.toLowerCase() === other);
  if (known) return known;
  const fromViewers = CHAT_VIEWERS.find((n) => n.toLowerCase() === other);
  if (fromViewers) return fromViewers;
  return other;
}

export function formatInboxTime(ts) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}

export function isUserOnline(name) {
  const entry = CHAT_USERS[name];
  if (entry) return Boolean(entry.online);
  return true;
}

/** VIP1 = PHP 100 total, VIP2 = PHP 200, VIP n = n * 100. */
export function getVipLevel(totalRecharged = 0) {
  const amount = Number(totalRecharged) || 0;
  return Math.floor(amount / 100);
}

export function getVipLabel(level) {
  const n = Number(level) || 0;
  return n > 0 ? `VIP${n}` : "";
}

export function getTotalRechargedFor(name) {
  if (state.user && (name === myChatName() || name === state.user.displayName || name === state.user.username)) {
    return state.totalRecharged;
  }
  return CHAT_USERS[name]?.totalRecharged ?? 0;
}

export function getVipLevelFor(name) {
  return getVipLevel(getTotalRechargedFor(name));
}

export function vipBadgeHtml(level, { empty = false } = {}) {
  const n = Number(level) || 0;
  if (n <= 0) {
    return empty ? `<span class="vip-badge is-empty">No VIP</span>` : "";
  }
  const tier = Math.min(n, 10);
  return `<span class="vip-badge vip-${tier}">VIP${n}</span>`;
}

export function applyVipBadgeEl(el, level) {
  if (!el) return;
  const n = Number(level) || 0;
  if (n <= 0) {
    el.hidden = true;
    el.textContent = "";
    el.className = "vip-badge is-empty";
    return;
  }
  el.hidden = false;
  el.textContent = `VIP${n}`;
  el.className = `vip-badge vip-${Math.min(n, 10)}`;
}

export function getVipProgressText(totalRecharged = 0) {
  const amount = Number(totalRecharged) || 0;
  const level = getVipLevel(amount);
  if (level <= 0) {
    const need = 100 - amount;
    return `Recharge PHP ${need} more to unlock VIP1 (total PHP ${amount})`;
  }
  const nextAt = (level + 1) * 100;
  const need = nextAt - amount;
  return `VIP${level} · PHP ${amount} total · PHP ${need} more to VIP${level + 1}`;
}

export function getProfileData(name) {
  const isMe =
    state.user &&
    (name === myChatName() ||
      name === state.user.displayName ||
      name === state.user.username);

  if (isMe) {
    return {
      name: myChatName(),
      online: true,
      totalRecharged: state.totalRecharged,
      followers: state.followers || 0,
      following: state.followingList.length,
      isFollowing: false,
      vip: getVipLevel(state.totalRecharged),
      showFollowLists: Boolean(state.settings.showFollowLists),
      avatar: state.avatar,
      album: state.album || [],
      avatarColor: "#2ec4b6",
      followersList: [],
      followingList: [...state.followingList],
      isMe: true,
    };
  }

  const base = CHAT_USERS[name] || {
    online: true,
    totalRecharged: 0,
    followers: 12,
    following: 8,
    showFollowLists: true,
    album: [],
    avatarColor: "#2ec4b6",
  };
  const followingMe = state.followingList.some(
    (n) => n.toLowerCase() === String(name).toLowerCase()
  );
  const pool = CHAT_VIEWERS.filter((v) => v !== name);
  const followersList = base.followersList || pool.slice(0, 5);
  const followingList = base.followingList || pool.slice(0, 4);

  return {
    name,
    online: Boolean(base.online),
    totalRecharged: base.totalRecharged ?? 0,
    followers: (base.followers ?? 0) + (followingMe ? 1 : 0),
    following: base.following ?? followingList.length,
    isFollowing: followingMe,
    vip: getVipLevel(base.totalRecharged ?? 0),
    showFollowLists: base.showFollowLists !== false,
    avatar: null,
    album: base.album || [],
    avatarColor: base.avatarColor || "#2ec4b6",
    followersList: followingMe ? [myChatName(), ...followersList] : followersList,
    followingList,
    isMe: false,
  };
}

export function setAvatarEl(el, { src, name, color } = {}) {
  if (!el) return;
  const label = initialsFrom(name || "U");
  if (src) {
    el.textContent = "";
    el.style.backgroundImage = `url("${src}")`;
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
    el.classList.add("has-photo");
  } else {
    el.textContent = label;
    el.style.backgroundImage = "";
    el.style.background = color
      ? `linear-gradient(145deg, ${color}, #0d2a35)`
      : "";
    el.classList.remove("has-photo");
  }
}

export function renderAlbumGrid(container, items, { canDelete = false } = {}) {
  if (!container) return;
  if (!items?.length) {
    container.innerHTML = `<p class="album-empty">No photos yet.</p>`;
    return;
  }

  container.innerHTML = items
    .map((item, index) => {
      const isColor = typeof item === "string" && item.startsWith("#");
      const isData = typeof item === "string" && item.startsWith("data:");
      if (isData) {
        return `<div class="album-item" style="background-image:url('${item}')">${
          canDelete
            ? `<button type="button" class="album-delete" data-album-index="${index}" aria-label="Remove photo">×</button>`
            : ""
        }</div>`;
      }
      if (isColor) {
        return `<div class="album-item" style="background:${item}"></div>`;
      }
      return `<div class="album-item" style="background-image:url('${item}')"></div>`;
    })
    .join("");
}

/** Compress and resize image for localStorage-friendly avatar/album storage. */
export function readImageAsDataUrl(file, maxSide = 480) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image"));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export function isFollowing(name) {
  return state.followingList.some(
    (n) => n.toLowerCase() === String(name).toLowerCase()
  );
}

export function setPresenceEl(el, online) {
  if (!el) return;
  const dot = el.querySelector(".presence-dot");
  const label = el.querySelector(".presence-label");
  if (dot) {
    dot.classList.toggle("is-online", online);
    dot.classList.toggle("is-offline", !online);
  }
  if (label) label.textContent = online ? "Online" : "Offline";
}

export function formatCoins(n) {
  return Number(n).toLocaleString("en-PH");
}

function isMyName(name) {
  const n = String(name || "");
  return (
    n === myChatName() ||
    n === state.user?.displayName ||
    n === state.user?.username ||
    n === publicName(state.user)
  );
}

/** Demo baseline counts so streamer profiles aren't empty. */
function demoGiftCounts(name) {
  const counts = {};
  let hash = 0;
  const key = String(name || "");
  for (let i = 0; i < key.length; i += 1) hash = (hash + key.charCodeAt(i) * (i + 3)) % 113;
  GIFT_LIST.forEach((g, i) => {
    const n = (hash + i * 7) % 19;
    if (n > 3) counts[g.id] = n;
  });
  return counts;
}

export function getReceivedGifts(name) {
  if (isMyName(name)) {
    return { ...(state.receivedGifts || {}) };
  }
  const base = demoGiftCounts(name);
  const extra = state.receivedGiftsByUser?.[name] || {};
  const merged = { ...base };
  Object.entries(extra).forEach(([id, n]) => {
    merged[id] = (merged[id] || 0) + (Number(n) || 0);
  });
  return merged;
}

export function getGiftsISentTo(name) {
  if (!name || isMyName(name)) return {};
  return { ...(state.giftsSentTo?.[name] || {}) };
}

export function recordReceivedGift(recipientName, giftId, qty = 1) {
  if (!recipientName || !giftId || recipientName === "host") return;
  const add = Math.max(1, Number(qty) || 1);
  const who = String(recipientName).trim();

  if (isMyName(who)) {
    state.receivedGifts = state.receivedGifts || {};
    state.receivedGifts[giftId] = (state.receivedGifts[giftId] || 0) + add;
  } else {
    state.receivedGiftsByUser = state.receivedGiftsByUser || {};
    const row = { ...(state.receivedGiftsByUser[who] || {}) };
    row[giftId] = (row[giftId] || 0) + add;
    state.receivedGiftsByUser[who] = row;

    // Track what I sent so the profile can highlight it
    state.giftsSentTo = state.giftsSentTo || {};
    const sent = { ...(state.giftsSentTo[who] || {}) };
    sent[giftId] = (sent[giftId] || 0) + add;
    state.giftsSentTo[who] = sent;
  }
  saveSession();
}

export function renderReceivedGifts(container, name) {
  if (!container) return;
  const counts = getReceivedGifts(name);
  const fromMe = getGiftsISentTo(name);
  const items = GIFT_LIST.map((g) => ({
    ...g,
    count: counts[g.id] || 0,
    mine: fromMe[g.id] || 0,
  })).filter((g) => g.count > 0 || g.mine > 0);

  if (!items.length) {
    container.innerHTML = `<p class="gifts-wall-empty">No gifts received yet.</p>`;
    return;
  }

  // Put gifts you sent at the top so they're easy to spot
  items.sort((a, b) => (b.mine || 0) - (a.mine || 0) || b.count - a.count);

  container.innerHTML = items
    .map(
      (g) => `
      <div class="gift-wall-item${g.mine ? " is-from-you" : ""}" title="${escapeHtml(g.name)}">
        <div class="gift-wall-copy">
          <span class="gift-wall-name">${escapeHtml(g.name)}</span>
          ${g.mine ? `<span class="gift-wall-you">You sent ×${formatCoins(g.mine)}</span>` : ""}
        </div>
        <span class="gift-wall-count">×${formatCoins(Math.max(g.count, g.mine))}</span>
      </div>`
    )
    .join("");
}

export function initialsFrom(name) {
  return String(name || "LP")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function publicName(user) {
  if (!user) return "Guest";
  if (user.hideRealName) return user.displayName;
  const parts = [user.fullName, user.middleName, user.lastName].filter(Boolean);
  return parts.join(" ") || user.displayName;
}

export function myChatName() {
  if (!state.user) return "You";
  return state.user.hideRealName
    ? state.user.displayName
    : state.user.displayName || state.user.username;
}

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function updateHeader() {
  const name = publicName(state.user);
  els.avatarInitials.textContent = initialsFrom(name);
  els.coinValue.textContent = formatCoins(state.coins);
  els.rechargeBalance.textContent = formatCoins(state.coins);
  updateVipUi();
}

export function updateVipUi() {
  const level = getVipLevel(state.totalRecharged);
  if (els.rechargeVipBadge) {
    if (level > 0) {
      els.rechargeVipBadge.className = `vip-badge vip-${Math.min(level, 10)}`;
      els.rechargeVipBadge.textContent = `VIP${level}`;
    } else {
      els.rechargeVipBadge.className = "vip-badge is-empty";
      els.rechargeVipBadge.textContent = "No VIP";
    }
  }
  if (els.vipProgressText) {
    els.vipProgressText.textContent = getVipProgressText(state.totalRecharged);
  }
}

export function currentPanelName() {
  const active = Object.entries(els.panels).find(([, panel]) => !panel.hidden);
  return active?.[0] || "home";
}

let toastTimer;
export function showToast(message) {
  els.toast.hidden = false;
  els.toast.textContent = message;
  requestAnimationFrame(() => els.toast.classList.add("is-show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    els.toast.classList.remove("is-show");
    setTimeout(() => {
      els.toast.hidden = true;
    }, 250);
  }, 2600);
}
