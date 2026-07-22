document.querySelectorAll("[data-profile-image]").forEach((image) => {
  const frame = image.closest(".portrait-frame");
  image.addEventListener("error", () => frame?.classList.add("is-fallback"));
  if (image.complete && image.naturalWidth === 0) {
    frame?.classList.add("is-fallback");
  }
});

const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

const activeTheme = () => root.dataset.theme || (systemTheme.matches ? "dark" : "light");

const updateThemeControl = () => {
  if (!themeToggle) return;
  const isDark = activeTheme() === "dark";
  const isChinese = document.documentElement.lang.startsWith("zh");
  const label = isChinese
    ? (isDark ? "切换至日间模式" : "切换至夜间模式")
    : (isDark ? "Use light mode" : "Use dark mode");
  themeToggle.setAttribute("aria-label", label);
  themeToggle.setAttribute("title", label);
  themeToggle.classList.toggle("is-dark", isDark);
  themeToggle.hidden = false;
};

if (themeToggle) {
  updateThemeControl();
  themeToggle.addEventListener("click", () => {
    const nextTheme = activeTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    try { localStorage.setItem("theme", nextTheme); } catch (error) { /* Storage may be disabled. */ }
    updateThemeControl();
  });
  systemTheme.addEventListener?.("change", updateThemeControl);
}

document.querySelectorAll("[data-current-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const footerShell = document.querySelector(".footer-shell");

if (footerShell) {
  const lastUpdate = document.createElement("p");
  lastUpdate.className = "footer-last-update";
  const modifiedAt = new Date(document.lastModified);
  const modifiedLabel = Number.isNaN(modifiedAt.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(modifiedAt);
  lastUpdate.textContent = `Last Update: ${modifiedLabel}`;

  const siteVisits = document.createElement("p");
  siteVisits.className = "footer-site-visits";
  siteVisits.textContent = "Site Visits: ";
  const siteVisitCount = document.createElement("span");
  siteVisitCount.textContent = "—";
  siteVisitCount.setAttribute("aria-live", "polite");
  siteVisits.append(siteVisitCount);

  footerShell.prepend(lastUpdate);
  footerShell.append(siteVisits);

  const visitorTracker = document.querySelector(".visitor-tracker");
  let visitorObserver = null;

  const updateVisitCount = () => {
    const counterText = visitorTracker
      ?.querySelector(".mapmyvisitors-visitors")
      ?.textContent?.trim();
    const count = counterText?.match(/\d[\d,]*/)?.[0];

    if (!count) return false;
    siteVisitCount.textContent = count;
    visitorObserver?.disconnect();
    return true;
  };

  if (visitorTracker && !updateVisitCount()) {
    visitorObserver = new MutationObserver(updateVisitCount);
    visitorObserver.observe(visitorTracker, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    window.setTimeout(() => visitorObserver?.disconnect(), 20000);
  }
}

let activePronunciationAudio = null;
let activePronunciationButton = null;

document.querySelectorAll("[data-pronunciation-audio]").forEach((button) => {
  button.addEventListener("click", () => {
    if (activePronunciationAudio) {
      activePronunciationAudio.pause();
      activePronunciationAudio.currentTime = 0;
      activePronunciationButton?.classList.remove("is-playing");
    }

    const audio = new Audio(button.dataset.pronunciationAudio);
    activePronunciationAudio = audio;
    activePronunciationButton = button;
    button.classList.add("is-playing");

    const reset = () => {
      button.classList.remove("is-playing");
      if (activePronunciationAudio === audio) {
        activePronunciationAudio = null;
        activePronunciationButton = null;
      }
    };

    audio.addEventListener("ended", reset, { once: true });
    audio.addEventListener("error", reset, { once: true });
    audio.play().catch(reset);
  });
});
