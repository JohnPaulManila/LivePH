import { FEED_POSTS, LIVE_STREAMS } from "./data.js";
import { bridge, els, getVipLevelFor, vipBadgeHtml } from "./core.js";

export function renderFeed() {
  els.feedStories.innerHTML = LIVE_STREAMS.slice(0, 6)
    .map((s) => {
      const initials = s.host
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2);
      const vip = getVipLevelFor(s.host);
      return `
      <button type="button" class="story" data-stream="${s.id}">
        <div class="story-ring">
          <div class="story-fallback">${initials}</div>
        </div>
        <span>${s.host.split(" ")[0]}${vip > 0 ? " VIP" + vip : ""}</span>
      </button>`;
    })
    .join("");

  els.feedList.innerHTML = FEED_POSTS.map((p) => {
    const vip = getVipLevelFor(p.author);
    return `
      <button type="button" class="feed-card" data-stream="${p.streamId}" aria-label="Watch ${p.author} live">
        <div class="feed-media">
          ${p.isLive ? `<span class="live-badge">Live</span>` : ""}
        </div>
        <div class="feed-body">
          <div class="feed-author">
            <div class="ava">${p.initials}</div>
            <div>
              <strong>${p.author}${vipBadgeHtml(vip)}</strong>
              <small>${p.handle} · ${p.time}</small>
            </div>
          </div>
          <p>${p.text}</p>
          <div class="feed-meta">
            <span>${p.likes} likes</span>
            <span>${p.comments} comments</span>
          </div>
          <p class="feed-tap-hint">Tap to watch live</p>
        </div>
      </button>`;
  }).join("");

  els.feedStories.querySelectorAll("[data-stream]").forEach((btn) => {
    btn.addEventListener("click", () => bridge.openLiveRoom(btn.dataset.stream, "home"));
  });
  els.feedList.querySelectorAll("[data-stream]").forEach((card) => {
    card.addEventListener("click", () => bridge.openLiveRoom(card.dataset.stream, "home"));
  });
}

export function initHome() {
  // Feed is rendered on enterApp / when needed
}
