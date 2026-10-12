import {
  DM_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  STORAGE_KEY,
  applyMotionSetting,
  bridge,
  defaultSettings,
  dmThreadKey,
  els,
  escapeHtml,
  getVipLabel,
  getVipLevel,
  getVipProgressText,
  initialsFrom,
  isBlocked,
  myChatName,
  publicName,
  saveDmThreads,
  saveSession,
  saveSettings,
  showToast,
  state,
  updateHeader,
  vipBadgeHtml,
} from "./core.js";

export function renderBlockedList() {
  const list = state.settings.blocked;
  if (!list.length) {
    els.blockedList.innerHTML = `<p class="blocked-empty">No blocked users.</p>`;
    return;
  }
  els.blockedList.innerHTML = list
    .map(
      (name) => `
      <div class="blocked-item">
        <strong>${escapeHtml(name)}</strong>
        <button type="button" class="btn-unblock" data-unblock="${escapeHtml(name)}">Unblock</button>
      </div>`
    )
    .join("");

  els.blockedList.querySelectorAll("[data-unblock]").forEach((btn) => {
    btn.addEventListener("click", () => unblockUser(btn.dataset.unblock));
  });
}

export function blockUser(name) {
  const clean = String(name || "").trim();
  if (!clean) return;
  if (clean.toLowerCase() === myChatName().toLowerCase()) {
    showToast("You can’t block yourself");
    return;
  }
  if (!isBlocked(clean)) {
    state.settings.blocked.push(clean);
    saveSettings();
  }
  const key = dmThreadKey(clean);
  if (state.dmThreads[key]) {
    delete state.dmThreads[key];
    saveDmThreads();
  }
  if (state.dmPeer === clean) bridge.closeDm?.();
  renderBlockedList();
  bridge.renderInbox?.();
  showToast(`Blocked ${clean}`);
}

export function unblockUser(name) {
  state.settings.blocked = state.settings.blocked.filter(
    (n) => n.toLowerCase() !== String(name).toLowerCase()
  );
  saveSettings();
  renderBlockedList();
  showToast(`Unblocked ${name}`);
}

export function renderSettings() {
  const u = state.user;
  if (!u) return;

  const shown = publicName(u);
  const vip = getVipLevel(state.totalRecharged);
  els.profileDisplay.innerHTML = `${escapeHtml(shown)} ${vipBadgeHtml(vip)}`;
  els.profileHandle.textContent = `@${u.username}`;
  els.profileAvatar.textContent = initialsFrom(shown);
  if (state.avatar) {
    els.profileAvatar.style.backgroundImage = `url("${state.avatar}")`;
    els.profileAvatar.style.backgroundSize = "cover";
    els.profileAvatar.style.backgroundPosition = "center";
    els.profileAvatar.textContent = "";
  } else {
    els.profileAvatar.style.backgroundImage = "";
  }
  if (els.profileVipLine) {
    els.profileVipLine.textContent =
      vip > 0
        ? `${getVipLabel(vip)} · ${getVipProgressText(state.totalRecharged)}`
        : getVipProgressText(state.totalRecharged);
  }
  els.profilePrivacy.textContent = u.hideRealName
    ? "Privacy on — only your display name is public."
    : "Privacy off — your full name can appear publicly.";

  if (els.settingsFollowers) {
    els.settingsFollowers.textContent = String(state.followers || 0);
  }
  if (els.settingsFollowing) {
    els.settingsFollowing.textContent = String(state.followingList.length);
  }

  els.setDisplayName.value = u.displayName || "";
  els.setUsername.value = u.username || "";
  els.setFullName.value = u.fullName || "";
  els.setMiddleName.value = u.middleName || "";
  els.setLastName.value = u.lastName || "";
  els.setEmail.value = u.email || "";
  els.setPhone.value = u.phone || "";
  els.setHideRealName.checked = Boolean(u.hideRealName);

  els.setShowOnline.checked = Boolean(state.settings.showOnline);
  els.setReadReceipts.checked = Boolean(state.settings.readReceipts);
  if (els.setShowFollowLists) {
    els.setShowFollowLists.checked = Boolean(state.settings.showFollowLists);
  }
  els.setAllowDms.checked = Boolean(state.settings.allowDms);
  els.setGiftAlerts.checked = Boolean(state.settings.giftAlerts);
  els.setChatNotifs.checked = Boolean(state.settings.chatNotifs);
  els.setPush.checked = Boolean(state.settings.push);
  els.setEmailUpdates.checked = Boolean(state.settings.emailUpdates);
  els.setReduceMotion.checked = Boolean(state.settings.reduceMotion);

  renderBlockedList();
}

function deleteAccount() {
  const ok = window.confirm(
    "Delete your LivePH account? This clears your local profile, chats, and settings on this device."
  );
  if (!ok) return;
  bridge.closeLiveRoom?.({ silent: true });
  bridge.closeDm?.();
  state.user = null;
  state.coins = 1250;
  state.totalRecharged = 0;
  state.followers = 0;
  state.followingList = [];
  state.avatar = null;
  state.album = [];
  state.dmThreads = {};
  state.settings = defaultSettings();
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(DM_STORAGE_KEY);
  localStorage.removeItem(SETTINGS_STORAGE_KEY);
  applyMotionSetting();
  els.viewApp.hidden = true;
  els.viewAuth.hidden = false;
  els.viewAuth.classList.add("is-active");
  bridge.showAuthStep?.("login");
  showToast("Account deleted");
}

export function initSettings() {
  bridge.renderSettings = renderSettings;
  bridge.renderBlockedList = renderBlockedList;
  bridge.blockUser = blockUser;

  els.btnLogout.addEventListener("click", () => bridge.leaveApp?.());

  els.formChangeNames.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!state.user) return;
    state.user.displayName = els.setDisplayName.value.trim();
    state.user.username = els.setUsername.value.trim();
    state.user.fullName = els.setFullName.value.trim();
    state.user.middleName = els.setMiddleName.value.trim();
    state.user.lastName = els.setLastName.value.trim();
    saveSession();
    updateHeader();
    renderSettings();
    showToast("Name updated");
  });

  els.formChangeContact.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!state.user) return;
    state.user.email = els.setEmail.value.trim();
    state.user.phone = els.setPhone.value.trim();
    saveSession();
    renderSettings();
    showToast("Contact updated");
  });

  els.setHideRealName.addEventListener("change", () => {
    if (!state.user) return;
    state.user.hideRealName = els.setHideRealName.checked;
    saveSession();
    updateHeader();
    renderSettings();
    showToast(els.setHideRealName.checked ? "Real name hidden" : "Real name visible");
  });

  const settingToggles = [
    ["setShowOnline", "showOnline"],
    ["setReadReceipts", "readReceipts"],
    ["setShowFollowLists", "showFollowLists"],
    ["setAllowDms", "allowDms"],
    ["setGiftAlerts", "giftAlerts"],
    ["setChatNotifs", "chatNotifs"],
    ["setPush", "push"],
    ["setEmailUpdates", "emailUpdates"],
    ["setReduceMotion", "reduceMotion"],
  ];

  settingToggles.forEach(([elKey, settingKey]) => {
    if (!els[elKey]) return;
    els[elKey].addEventListener("change", () => {
      state.settings[settingKey] = els[elKey].checked;
      saveSettings();
      showToast("Setting saved");
    });
  });

  els.formBlockUser.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = els.formBlockUser.blockName.value.trim();
    blockUser(name);
    els.formBlockUser.reset();
  });

  els.btnClearDms.addEventListener("click", () => {
    const ok = window.confirm("Clear all private chats on this device?");
    if (!ok) return;
    state.dmThreads = {};
    saveDmThreads();
    bridge.closeDm?.();
    bridge.renderInbox?.();
    showToast("All private chats cleared");
  });

  els.btnDeleteAccount.addEventListener("click", deleteAccount);
}
