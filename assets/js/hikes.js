(() => {
  const routes = [
    { slug: "victoria-peak", name: "Victoria Peak", zh: "太平山頂", images: ["victoria-peak.jpg", "victoria-peak-02.jpg", "victoria-peak-03.jpg"], alt: "Hong Kong's skyline viewed from Victoria Peak", note: "A familiar Hong Kong skyline seen from higher ground." },
    { slug: "tai-mo-shan", name: "Tai Mo Shan", zh: "大帽山", images: ["tai-mo-shan.jpg", "tai-mo-shan-02.jpg", "tai-mo-shan-03.jpg"], alt: "Mountain slopes and the city below Tai Mo Shan", note: "Mountain slopes, cloud, and the city fading into the distance." },
    { slug: "lamma-island", name: "Lamma Island", zh: "南丫島", images: ["lamma-island.jpg", "lamma-island-02.jpg", "lamma-island-03.jpg"], alt: "Coastal scenery on Lamma Island", note: "A quieter meeting of trail, beach, and open water." },
    { slug: "lai-chi-wo", name: "Lai Chi Wo", zh: "荔枝窩", images: ["lai-chi-wo.jpg", "lai-chi-wo-02.jpg", "lai-chi-wo-03.jpg"], alt: "Coastal scenery near Lai Chi Wo", note: "Rocky shoreline and layered hills under changing skies." },
    { slug: "lantau-trail", name: "Lantau Trail", zh: "大嶼山 · 分流", images: ["lantau-trail.jpg", "lantau-trail-02.jpg", "lantau-trail-03.jpg"], alt: "Coastal scenery along the Lantau Trail", note: "A coastal walk opening toward islands on the horizon." },
    { slug: "shek-o", name: "Shek O", zh: "石澳", images: ["shek-o.jpg", "shek-o-02.jpg", "shek-o-03.jpg"], alt: "Sea and green hills at Shek O", note: "Sea, surf, and green hills along Hong Kong's eastern edge." },
    { slug: "sai-kung-north", name: "Sai Kung North", zh: "西貢北", images: ["sai-kung-north.jpg", "sai-kung-north-02.jpg", "sai-kung-north-03.jpg"], alt: "Mountain scenery in Sai Kung North", note: "Mountain water and a rugged path through the northeastern landscape." },
    { slug: "pat-sin-leng", name: "Pat Sin Leng", zh: "八仙嶺", images: ["pat-sin-leng.jpg"], alt: "Mountain scenery at Pat Sin Leng", note: "A steep ridgeline walk across one of Hong Kong's most distinctive mountain profiles." },
    { slug: "ma-on-shan", name: "Ma On Shan", zh: "馬鞍山", images: ["ma-on-shan.jpg", "ma-on-shan-02.jpg", "ma-on-shan-03.jpg"], alt: "Mountain ridges and coastline seen from Ma On Shan", note: "A high ridge with the islands and coastline spread below." },
    { slug: "tai-to-yan", name: "Tai To Yan", zh: "大刀屻", images: ["tai-to-yan.jpg", "tai-to-yan-02.jpg", "tai-to-yan-03.jpg"], alt: "Woodland and mountain scenery at Tai To Yan", note: "A shaded woodland path between the ridgelines." }
  ];

  const page = document.querySelector("[data-hike-page]");
  const sidebar = document.querySelector("[data-trail-sidebar]");
  if (!page || !sidebar) return;

  const slug = page.dataset.hikePage;
  const routeIndex = routes.findIndex((route) => route.slug === slug);
  if (routeIndex < 0) return;
  const route = routes[routeIndex];
  const previous = routes[(routeIndex - 1 + routes.length) % routes.length];
  const next = routes[(routeIndex + 1) % routes.length];
  const photoCount = route.images.length;

  sidebar.innerHTML = `
    <p class="trail-sidebar-label">Trails &amp; Places</p>
    <nav class="trail-index" aria-label="Hiking routes">
      ${routes.map((item, index) => `
        <a href="${item.slug}.html"${item.slug === slug ? ' aria-current="page"' : ""}>
          <span class="trail-number">${String(index + 1).padStart(2, "0")}</span>
          <span><strong>${item.name}</strong><small lang="zh-Hant">${item.zh}</small></span>
        </a>`).join("")}
    </nav>`;

  page.innerHTML = `
    <header class="route-header">
      <p class="route-kicker">Hiking Journal · ${String(routeIndex + 1).padStart(2, "0")}</p>
      <h1 class="route-title">${route.name}</h1>
      <p class="route-title-zh" lang="zh-Hant">${route.zh}</p>
    </header>
    <div class="route-gallery" data-gallery>
      <div class="route-gallery-track" data-gallery-track tabindex="0" aria-label="${route.name} photo album">
        ${route.images.map((image, index) => `
          <figure class="route-slide">
            <img src="../assets/img/hikes/${image}" alt="${route.alt}, photograph ${index + 1} of ${photoCount}" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>
          </figure>`).join("")}
      </div>
      ${photoCount > 1 ? `
        <button class="route-gallery-button route-gallery-previous" type="button" data-gallery-previous aria-label="Previous photograph">&#8592;</button>
        <button class="route-gallery-button route-gallery-next" type="button" data-gallery-next aria-label="Next photograph">&#8594;</button>` : ""}
      <p class="route-gallery-count" aria-live="polite"><span data-gallery-current>1</span> / ${photoCount}</p>
    </div>
    <p class="route-note">${route.note}</p>
    <nav class="route-pager" aria-label="Adjacent hiking routes">
      <a href="${previous.slug}.html">← ${previous.name}</a>
      <a href="${next.slug}.html">${next.name} →</a>
    </nav>`;

  if (photoCount < 2) return;

  const track = page.querySelector("[data-gallery-track]");
  const current = page.querySelector("[data-gallery-current]");
  const previousButton = page.querySelector("[data-gallery-previous]");
  const nextButton = page.querySelector("[data-gallery-next]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeIndex = 0;
  let frame = 0;

  const updateControls = () => {
    activeIndex = Math.max(0, Math.min(photoCount - 1, Math.round(track.scrollLeft / track.clientWidth)));
    current.textContent = String(activeIndex + 1);
    previousButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === photoCount - 1;
  };

  const goTo = (index) => {
    const target = Math.max(0, Math.min(photoCount - 1, index));
    track.scrollTo({ left: target * track.clientWidth, behavior: reducedMotion ? "auto" : "smooth" });
  };

  previousButton.addEventListener("click", () => goTo(activeIndex - 1));
  nextButton.addEventListener("click", () => goTo(activeIndex + 1));
  track.addEventListener("scroll", () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(updateControls);
  }, { passive: true });
  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(activeIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(activeIndex + 1);
    }
  });
  window.addEventListener("resize", updateControls, { passive: true });
  updateControls();
})();
