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
