import { COIN_PACKS } from "./data.js";
import {
  els,
  formatCoins,
  getVipLevel,
  requireAuth,
  saveSession,
  showToast,
  state,
  updateHeader,
} from "./core.js";

let selectedPackId = COIN_PACKS[0]?.id || null;

function applyRecharge({ coins, bonus = 0, pesos }) {
  if (!requireAuth("recharge")) return false;
  const addCoins = coins + bonus;
  if (!Number.isFinite(addCoins) || addCoins <= 0 || !Number.isFinite(pesos) || pesos <= 0) {
    showToast("Enter a valid amount");
    return false;
  }

  const prevVip = getVipLevel(state.totalRecharged);
  state.coins += addCoins;
  state.totalRecharged += pesos;
  saveSession();
  updateHeader();

  const nextVip = getVipLevel(state.totalRecharged);
  let msg = `Added ${formatCoins(addCoins)} coins`;
  if (bonus > 0) msg = `Added ${formatCoins(coins)} + ${formatCoins(bonus)} bonus`;
  if (nextVip > prevVip) msg = `Recharged! You reached VIP${nextVip}`;
  else if (nextVip > 0) msg += ` · VIP${nextVip}`;
  showToast(msg);
  return true;
}

function packLabel(pack) {
  if (pack.bonus > 0) {
    return `${formatCoins(pack.coins)} Coins + ${formatCoins(pack.bonus)} Bonus`;
  }
  return `${formatCoins(pack.coins)} Coins`;
}

function syncPackSelection() {
  const grid = document.getElementById("pack-grid");
  grid?.querySelectorAll("[data-pack]").forEach((btn) => {
    const on = btn.dataset.pack === selectedPackId;
    btn.classList.toggle("is-selected", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });

  const customBlock = document.getElementById("custom-recharge");
  const customOn = selectedPackId === "custom";
  customBlock?.classList.toggle("is-selected", customOn);
  const input = document.getElementById("custom-recharge-amount");
  if (input) input.disabled = !customOn;
}

function selectPack(id) {
  if (!id) return;
  selectedPackId = id;
  syncPackSelection();
}

export function renderPacks() {
  const grid = els.packGrid || document.getElementById("pack-grid");
  if (!grid) return;

  if (!selectedPackId || (selectedPackId !== "custom" && !COIN_PACKS.some((p) => p.id === selectedPackId))) {
    selectedPackId = COIN_PACKS[0]?.id || null;
  }

  grid.innerHTML = COIN_PACKS.map((p) => {
    const selected = selectedPackId === p.id;
    return `
      <button type="button" class="pack${selected ? " is-selected" : ""}" data-pack="${p.id}" aria-pressed="${selected}">
        <span class="pack-radio" aria-hidden="true"></span>
        <div class="pack-main">
          <div class="coins">${packLabel(p)}</div>
          ${p.bonus > 0 ? `<div class="bonus">Includes ${formatCoins(p.bonus)} bonus coins</div>` : ""}
        </div>
        <div class="price">PHP ${formatCoins(p.pesos)}</div>
      </button>`;
  }).join("");

  syncPackSelection();
}

function submitRecharge() {
  if (selectedPackId === "custom") {
    const input = document.getElementById("custom-recharge-amount");
    const raw = Number(input?.value);
    if (!Number.isFinite(raw) || raw < 1) {
      showToast("Enter at least PHP 1");
      input?.focus();
      return;
    }
    const pesos = Math.floor(raw);
    if (applyRecharge({ coins: pesos, bonus: 0, pesos }) && input) {
      input.value = "";
    }
    return;
  }

  const pack = COIN_PACKS.find((p) => p.id === selectedPackId);
  if (!pack) {
    showToast("Select a pack first");
    return;
  }
  applyRecharge({ coins: pack.coins, bonus: pack.bonus || 0, pesos: pack.pesos });
}

export function initRecharge() {
  // Event delegation so selection always works after re-renders
  document.getElementById("pack-grid")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-pack]");
    if (!btn || !document.getElementById("pack-grid")?.contains(btn)) return;
    selectPack(btn.dataset.pack);
  });

  document.getElementById("custom-recharge")?.addEventListener("click", (e) => {
    if (e.target.closest("input, label, button")) {
      selectPack("custom");
      return;
    }
    selectPack("custom");
  });

  document.getElementById("custom-recharge-amount")?.addEventListener("focus", () => {
    selectPack("custom");
  });

  document.getElementById("btn-do-recharge")?.addEventListener("click", submitRecharge);
}
