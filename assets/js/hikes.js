(() => {
  const routes = [
    { slug: "victoria-peak", name: "Victoria Peak", zh: "太平山頂", images: ["victoria-peak.jpg", "victoria-peak-02.jpg", "victoria-peak-03.jpg", "victoria-peak-04.jpg", "victoria-peak-05.jpg", "victoria-peak-06.jpg", "victoria-peak-07.jpg"], alt: "Hong Kong's skyline viewed from Victoria Peak", note: "A familiar Hong Kong skyline seen from higher ground." },
    { slug: "tai-mo-shan", name: "Tai Mo Shan", zh: "大帽山", images: ["tai-mo-shan-fa5a3331aa1aa5640f5c8acdc87ea763.jpg", "tai-mo-shan-02.jpg", "tai-mo-shan.jpg", "tai-mo-shan-03.jpg", "tai-mo-shan-04.jpg", "tai-mo-shan-05.jpg", "tai-mo-shan-06.jpg", "tai-mo-shan-07.jpg", "tai-mo-shan-08.jpg", "tai-mo-shan-206673ec105e65d76dfdfed65c0f6cf6.jpg", "tai-mo-shan-4d750ec4f22ffaddd29be4719efd2d9f.jpg", "tai-mo-shan-bbcbf910e066b16500c9f84f54797172.jpg", "tai-mo-shan-d0d7ffd37f14c4d3b6c07ce7b7913c28.jpg"], alt: "Mountain slopes and the city below Tai Mo Shan", note: "Mountain slopes, cloud, and the city fading into the distance." },
    { slug: "lamma-island", name: "Lamma Island", zh: "南丫島", images: ["lamma-island.jpg", "lamma-island-02.jpg", "lamma-island-03.jpg", "lamma-island-04.jpg", "lamma-island-05.jpg", "lamma-island-06.jpg", "lamma-island-07.jpg", "lamma-island-08.jpg"], alt: "Coastal scenery on Lamma Island", note: "A quieter meeting of trail, beach, and open water." },
    { slug: "lai-chi-wo", name: "Lai Chi Wo", zh: "荔枝窩", images: ["lai-chi-wo.jpg", "lai-chi-wo-02.jpg", "lai-chi-wo-03.jpg", "lai-chi-wo-04.jpg", "lai-chi-wo-05.jpg", "lai-chi-wo-06.jpg", "lai-chi-wo-07.jpg"], alt: "Coastal scenery near Lai Chi Wo", note: "Rocky shoreline and layered hills under changing skies." },
    { slug: "lantau-trail", name: "Lantau Trail", zh: "大嶼山 · 分流", images: ["lantau-trail.jpg", "lantau-trail-02.jpg", "lantau-trail-03.jpg", "lantau-trail-04.jpg", "lantau-trail-05.jpg", "lantau-trail-06.jpg"], alt: "Coastal scenery along the Lantau Trail", note: "A coastal walk opening toward islands on the horizon." },
    { slug: "shek-o", name: "Shek O", zh: "石澳", images: ["shek-o.jpg", "shek-o-02.jpg", "shek-o-03.jpg", "shek-o-04.jpg", "shek-o-05.jpg", "shek-o-06.jpg", "shek-o-07.jpg"], alt: "Sea and green hills at Shek O", note: "Sea, surf, and green hills along Hong Kong's eastern edge." },
    { slug: "sai-kung-north", name: "Sai Kung North", zh: "西貢北", images: ["sai-kung-north.jpg", "sai-kung-north-02.jpg", "sai-kung-north-03.jpg", "sai-kung-north-04.jpg", "sai-kung-north-05.jpg"], alt: "Mountain scenery in Sai Kung North", note: "Mountain water and a rugged path through the northeastern landscape." },
    { slug: "pat-sin-leng", name: "Pat Sin Leng", zh: "八仙嶺", images: ["pat-sin-leng.jpg", "pat-sin-leng-02.jpg", "pat-sin-leng-03.jpg", "pat-sin-leng-04.jpg", "pat-sin-leng-05.jpg", "pat-sin-leng-06.jpg", "pat-sin-leng-07.jpg"], alt: "Mountain scenery at Pat Sin Leng", note: "A steep ridgeline walk across one of Hong Kong's most distinctive mountain profiles." },
    { slug: "ma-on-shan", name: "Ma On Shan", zh: "馬鞍山", images: ["ma-on-shan.jpg", "ma-on-shan-02.jpg", "ma-on-shan-03.jpg", "ma-on-shan-04.jpg", "ma-on-shan-05.jpg", "ma-on-shan-06.jpg"], alt: "Mountain ridges and coastline seen from Ma On Shan", note: "A high ridge with the islands and coastline spread below." },
    { slug: "luk-chau-stone-bushland", name: "Luk Chau Stone Bushland", zh: "鹿巢石林", images: ["luk-chau-stone-bushland.jpg", "luk-chau-stone-bushland-02.jpg", "luk-chau-stone-bushland-03.jpg", "luk-chau-stone-bushland-04.jpg", "luk-chau-stone-bushland-05.jpg"], alt: "Rock formations and hillside scenery at Luk Chau Stone Bushland", note: "A rugged hillside landscape shaped by striking clusters of weathered stone." },
    { slug: "tai-to-yan", name: "Tai To Yan", zh: "大刀屻", images: ["tai-to-yan-04.jpg", "tai-to-yan.jpg", "tai-to-yan-02.jpg", "tai-to-yan-03.jpg", "tai-to-yan-05.jpg", "tai-to-yan-06.jpg", "tai-to-yan-07.jpg", "tai-to-yan-08.jpg", "tai-to-yan-09.jpg"], alt: "Woodland and mountain scenery at Tai To Yan", note: "A shaded woodland path between the ridgelines." },
    { slug: "kai-kung-leng", name: "Kai Kung Leng", zh: "雞公嶺", images: ["kai-kung-leng.jpg", "kai-kung-leng-02.jpg", "kai-kung-leng-03.jpg", "kai-kung-leng-04.jpg", "kai-kung-leng-05.jpg", "kai-kung-leng-06.jpg", "kai-kung-leng-07.jpg", "kai-kung-leng-08.jpg", "kai-kung-leng-09.jpg", "kai-kung-leng-10.jpg", "kai-kung-leng-11.jpg"], alt: "Open ridgelines and mountain scenery at Kai Kung Leng", note: "Long, open ridgelines with broad views across Hong Kong's northern landscape." }
  ];
  const pageVersion = "20260726-7";
  const assetVersion = "20260726-7";
  const routeHref = (route) => `${route.slug}.html?v=${pageVersion}`;

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
        <a href="${routeHref(item)}"${item.slug === slug ? ' aria-current="page"' : ""}>
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
            <img src="../assets/img/hikes/${image}?v=${assetVersion}" alt="${route.alt}, photograph ${index + 1} of ${photoCount}" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>
          </figure>`).join("")}
      </div>
      ${photoCount > 1 ? `
        <button class="route-gallery-button route-gallery-previous" type="button" data-gallery-previous aria-label="Previous photograph">&#8592;</button>
        <button class="route-gallery-button route-gallery-next" type="button" data-gallery-next aria-label="Next photograph">&#8594;</button>` : ""}
      <button class="route-gallery-autoplay" type="button" data-gallery-autoplay aria-label="Pause slideshow" title="Pause slideshow">&#10074;&#10074;</button>
      <p class="route-gallery-count" aria-live="polite"><span data-gallery-current>1</span> / ${photoCount}</p>
    </div>
    <p class="route-note">${route.note}</p>
    <nav class="route-pager" aria-label="Adjacent hiking routes">
      <a href="${routeHref(previous)}">← ${previous.name}</a>
      <a href="${routeHref(next)}">${next.name} →</a>
    </nav>`;

  if (photoCount < 2) return;

  const track = page.querySelector("[data-gallery-track]");
  const current = page.querySelector("[data-gallery-current]");
  const previousButton = page.querySelector("[data-gallery-previous]");
  const nextButton = page.querySelector("[data-gallery-next]");
  const autoplayButton = page.querySelector("[data-gallery-autoplay]");
  const gallery = page.querySelector("[data-gallery]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsHover = window.matchMedia("(hover: hover)").matches;
  let activeIndex = 0;
  let frame = 0;
  let autoplayTimer = 0;
  let userPaused = reducedMotion;
  let hoverPaused = false;
  let focusPaused = false;
  const autoplayDelay = 5000;

  const updateControls = () => {
    activeIndex = Math.max(0, Math.min(photoCount - 1, Math.round(track.scrollLeft / track.clientWidth)));
    current.textContent = String(activeIndex + 1);
    previousButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === photoCount - 1;
  };

  const goTo = (index, behavior) => {
    const target = Math.max(0, Math.min(photoCount - 1, index));
    track.scrollTo({
      left: target * track.clientWidth,
      behavior: behavior || (reducedMotion ? "auto" : "smooth")
    });
  };

  const clearAutoplay = () => {
    window.clearTimeout(autoplayTimer);
    autoplayTimer = 0;
  };

  const updateAutoplayButton = () => {
    const paused = userPaused || reducedMotion;
    autoplayButton.innerHTML = paused ? "&#9654;" : "&#10074;&#10074;";
    autoplayButton.setAttribute("aria-label", paused ? "Play slideshow" : "Pause slideshow");
    autoplayButton.setAttribute("title", paused ? "Play slideshow" : "Pause slideshow");
    autoplayButton.setAttribute("aria-pressed", String(!paused));
  };

  const scheduleAutoplay = () => {
    clearAutoplay();
    if (userPaused || reducedMotion || hoverPaused || focusPaused || document.hidden) return;

    autoplayTimer = window.setTimeout(() => {
      if (activeIndex === photoCount - 1) {
        goTo(0, "auto");
      } else {
        goTo(activeIndex + 1);
      }
      scheduleAutoplay();
    }, autoplayDelay);
  };

  const restartAutoplay = () => {
    if (!userPaused) scheduleAutoplay();
  };

  previousButton.addEventListener("click", () => {
    goTo(activeIndex - 1);
    restartAutoplay();
  });
  nextButton.addEventListener("click", () => {
    goTo(activeIndex + 1);
    restartAutoplay();
  });
  autoplayButton.addEventListener("click", () => {
    userPaused = !userPaused;
    updateAutoplayButton();
    if (userPaused) {
      clearAutoplay();
    } else {
      scheduleAutoplay();
    }
  });
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
  if (supportsHover) {
    gallery.addEventListener("mouseenter", () => {
      hoverPaused = true;
      clearAutoplay();
    });
    gallery.addEventListener("mouseleave", () => {
      hoverPaused = false;
      scheduleAutoplay();
    });
  }
  track.addEventListener("focus", () => {
    focusPaused = true;
    clearAutoplay();
  });
  track.addEventListener("blur", () => {
    focusPaused = false;
    scheduleAutoplay();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearAutoplay();
    } else {
      scheduleAutoplay();
    }
  });
  window.addEventListener("resize", () => {
    updateControls();
    restartAutoplay();
  }, { passive: true });
  updateAutoplayButton();
  updateControls();
  scheduleAutoplay();
})();
