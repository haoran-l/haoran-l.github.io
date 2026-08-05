export const DASHBOARD_HTML = String.raw`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f2f2f0">
  <title>Visitor Analytics · Haoran Liu</title>
  <style>
    :root { color-scheme: light dark; font-family: Manrope, Inter, ui-sans-serif, system-ui, sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; color: light-dark(#292529, #eee9ec); background: light-dark(#f2f2f0, #1d1a1e); }
    button, select { color: inherit; font: inherit; }
    button { cursor: pointer; }
    .topbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px clamp(18px, 4vw, 46px); background: light-dark(#e7e4e1, #252126); border-bottom: 1px solid light-dark(#d5d0cd, #3b353d); }
    .brand { display: flex; align-items: center; gap: 11px; }
    .brand-mark { display: grid; place-items: center; width: 35px; height: 35px; color: light-dark(#6f3f55, #f0cadc); background: light-dark(#ddccd4, #4a2f3c); border-radius: 10px; }
    .brand strong, .brand small { display: block; }
    .brand strong, h1, h2 { font-weight: 500; }
    .brand small, .muted { color: light-dark(#756e71, #b9b1b7); font-size: 12px; }
    .actions, .panel-head, .heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    select, .refresh { min-height: 36px; padding: 7px 11px; background: light-dark(#fffefd, #312c32); border: 1px solid light-dark(#d2ccca, #49424a); border-radius: 9px; }
    main { width: min(1180px, 100%); margin: 0 auto; padding: 26px clamp(16px, 4vw, 42px) 44px; }
    .heading { align-items: flex-end; margin-bottom: 18px; }
    h1 { margin: 0; font-family: Newsreader, Georgia, serif; font-size: clamp(25px, 4vw, 34px); }
    h2 { margin: 0; font-size: 15px; }
    .status { display: inline-flex; align-items: center; gap: 7px; padding: 6px 9px; color: light-dark(#365c49, #a8dec2); background: light-dark(#dcebe2, #233e31); border-radius: 999px; font-size: 12px; }
    .status::before { content: ""; width: 7px; height: 7px; background: light-dark(#43805f, #70c896); border-radius: 50%; }
    .kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 15px; }
    .kpi, .panel { background: light-dark(#fffefd, #272328); border: 1px solid light-dark(#ded9d6, #3d373e); border-radius: 13px; }
    .kpi { padding: 15px 16px; }
    .kpi-label { margin-bottom: 8px; color: light-dark(#756e71, #bab1b7); font-size: 12px; }
    .kpi-value { font-family: Newsreader, Georgia, serif; font-size: 28px; font-variant-numeric: tabular-nums; }
    .grid { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(240px, .7fr); gap: 14px; margin-bottom: 14px; }
    .panel { padding: 16px; }
    .panel-head { margin-bottom: 14px; }
    .chart { width: 100%; height: 190px; overflow: visible; }
    .gridline { stroke: light-dark(#e2ddda, #3b353c); stroke-width: 1; }
    .area { fill: light-dark(rgba(111, 63, 85, .13), rgba(204, 142, 171, .13)); }
    .line { fill: none; stroke: light-dark(#6f3f55, #d092af); stroke-width: 2.2; }
    .point { fill: light-dark(#6f3f55, #d092af); }
    .axis-text { fill: light-dark(#7a7376, #b9b0b6); font-size: 10px; }
    .locations { display: grid; gap: 13px; }
    .location-head { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 6px; font-size: 12px; }
    .track { height: 7px; overflow: hidden; background: light-dark(#e9e4e2, #3b353c); border-radius: 999px; }
    .fill { height: 100%; background: light-dark(#8b5a70, #c27e9e); border-radius: inherit; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 11px 10px; text-align: left; border-bottom: 1px solid light-dark(#e4dfdd, #3a353b); white-space: nowrap; }
    th { color: light-dark(#6f686b, #b7afb4); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: .04em; }
    tbody tr:last-child td { border-bottom: 0; }
    .ip-link { color: light-dark(#63384c, #efbfd5); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; text-underline-offset: 3px; }
    .path { max-width: 220px; overflow: hidden; text-overflow: ellipsis; }
    .empty { padding: 24px 0; color: light-dark(#756e71, #b9b1b7); text-align: center; }
    .error { display: none; margin-bottom: 14px; padding: 11px 13px; color: light-dark(#782f35, #ffc1c5); background: light-dark(#f1dadd, #48252a); border-radius: 10px; }
    @media (max-width: 760px) {
      .topbar, .heading { align-items: flex-start; flex-direction: column; }
      .actions { width: 100%; }
      .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 430px) { .kpis { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="brand"><span class="brand-mark" aria-hidden="true">⌁</span><span><strong>Visitor Analytics</strong><small>haoran-l.github.io</small></span></div>
    <div class="actions"><label class="muted" for="range">Date range</label><select id="range"><option value="7">Last 7 days</option><option value="30" selected>Last 30 days</option><option value="90">Last 90 days</option></select><button class="refresh" id="refresh" type="button">Refresh</button></div>
  </header>
  <main>
    <div class="heading"><div><h1>Traffic overview</h1><span class="muted" id="updated">Loading…</span></div><div><span class="status">Private dashboard</span> <a class="status" href="/logout">Sign out</a></div></div>
    <div class="error" id="error" role="alert"></div>
    <section class="kpis" aria-label="Traffic summary">
      <div class="kpi"><div class="kpi-label">Total pageviews</div><div class="kpi-value" id="total">—</div></div>
      <div class="kpi"><div class="kpi-label">Period pageviews</div><div class="kpi-value" id="period">—</div></div>
      <div class="kpi"><div class="kpi-label">Unique visitors</div><div class="kpi-value" id="unique">—</div></div>
      <div class="kpi"><div class="kpi-label">Countries / regions</div><div class="kpi-value" id="countries">—</div></div>
    </section>
    <div class="grid">
      <section class="panel" aria-labelledby="trend-title"><div class="panel-head"><h2 id="trend-title">Pageviews over time</h2><span class="muted" id="average"></span></div><svg class="chart" id="chart" viewBox="0 0 680 190" role="img" aria-label="Daily pageviews"></svg></section>
      <section class="panel" aria-labelledby="locations-title"><div class="panel-head"><h2 id="locations-title">Top locations</h2><span class="muted">Unique visitors</span></div><div class="locations" id="locations"></div></section>
    </div>
    <section class="panel" aria-labelledby="recent-title"><div class="panel-head"><div><h2 id="recent-title">Recent visitors</h2><span class="muted">Click an IP to open its WhatIsMyIPAddress report</span></div></div><div class="table-wrap"><table><thead><tr><th>Time</th><th>IP address</th><th>Location</th><th>Page</th><th>Browser</th></tr></thead><tbody id="visitors"></tbody></table></div></section>
  </main>
  <script>
    (function () {
      var range = document.getElementById("range");
      var refresh = document.getElementById("refresh");
      var formatter = new Intl.NumberFormat("en-US");
      var dateFormatter = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Hong_Kong", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

      function text(id, value) { document.getElementById(id).textContent = value; }
      function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
      function cell(row, value, className) { var td = document.createElement("td"); td.textContent = value || "—"; if (className) td.className = className; row.appendChild(td); return td; }
      function browserName(ua) { if (/Edg\//.test(ua)) return "Edge"; if (/Firefox\//.test(ua)) return "Firefox"; if (/Chrome\//.test(ua)) return "Chrome"; if (/Safari\//.test(ua)) return "Safari"; return "Other"; }

      function renderChart(rows, days) {
        var svg = document.getElementById("chart"); clear(svg);
        var values = rows.map(function (row) { return Number(row.pageviews || 0); });
        if (!values.length) { var empty = document.createElementNS("http://www.w3.org/2000/svg", "text"); empty.setAttribute("x", "340"); empty.setAttribute("y", "95"); empty.setAttribute("text-anchor", "middle"); empty.setAttribute("class", "axis-text"); empty.textContent = "No visits in this period"; svg.appendChild(empty); text("average", "0/day average"); return; }
        var width = 680, height = 190, left = 28, right = 12, top = 10, bottom = 27;
        var max = Math.max.apply(null, values.concat([1])) * 1.12;
        var x = function (i) { return left + i * ((width - left - right) / Math.max(1, values.length - 1)); };
        var y = function (value) { return top + (max - value) * ((height - top - bottom) / max); };
        [0, .5, 1].forEach(function (fraction) { var line = document.createElementNS("http://www.w3.org/2000/svg", "line"); var gy = top + fraction * (height - top - bottom); line.setAttribute("x1", left); line.setAttribute("x2", width - right); line.setAttribute("y1", gy); line.setAttribute("y2", gy); line.setAttribute("class", "gridline"); svg.appendChild(line); });
        var points = values.map(function (value, index) { return x(index).toFixed(1) + "," + y(value).toFixed(1); }).join(" ");
        var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon"); polygon.setAttribute("points", left + "," + (height-bottom) + " " + points + " " + (width-right) + "," + (height-bottom)); polygon.setAttribute("class", "area"); svg.appendChild(polygon);
        var polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline"); polyline.setAttribute("points", points); polyline.setAttribute("class", "line"); svg.appendChild(polyline);
        values.forEach(function (value, index) { var point = document.createElementNS("http://www.w3.org/2000/svg", "circle"); point.setAttribute("cx", x(index)); point.setAttribute("cy", y(value)); point.setAttribute("r", index === values.length - 1 ? 3.5 : 2); point.setAttribute("class", "point"); svg.appendChild(point); });
        text("average", Math.round(values.reduce(function (sum, value) { return sum + value; }, 0) / days) + "/day average");
      }

      function renderLocations(rows) {
        var root = document.getElementById("locations"); clear(root);
        if (!rows.length) { var empty = document.createElement("div"); empty.className = "empty"; empty.textContent = "No location data yet"; root.appendChild(empty); return; }
        var max = Number(rows[0].visitors || 1);
        rows.forEach(function (item) { var wrapper = document.createElement("div"); var head = document.createElement("div"); head.className = "location-head"; var label = document.createElement("span"); label.textContent = (item.city && item.city !== "Unknown" ? item.city + ", " : "") + (item.country || "XX"); var value = document.createElement("strong"); value.textContent = formatter.format(item.visitors || 0); head.append(label, value); var track = document.createElement("div"); track.className = "track"; var fill = document.createElement("div"); fill.className = "fill"; fill.style.width = Math.round(Number(item.visitors || 0) / max * 100) + "%"; track.appendChild(fill); wrapper.append(head, track); root.appendChild(wrapper); });
      }

      function renderVisitors(rows) {
        var root = document.getElementById("visitors"); clear(root);
        if (!rows.length) { var tr = document.createElement("tr"); var td = document.createElement("td"); td.colSpan = 5; td.className = "empty"; td.textContent = "No visitors in this period"; tr.appendChild(td); root.appendChild(tr); return; }
        rows.forEach(function (visitor) { var tr = document.createElement("tr"); cell(tr, dateFormatter.format(new Date(visitor.visitedAt * 1000))); var ipCell = document.createElement("td"); var link = document.createElement("a"); link.className = "ip-link"; link.textContent = visitor.ip; link.href = "https://whatismyipaddress.com/ip/" + encodeURIComponent(visitor.ip); link.target = "_blank"; link.rel = "noopener noreferrer"; ipCell.appendChild(link); tr.appendChild(ipCell); cell(tr, [visitor.city, visitor.region, visitor.country].filter(function (part, index, values) { return part && part !== "Unknown" && values.indexOf(part) === index; }).join(", ")); cell(tr, visitor.path, "path"); cell(tr, browserName(visitor.userAgent || "")); root.appendChild(tr); });
      }

      async function load() {
        refresh.disabled = true; document.getElementById("error").style.display = "none";
        try {
          var days = range.value;
          var responses = await Promise.all([fetch("/analytics-dashboard/api/summary?days=" + days, { cache: "no-store" }), fetch("/analytics-dashboard/api/visitors?days=" + days + "&limit=50", { cache: "no-store" })]);
          if (!responses[0].ok || !responses[1].ok) throw new Error("Dashboard data is unavailable");
          var summary = await responses[0].json(); var recent = await responses[1].json();
          text("total", formatter.format(summary.totalPageviews)); text("period", formatter.format(summary.periodPageviews)); text("unique", formatter.format(summary.uniqueVisitors)); text("countries", formatter.format(summary.countries)); text("updated", "Updated " + dateFormatter.format(new Date()) + " · Hong Kong time");
          renderChart(summary.daily || [], Number(days)); renderLocations(summary.locations || []); renderVisitors(recent.visitors || []);
        } catch (error) { var notice = document.getElementById("error"); notice.textContent = error.message || "Dashboard data is unavailable"; notice.style.display = "block"; }
        finally { refresh.disabled = false; }
      }

      range.addEventListener("change", load); refresh.addEventListener("click", load); load();
    })();
  </script>
</body>
</html>`;
