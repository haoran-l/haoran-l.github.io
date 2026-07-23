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
const sitePageviewUrl = "https://pub-7f356cb589ad41c8b97676a5481bfcbb.r2.dev/site-info";
const visitCountBaseline = 36;

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
  siteVisits.textContent = "Pageviews: ";
  const siteVisitCount = document.createElement("span");
  siteVisitCount.textContent = "—";
  siteVisitCount.setAttribute("aria-live", "polite");
  siteVisits.append(siteVisitCount);

  footerShell.prepend(lastUpdate);
  footerShell.append(siteVisits);

  const cachedVisitCountKey = "haoran-site-pageview-count";

  const setVisitCount = (value) => {
    const numericValue = Number(String(value).replace(/,/g, ""));
    if (!Number.isFinite(numericValue) || numericValue < 0) return false;

    siteVisitCount.textContent = new Intl.NumberFormat("en-US").format(numericValue);
    try { localStorage.setItem(cachedVisitCountKey, String(numericValue)); } catch (error) { /* Storage may be disabled. */ }
    return true;
  };

  setVisitCount(visitCountBaseline);

  try {
    const cachedVisitCount = localStorage.getItem(cachedVisitCountKey);
    if (cachedVisitCount !== null) setVisitCount(cachedVisitCount);
  } catch (error) { /* Storage may be disabled. */ }

  const loadR2Pageviews = async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(sitePageviewUrl, {
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`R2 counter returned ${response.status}`);
      const data = await response.json();
      setVisitCount(data.count);
    } catch (error) { /* Cached/static count remains available. */ } finally {
      window.clearTimeout(timeout);
    }
  };

  loadR2Pageviews();
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
