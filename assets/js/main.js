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
  const icon = themeToggle.querySelector("i");
  if (icon) icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
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
