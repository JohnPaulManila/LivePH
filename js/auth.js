import { DEMO_CODE, DEV_ACCOUNT } from "./data.js";
import {
  bridge,
  els,
  saveSession,
  showToast,
  state,
} from "./core.js";

export function showAuthStep(step) {
  els.formLogin.classList.toggle("is-active", step === "login");
  els.formRegister.classList.toggle("is-active", step === "register");
  els.formVerify.classList.toggle("is-active", step === "verify");

  if (step === "login" || step === "register") {
    els.authTabs.forEach((tab) => {
      const active = tab.dataset.authTab === step;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
  }
}

function loginAsDev() {
  const { password, coins, totalRecharged = 0, followers = 0, ...user } = DEV_ACCOUNT;
  state.user = user;
  state.coins = coins;
  state.totalRecharged = totalRecharged;
  state.followers = followers;
  state.followingList = [];
  saveSession();
  bridge.enterApp?.();
  showToast("Logged in as DEV Tester");
}

function matchesDevLogin(identifier, password) {
  const id = String(identifier || "").trim().toLowerCase();
  const pass = String(password || "");
  const emails = [DEV_ACCOUNT.email.toLowerCase(), DEV_ACCOUNT.username.toLowerCase()];
  return emails.includes(id) && pass === DEV_ACCOUNT.password;
}

export function initAuth() {
  bridge.showAuthStep = showAuthStep;

  els.authTabs.forEach((tab) => {
    tab.addEventListener("click", () => showAuthStep(tab.dataset.authTab));
  });

  els.formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(els.formLogin);
    const identifier = String(fd.get("identifier") || "").trim();
    const password = String(fd.get("password") || "");

    if (matchesDevLogin(identifier, password)) {
      loginAsDev();
      return;
    }

    state.user = {
      username: identifier.includes("@") ? identifier.split("@")[0] : "liveph_user",
      displayName: "LivePH User",
      fullName: "LivePH",
      middleName: "",
      lastName: "User",
      email: identifier.includes("@") ? identifier : "user@liveph.app",
      phone: identifier.includes("@") ? "+63 900 000 0000" : identifier,
      hideRealName: true,
      verifyVia: identifier.includes("@") ? "email" : "phone",
    };
    state.coins = 1250;
    state.totalRecharged = 0;
    state.followers = 0;
    state.followingList = [];
    saveSession();
    bridge.enterApp?.();
    showToast("Welcome back");
  });

  els.btnDevLogin?.addEventListener("click", loginAsDev);

  els.formRegister.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(els.formRegister);
    const verifyVia = String(fd.get("verifyVia") || "email");

    state.pendingRegistration = {
      username: String(fd.get("username") || "").trim(),
      displayName: String(fd.get("displayName") || "").trim(),
      fullName: String(fd.get("fullName") || "").trim(),
      middleName: String(fd.get("middleName") || "").trim(),
      lastName: String(fd.get("lastName") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      hideRealName: Boolean(fd.get("hideRealName")),
      verifyVia,
    };

    const target =
      verifyVia === "email"
        ? state.pendingRegistration.email
        : state.pendingRegistration.phone;

    els.verifyCopy.textContent = `We sent a 6-digit code to your ${verifyVia}: ${target}`;
    els.demoCodeHint.textContent = `Demo code: ${DEMO_CODE}`;
    showAuthStep("verify");
    showToast(`Code sent via ${verifyVia}`);
  });

  els.formVerify.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(els.formVerify);
    const code = String(fd.get("code") || "").trim();

    if (code !== DEMO_CODE) {
      showToast("Invalid code. Use the demo code shown below.");
      return;
    }

    if (!state.pendingRegistration) {
      showToast("Start registration again");
      showAuthStep("register");
      return;
    }

    state.user = { ...state.pendingRegistration };
    state.pendingRegistration = null;
    state.coins = 1250;
    state.totalRecharged = 0;
    state.followers = 0;
    state.followingList = [];
    saveSession();
    bridge.enterApp?.();
    showToast("Account verified — welcome to LivePH");
  });

  els.btnResend.addEventListener("click", () => {
    const via = state.pendingRegistration?.verifyVia || "email";
    showToast(`New code sent via ${via}`);
    els.demoCodeHint.textContent = `Demo code: ${DEMO_CODE}`;
  });
}
