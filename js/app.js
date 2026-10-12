import { initAuth, showAuthStep } from "./auth.js";
import { initChat, renderInbox } from "./chat.js";
import {
  bridge,
  els,
  isLoggedIn,
  loadDmThreads,
  loadSession,
  loadSettings,
  requireAuth,
  saveSession,
  showToast,
  state,
  titles,
  updateHeader,
} from "./core.js";
import { initHome, renderFeed } from "./home.js";
import { closeLiveRoom, initLive, renderLive } from "./live.js";
import { initProfile, renderMyProfile } from "./profile.js";
import { initRecharge, renderPacks } from "./recharge.js";
import { initSettings, renderSettings } from "./settings.js";

function lockToAuth(message) {
  closeLiveRoom({ silent: true });
  bridge.closeDm?.();
  bridge.closeProfile?.();
  bridge.closePeopleList?.();
  if (els.giftSheet) els.giftSheet.hidden = true;
  if (els.rechargePopup) els.rechargePopup.hidden = true;
  if (els.goLiveSheet) els.goLiveSheet.hidden = true;
  if (els.mediaPermissionPopup) els.mediaPermissionPopup.hidden = true;
  if (document.getElementById("join-request-sheet")) {
    document.getElementById("join-request-sheet").hidden = true;
  }
  if (document.getElementById("pk-sheet")) document.getElementById("pk-sheet").hidden = true;
  if (els.viewApp) els.viewApp.hidden = true;
  if (els.viewAuth) {
    els.viewAuth.hidden = false;
    els.viewAuth.classList.add("is-active");
  }
  showAuthStep("login");
  if (message) showToast(message);
}

function showPanel(name) {
  if (!requireAuth("open this page")) {
    lockToAuth();
    return;
  }

  closeLiveRoom({ silent: true });
  bridge.closeProfile?.();
  bridge.closePeopleList?.();
  if (els.giftSheet) els.giftSheet.hidden = true;
  if (els.rechargePopup) els.rechargePopup.hidden = true;
  if (els.goLiveSheet) els.goLiveSheet.hidden = true;
  if (els.mediaPermissionPopup) els.mediaPermissionPopup.hidden = true;
  if (document.getElementById("join-request-sheet")) {
    document.getElementById("join-request-sheet").hidden = true;
  }
  if (document.getElementById("pk-sheet")) document.getElementById("pk-sheet").hidden = true;
  Object.entries(els.panels).forEach(([key, panel]) => {
    const on = key === name;
    panel.hidden = !on;
    panel.classList.toggle("is-active", on);
  });
  els.navItems.forEach((item) => {
    const on = item.dataset.nav === name;
    item.classList.toggle("is-active", on);
    if (on) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });
  els.topbarTitle.textContent = titles[name] || "LivePH";
  if (name === "chat") renderInbox();
  if (name === "settings") renderSettings();
  if (name === "profile") renderMyProfile();
  if (name === "recharge") renderPacks();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function enterApp() {
  if (!isLoggedIn()) {
    lockToAuth("Log in to use LivePH");
    return;
  }
  els.viewAuth.classList.remove("is-active");
  els.viewAuth.hidden = true;
  els.viewApp.hidden = false;
  updateHeader();
  renderSettings();
  renderMyProfile();
  renderInbox();
  renderFeed();
  renderLive();
  renderPacks();
  showPanel("home");
}

function leaveApp() {
  closeLiveRoom({ silent: true });
  bridge.closeDm?.();
  bridge.closeProfile?.();
  bridge.closePeopleList?.();
  state.user = null;
  state.pendingRegistration = null;
  state.coins = 1250;
  state.totalRecharged = 0;
  state.followers = 0;
  state.followingList = [];
  state.avatar = null;
  state.album = [];
  state.pkStats = { me: { wins: 0, losses: 0 } };
  state.totalWithdrawn = 0;
  state.receivedGifts = {};
  state.receivedGiftsByUser = {};
  state.giftsSentTo = {};
  saveSession();
  lockToAuth("Logged out");
  els.formLogin?.reset();
  els.formRegister?.reset();
  els.formVerify?.reset();
  if (els.hideRealName) els.hideRealName.checked = true;
}

function boot() {
  bridge.showPanel = showPanel;
  bridge.enterApp = enterApp;
  bridge.leaveApp = leaveApp;
  bridge.requireAuth = requireAuth;

  // Always start locked until session proves login
  if (els.viewApp) els.viewApp.hidden = true;
  if (els.viewAuth) {
    els.viewAuth.hidden = false;
    els.viewAuth.classList.add("is-active");
  }

  initAuth();
  initHome();
  initLive();
  initChat();
  initProfile();
  initRecharge();
  initSettings();

  els.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (!requireAuth("use the app")) return;
      showPanel(item.dataset.nav);
    });
  });
  els.avatarBtn?.addEventListener("click", () => {
    if (!requireAuth("view your profile")) return;
    showPanel("profile");
  });
  els.btnTopSettings?.addEventListener("click", () => {
    if (!requireAuth("open settings")) return;
    showPanel("settings");
  });

  loadSettings();
  loadDmThreads();
  loadSession();

  if (isLoggedIn()) {
    enterApp();
  } else {
    lockToAuth();
  }
}

boot();
