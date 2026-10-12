import { getPkStats } from "./guests.js";
import {
  applyVipBadgeEl,
  bridge,
  els,
  escapeHtml,
  formatCoins,
  getProfileData,
  getVipLabel,
  getVipLevel,
  getVipProgressText,
  initialsFrom,
  isFollowing,
  myChatName,
  publicName,
  readImageAsDataUrl,
  renderAlbumGrid,
  renderReceivedGifts,
  saveSession,
  setAvatarEl,
  setPresenceEl,
  showToast,
  state,
  vipBadgeHtml,
  requireAuth,
} from "./core.js";

export function renderMyProfile() {
  if (!state.user || !els.meProfileName) return;

  const name = publicName(state.user);
  const vip = getVipLevel(state.totalRecharged);
  const pk = getPkStats(name);

  els.meProfileName.innerHTML = `${escapeHtml(name)} ${vipBadgeHtml(vip)}`;
  els.meProfileHandle.textContent = `@${state.user.username}`;
  els.meProfileVip.textContent = getVipProgressText(state.totalRecharged);
  const pkEl = document.getElementById("me-profile-pk");
  if (pkEl) pkEl.textContent = `PK ${pk.wins}W · ${pk.losses}L`;
  const cashed = document.getElementById("withdraw-total-cashed");
  if (cashed) cashed.textContent = `Total cashed: PHP ${formatCoins(state.totalWithdrawn || 0)}`;
  els.meFollowersCount.textContent = String(state.followers || 0);
  els.meFollowingCount.textContent = String(state.followingList.length);

  setAvatarEl(els.meProfileAvatar, {
    src: state.avatar,
    name,
    color: "#2ec4b6",
  });
  setAvatarEl(els.avatarBtn.querySelector("span") || els.avatarInitials, {
    src: state.avatar,
    name,
  });
  if (state.avatar) {
    els.avatarBtn.style.backgroundImage = `url("${state.avatar}")`;
    els.avatarBtn.style.backgroundSize = "cover";
    els.avatarBtn.style.backgroundPosition = "center";
    els.avatarInitials.textContent = "";
  } else {
    els.avatarBtn.style.backgroundImage = "";
    els.avatarInitials.textContent = initialsFrom(name);
  }

  renderAlbumGrid(els.meAlbumGrid, state.album, { canDelete: true });
  renderReceivedGifts(document.getElementById("me-gifts-wall"), name);
  els.meAlbumGrid.querySelectorAll("[data-album-index]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = Number(btn.dataset.albumIndex);
      state.album.splice(idx, 1);
      saveSession();
      renderMyProfile();
      showToast("Photo removed");
    });
  });
}

function renderViewAlbum(profile) {
  renderAlbumGrid(els.viewAlbumGrid, profile.album || []);
}

export function openProfile(peerName) {
  if (!requireAuth("view profiles")) return;
  const name = String(peerName || "").trim();
  if (!name) return;

  if (
    name === myChatName() ||
    name === state.user?.displayName ||
    name === state.user?.username
  ) {
    closeProfile();
    bridge.showPanel?.("profile");
    return;
  }

  const profile = getProfileData(name);
  state.profilePeer = name;

  els.viewProfileName.textContent = name;
  applyVipBadgeEl(els.viewProfileVip, profile.vip);
  setAvatarEl(els.viewProfileAvatar, {
    src: profile.avatar,
    name,
    color: profile.avatarColor,
  });
  els.viewProfileHandle.textContent = `@${name.replace(/\s+/g, "").toLowerCase()}`;
  setPresenceEl(els.viewProfilePresence, profile.online);
  els.viewProfileFollowers.textContent = String(profile.followers);
  els.viewProfileFollowing.textContent = String(profile.following);

  if (profile.vip > 0) {
    els.viewProfileVipNote.textContent = `${getVipLabel(profile.vip)} · PHP ${profile.totalRecharged} total recharged`;
  } else {
    els.viewProfileVipNote.textContent = "No VIP yet — has not reached PHP 100 total recharge";
  }

  const pk = getPkStats(name);
  const viewPk = document.getElementById("view-profile-pk");
  if (viewPk) viewPk.textContent = `PK ${pk.wins}W · ${pk.losses}L`;

  const canSeeLists = profile.showFollowLists;
  els.followPrivacyNote.hidden = canSeeLists;
  els.btnViewFollowers.disabled = !canSeeLists;
  els.btnViewFollowing.disabled = !canSeeLists;
  els.btnViewFollowers.classList.toggle("is-disabled", !canSeeLists);
  els.btnViewFollowing.classList.toggle("is-disabled", !canSeeLists);

  els.btnProfileFollow.textContent = profile.isFollowing ? "Following" : "Follow";
  els.btnProfileFollow.classList.toggle("is-following", profile.isFollowing);

  renderViewAlbum(profile);
  renderReceivedGifts(document.getElementById("view-gifts-wall"), name);
  els.profileSheet.hidden = false;
}

export function closeProfile() {
  state.profilePeer = null;
  els.profileSheet.hidden = true;
}

export function closePeopleList() {
  state.peopleOwner = null;
  state.peopleType = null;
  els.peopleSheet.hidden = true;
}

export function openPeopleList(ownerName, type) {
  const profile = getProfileData(ownerName);
  if (!profile.showFollowLists && !profile.isMe) {
    showToast("This user keeps followers & following private");
    return;
  }

  const list =
    type === "followers"
      ? profile.isMe
        ? [] // own followers list empty in demo unless we track reverse follows
        : profile.followersList
      : profile.isMe
        ? profile.followingList
        : profile.followingList;

  // For own followers, show a simple demo note / empty or generate from people who aren't in following
  let people = list;
  if (profile.isMe && type === "followers") {
    people = [];
  }

  state.peopleOwner = ownerName;
  state.peopleType = type;
  els.peopleSheetTitle.textContent = type === "followers" ? "Followers" : "Following";
  els.peopleSheetSubtitle.textContent = ownerName;

  if (!people.length) {
    els.peopleList.innerHTML = `<p class="album-empty">${
      type === "followers" ? "No followers to show yet." : "Not following anyone yet."
    }</p>`;
  } else {
    els.peopleList.innerHTML = people
      .map((person) => {
        const p = getProfileData(person);
        return `
        <button type="button" class="people-item" data-person="${escapeHtml(person)}">
          <span class="people-ava" style="${
            p.avatar
              ? `background-image:url('${p.avatar}');background-size:cover`
              : `background:linear-gradient(145deg, ${p.avatarColor || "#2ec4b6"}, #0d2a35)`
          }">${p.avatar ? "" : escapeHtml(initialsFrom(person))}</span>
          <span class="people-meta">
            <strong>${escapeHtml(person)} ${vipBadgeHtml(p.vip)}</strong>
            <small>${p.online ? "Online" : "Offline"}</small>
          </span>
        </button>`;
      })
      .join("");

    els.peopleList.querySelectorAll("[data-person]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const person = btn.dataset.person;
        closePeopleList();
        if (
          person === myChatName() ||
          person === state.user?.displayName ||
          person === state.user?.username
        ) {
          closeProfile();
          bridge.showPanel?.("profile");
          return;
        }
        openProfile(person);
      });
    });
  }

  els.peopleSheet.hidden = false;
}

function toggleFollow() {
  const name = state.profilePeer;
  if (!name) return;

  if (isFollowing(name)) {
    state.followingList = state.followingList.filter(
      (n) => n.toLowerCase() !== name.toLowerCase()
    );
    showToast(`Unfollowed ${name}`);
  } else {
    state.followingList.push(name);
    showToast(`Following ${name}`);
  }
  saveSession();
  openProfile(name);
  renderMyProfile();
  bridge.renderSettings?.();
}

async function handleAvatarFile(file) {
  try {
    state.avatar = await readImageAsDataUrl(file, 320);
    saveSession();
    renderMyProfile();
    bridge.renderSettings?.();
    showToast("Profile picture updated");
  } catch (err) {
    showToast(err.message || "Could not upload photo");
  }
}

async function handleAlbumFile(file) {
  try {
    if (state.album.length >= 12) {
      showToast("Album limit is 12 photos");
      return;
    }
    const dataUrl = await readImageAsDataUrl(file, 640);
    state.album.push(dataUrl);
    saveSession();
    renderMyProfile();
    showToast("Photo added to album");
  } catch (err) {
    showToast(err.message || "Could not upload photo");
  }
}

export function initProfile() {
  bridge.openProfile = openProfile;
  bridge.closeProfile = closeProfile;
  bridge.renderMyProfile = renderMyProfile;
  bridge.openPeopleList = openPeopleList;
  bridge.closePeopleList = closePeopleList;

  els.btnCloseProfile.addEventListener("click", closeProfile);
  els.profileBackdrop.addEventListener("click", closeProfile);

  els.btnProfileFollow.addEventListener("click", toggleFollow);
  els.btnProfileMessage.addEventListener("click", () => {
    const name = state.profilePeer;
    if (!name) return;
    closeProfile();
    bridge.openDm?.(name);
  });

  els.btnViewFollowers?.addEventListener("click", () => {
    if (!state.profilePeer) return;
    openPeopleList(state.profilePeer, "followers");
  });
  els.btnViewFollowing?.addEventListener("click", () => {
    if (!state.profilePeer) return;
    openPeopleList(state.profilePeer, "following");
  });

  els.btnMeFollowers?.addEventListener("click", () => {
    openPeopleList(myChatName(), "followers");
  });
  els.btnMeFollowing?.addEventListener("click", () => {
    openPeopleList(myChatName(), "following");
  });

  els.btnClosePeople?.addEventListener("click", closePeopleList);
  els.peopleBackdrop?.addEventListener("click", closePeopleList);

  els.btnChangeAvatar?.addEventListener("click", () => els.inputAvatar.click());
  els.inputAvatar?.addEventListener("change", () => {
    const file = els.inputAvatar.files?.[0];
    els.inputAvatar.value = "";
    if (file) handleAvatarFile(file);
  });

  els.btnAddAlbumPhoto?.addEventListener("click", () => els.inputAlbum.click());
  els.inputAlbum?.addEventListener("change", () => {
    const file = els.inputAlbum.files?.[0];
    els.inputAlbum.value = "";
    if (file) handleAlbumFile(file);
  });
}
