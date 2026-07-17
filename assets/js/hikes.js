(() => {
  const routes = [
    { slug: "victoria-peak", name: "Victoria Peak", zh: "太平山頂", image: "victoria-peak.jpg", alt: "Hong Kong's skyline viewed from Victoria Peak", note: "A familiar Hong Kong skyline seen from higher ground." },
    { slug: "tai-mo-shan", name: "Tai Mo Shan", zh: "大帽山", image: "tai-mo-shan.jpg", alt: "Hillside vegetation with the city fading into mist below Tai Mo Shan", note: "Mountain slopes, cloud, and the city fading into the distance." },
    { slug: "lamma-island", name: "Lamma Island", zh: "南丫島", image: "lamma-island.jpg", alt: "A quiet beach backed by green hills on Lamma Island", note: "A quieter meeting of trail, beach, and open water." },
    { slug: "lai-chi-wo", name: "Lai Chi Wo", zh: "荔枝窩", image: "lai-chi-wo.jpg", alt: "A rocky shoreline and green hills near Lai Chi Wo", note: "Rocky shoreline and layered hills under changing skies." },
    { slug: "lantau-trail", name: "Lantau Trail", zh: "大嶼山 · 分流", image: "lantau-trail.jpg", alt: "A coastal view toward islands from the Lantau Trail", note: "A coastal walk opening toward islands on the horizon." },
    { slug: "shek-o", name: "Shek O", zh: "石澳", image: "shek-o.jpg", alt: "A sunlit bay and green hills at Shek O", note: "Sea, surf, and green hills along Hong Kong's eastern edge." },
    { slug: "sai-kung-north", name: "Sai Kung North", zh: "西貢北", image: "sai-kung-north.jpg", alt: "A rocky mountain pool surrounded by green hills in Sai Kung North", note: "Mountain water and a rugged path through the northeastern landscape." },
    { slug: "pat-sin-leng", name: "Pat Sin Leng", zh: "八仙嶺", image: null, alt: "", note: "More photographs and notes from this route will be added here." },
    { slug: "ma-on-shan", name: "Ma On Shan", zh: "馬鞍山", image: "ma-on-shan.jpg", alt: "Mountain ridges and coastline seen from Ma On Shan", note: "A high ridge with the islands and coastline spread below." },
    { slug: "tai-to-yan", name: "Tai To Yan", zh: "大刀屻", image: "tai-to-yan.jpg", alt: "A shaded woodland path at Tai To Yan", note: "A shaded woodland path between the ridgelines." }
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

  sidebar.innerHTML = `
    <p class="trail-sidebar-label">Trails &amp; Places</p>
    <nav class="trail-index" aria-label="Hiking routes">
      ${routes.map((item, index) => `
        <a href="${item.slug}.html"${item.slug === slug ? ' aria-current="page"' : ""}>
          <span class="trail-number">${String(index + 1).padStart(2, "0")}</span>
          <span><strong>${item.name}</strong><small>${item.zh}</small></span>
        </a>`).join("")}
    </nav>`;

  page.innerHTML = `
    <header class="route-header">
      <p class="route-kicker">Hiking Journal · ${String(routeIndex + 1).padStart(2, "0")}</p>
      <h1 class="route-title">${route.name}</h1>
      <p class="route-title-zh" lang="zh-Hant">${route.zh}</p>
    </header>
    <figure class="route-photo">
      ${route.image
        ? `<img src="../assets/img/hikes/${route.image}" alt="${route.alt}">`
        : `<div class="route-photo-placeholder">More photographs from this route will be added soon.</div>`}
    </figure>
    <p class="route-note">${route.note}</p>
    <nav class="route-pager" aria-label="Adjacent hiking routes">
      <a href="${previous.slug}.html">← ${previous.name}</a>
      <a href="${next.slug}.html">${next.name} →</a>
    </nav>`;
})();
