const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav-links");

if (toggle && nav) {
  const closedLabel = toggle.dataset.closedLabel || toggle.textContent || "Menu";
  const openLabel = toggle.dataset.openLabel || "Close";

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? openLabel : closedLabel;
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = closedLabel;
    }
  });
}

document.querySelectorAll("[data-profile-image]").forEach((image) => {
  const frame = image.closest(".portrait-frame");
  image.addEventListener("error", () => frame?.classList.add("is-fallback"));
  if (image.complete && image.naturalWidth === 0) {
    frame?.classList.add("is-fallback");
  }
});

document.querySelectorAll("[data-current-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});
