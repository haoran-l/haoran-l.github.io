document.querySelectorAll("[data-profile-image]").forEach((image) => {
  const frame = image.closest(".portrait-frame");
  image.addEventListener("error", () => frame?.classList.add("is-fallback"));
  if (image.complete && image.naturalWidth === 0) {
    frame?.classList.add("is-fallback");
  }
});

const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeOptions = ["default", "comfort", "dark"];
const activeTheme = () => themeOptions.includes(root.dataset.theme) ? root.dataset.theme : "default";

const themeIcons = {
  default: '<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0 0 16Z" fill="currentColor" stroke="none" opacity=".45"/></svg>',
  comfort: '<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  dark: '<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.1A8.2 8.2 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z"/></svg>',
};

const themeLabels = document.documentElement.lang.startsWith("zh")
  ? { default: "默认灰色", comfort: "护眼暖黄色", dark: "深色" }
  : { default: "Default grey", comfort: "Eye-comfort warm", dark: "Dark" };

let themeSwitch = null;

const setTheme = (theme) => {
  const selectedTheme = themeOptions.includes(theme) ? theme : "default";
  root.dataset.theme = selectedTheme;
  try { localStorage.setItem("theme", selectedTheme); } catch (error) { /* Storage may be disabled. */ }

  themeSwitch?.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.themeChoice === selectedTheme));
  });

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.content = selectedTheme === "dark" ? "#1d1a1e" : selectedTheme === "comfort" ? "#f5f1e8" : "#f2f2f0";
  }
};

if (themeToggle) {
  themeSwitch = document.createElement("div");
  themeSwitch.className = "theme-switch";
  themeSwitch.setAttribute("role", "group");
  themeSwitch.setAttribute("aria-label", document.documentElement.lang.startsWith("zh") ? "页面颜色主题" : "Page color theme");

  themeOptions.forEach((theme) => {
    const button = document.createElement("button");
    button.className = "theme-choice";
    button.type = "button";
    button.dataset.themeChoice = theme;
    button.setAttribute("aria-label", themeLabels[theme]);
    button.setAttribute("title", themeLabels[theme]);
    button.innerHTML = themeIcons[theme];
    button.addEventListener("click", () => setTheme(theme));
    themeSwitch.append(button);
  });

  themeToggle.replaceWith(themeSwitch);
  setTheme(activeTheme());
}

document.querySelectorAll("[data-current-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const footerShell = document.querySelector(".footer-shell");
const siteAnalyticsUrl = "https://haoran-visitor-analytics.haoran-leighton-liu.workers.dev";

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
  siteVisitCount.textContent = "";
  siteVisitCount.setAttribute("aria-live", "polite");
  siteVisits.append(siteVisitCount);

  footerShell.prepend(lastUpdate);
  footerShell.append(siteVisits);

  const setVisitCount = (value) => {
    const numericValue = Number(String(value).replace(/,/g, ""));
    if (!Number.isFinite(numericValue) || numericValue < 0) return false;

    siteVisitCount.textContent = new Intl.NumberFormat("en-US").format(numericValue);
    return true;
  };

  const loadCurrentPageviews = async (endpoint) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(`${endpoint}/count`, {
        cache: "no-store",
        credentials: "omit",
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`Analytics counter returned ${response.status}`);
      const data = await response.json();
      setVisitCount(data.count);
    } catch (error) { /* Keep the count blank when the current counter is unavailable. */ } finally {
      window.clearTimeout(timeout);
    }
  };

  const collectPageview = async () => {
    const endpoint = siteAnalyticsUrl.trim().replace(/\/$/, "");
    if (!endpoint) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(`${endpoint}/collect`, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify({
          path: window.location.pathname,
          referrer: document.referrer,
        }),
        credentials: "omit",
        keepalive: true,
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`Analytics collector returned ${response.status}`);
      const data = await response.json();
      if (!setVisitCount(data.count)) throw new Error("Analytics collector returned an invalid count");
    } catch (error) {
      await loadCurrentPageviews(endpoint);
    } finally {
      window.clearTimeout(timeout);
    }
  };

  collectPageview();
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
