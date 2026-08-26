const PALETTE = ["#6bd3b6", "#fac858", "#3f7f80", "#73c0de", "#ee6666", "#91cc75", "#5470c6", "#9a60b4"];
const chartInstances = [];

function fmtNumber(v) {
  if (v === null || v === undefined) return "-";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
}

function compactNumber(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fmtNumber(v);
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${fmtNumber(n / 1_000_000_000)}B`;
  if (abs >= 1_000_000) return `${fmtNumber(n / 1_000_000)}M`;
  if (abs >= 1_000) return `${fmtNumber(n / 1_000)}K`;
  return fmtNumber(n);
}

function formatDateLabel(value) {
  const text = String(value ?? "");
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : text;
}

function initCustomSelect(select) {
  if (!select || select.dataset.customized === "true") return;

  const wrapper = document.createElement("div");
  wrapper.className = "custom-select";
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "custom-select-trigger";
  const menu = document.createElement("div");
  menu.className = "custom-select-menu";
  select.parentNode.insertBefore(wrapper, select);
  wrapper.appendChild(trigger);
  wrapper.appendChild(menu);
  wrapper.appendChild(select);
  select.style.display = "none";
  select.dataset.customized = "true";

  const sync = () => {
    const selected = select.options[select.selectedIndex];
    trigger.textContent = selected ? selected.textContent : "";
    menu.querySelectorAll(".custom-select-option").forEach((option) => {
      option.classList.toggle("selected", option.dataset.value === select.value);
    });
  };

  const rebuild = () => {
    menu.innerHTML = "";
    Array.from(select.options).forEach((option) => {
      const item = document.createElement("div");
      item.className = "custom-select-option";
      item.dataset.value = option.value;
      item.textContent = option.textContent;
      item.addEventListener("click", () => {
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        wrapper.classList.remove("open");
        sync();
      });
      menu.appendChild(item);
    });
    sync();
  };

  trigger.addEventListener("click", () => {
    document.querySelectorAll(".custom-select.open").forEach((item) => {
      if (item !== wrapper) item.classList.remove("open");
    });
    wrapper.classList.toggle("open");
  });
  document.addEventListener("click", (event) => {
    if (!wrapper.contains(event.target)) wrapper.classList.remove("open");
  });
  select.addEventListener("change", sync);
  rebuild();
  return rebuild;
}

function renderBigNumber(body, meta, entry) {
  const stat = document.createElement("div");
  stat.className = "big-stat";

  const value = fmtNumber(entry.value);
  stat.textContent = meta.id === 668 ? `${value}%` : value;

  body.appendChild(stat);
}

function renderEmpty(body, message) {
  const p = document.createElement("div");
  p.className = "empty-state";
  p.textContent = message;
  body.appendChild(p);
}

function legendActions() {
  const actions = document.createElement("span");
  actions.className = "legend-actions";
  actions.innerHTML = "<span>Tất cả</span><span>Ngược lại</span>";
  return actions;
}

function buildPieOption(meta, rows) {
  const total = rows.reduce((sum, r) => sum + Number(r.value || 0), 0);
  return {
    color: PALETTE,
    tooltip: { trigger: "item", valueFormatter: fmtNumber },
    legend: {
      type: "scroll",
      top: 0,
      left: 0,
      itemWidth: 17,
      itemHeight: 10,
      icon: "roundRect",
      textStyle: { color: "#4f5b56", fontSize: 13, fontFamily: "Fira Sans, Segoe UI, sans-serif" },
      pageIconColor: "#2f3b36",
      pageIconInactiveColor: "#c7d0cb",
      pageTextStyle: { color: "#2f3b36", fontSize: 14 },
    },
    series: [{
      name: meta.name,
      type: "pie",
      radius: ["38%", "66%"],
      center: ["50%", "58%"],
      avoidLabelOverlap: true,
      minShowLabelAngle: 2,
      label: {
        show: true,
        color: "#2f3b36",
        fontSize: 13,
        fontFamily: "Fira Sans, Segoe UI, sans-serif",
        formatter: (p) => {
          const pct = total ? (Number(p.value || 0) * 100 / total).toFixed(2) : "0.00";
          return `${p.name}: ${compactNumber(p.value)} (${pct}%)`;
        },
      },
      labelLine: { length: 12, length2: 8, lineStyle: { width: 1 } },
      itemStyle: { borderColor: "#fff", borderWidth: 1 },
      data: rows.map((r) => ({ name: r.dim ?? "(null)", value: r.value })),
    }],
  };
}

function buildBarOption(meta, rows) {
  const labels = rows.map((r) => r.dim ?? "(null)");
  const values = rows.map((r) => Number(r.value || 0));
  return {
    color: [PALETTE[0]],
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: fmtNumber },
    legend: {
      top: 0,
      right: 0,
      itemWidth: 19,
      itemHeight: 11,
      icon: "roundRect",
      textStyle: { color: "#4f5b56", fontSize: 13, fontFamily: "Fira Sans, Segoe UI, sans-serif" },
      data: [meta.name],
    },
    grid: { left: 150, right: 24, top: 34, bottom: 24 },
    xAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#e7ece9" } },
      axisLine: { lineStyle: { color: "#dce3df" } },
      axisTick: { show: false },
      axisLabel: { color: "#7a8580", fontSize: 13, formatter: compactNumber },
    },
    yAxis: {
      type: "category",
      data: labels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#66716c", fontSize: 13, width: 140, overflow: "truncate", fontFamily: "Fira Sans, Segoe UI, sans-serif" },
    },
    series: [{
      name: meta.name,
      type: "bar",
      barWidth: 9,
      data: values,
      label: {
        show: true,
        position: "right",
        color: "#5f6b66",
        fontSize: 13,
        formatter: (p) => compactNumber(p.value),
      },
    }],
  };
}

function buildLineOption(meta, rows) {
  return {
    color: [PALETTE[0]],
    tooltip: {
      trigger: "axis",
      valueFormatter: fmtNumber,
      formatter: (params) => {
        const items = Array.isArray(params) ? params : [params];
        const title = formatDateLabel(items[0]?.axisValue);
        return [title, ...items.map((item) => {
          const marker = item.marker || "";
          return `${marker} ${item.seriesName}: <b>${fmtNumber(item.value)}</b>`;
        })].join("<br>");
      },
    },
    legend: {
      top: 0,
      right: 0,
      itemWidth: 19,
      itemHeight: 11,
      icon: "circle",
      textStyle: { color: "#4f5b56", fontSize: 13, fontFamily: "Fira Sans, Segoe UI, sans-serif" },
      data: [meta.name],
    },
    grid: { left: 48, right: 20, top: 36, bottom: 28 },
    xAxis: {
      type: "category",
      data: rows.map((r) => r.dim ?? "(null)"),
      boundaryGap: false,
      axisLine: { lineStyle: { color: "#dce3df" } },
      axisTick: { show: false },
      axisLabel: { color: "#7a8580", fontSize: 13, formatter: formatDateLabel },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#e7ece9" } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#7a8580", fontSize: 13, formatter: compactNumber },
    },
    series: [{
      name: meta.name,
      type: "line",
      data: rows.map((r) => Number(r.value || 0)),
      symbol: "circle",
      symbolSize: 6,
      showSymbol: true,
      smooth: false,
      lineStyle: { width: 2 },
      itemStyle: { borderColor: PALETTE[0], borderWidth: 2 },
    }],
  };
}

function renderChart(body, meta, entry) {
  if (!entry.rows || entry.rows.length === 0) {
    renderEmpty(body, "Không có dòng dữ liệu cho chart này.");
    return;
  }

  const plot = document.createElement("div");
  plot.className = "plot";
  body.appendChild(plot);

  const chart = echarts.init(plot, null, { renderer: "canvas" });
  const option = meta.viz === "pie"
    ? buildPieOption(meta, entry.rows)
    : meta.viz === "echarts_timeseries_line"
      ? buildLineOption(meta, entry.rows)
      : buildBarOption(meta, entry.rows);
  chart.setOption(option);
  chartInstances.push(chart);
}

function renderCard(meta, data) {
  const card = document.createElement("article");
  card.className = `chart-card chart-${meta.viz}`;
  card.style.setProperty("--w", meta.w);

  const header = document.createElement("div");
  header.className = "chart-header";
  const h3 = document.createElement("h3");
  h3.textContent = meta.name;
  header.appendChild(h3);
  if (meta.viz !== "big_number_total") header.appendChild(legendActions());
  card.appendChild(header);

  const body = document.createElement("div");
  body.className = "chart-body";
  card.appendChild(body);

  const entry = data.results ? data.results[meta.id] : null;
  if (!entry) {
    renderEmpty(body, "Chưa có dữ liệu. Chạy npm run fetch trước.");
  } else if (!entry.ok) {
    renderEmpty(body, "Lỗi truy vấn: " + entry.error);
    card.classList.add("has-error");
  } else if (entry.type === "single") {
    renderBigNumber(body, meta, entry);
  } else {
    renderChart(body, meta, entry);
  }
  return card;
}

function resizeCharts() {
  chartInstances.forEach((chart) => chart.resize());
}

function renderTabs(data) {
  const nav = document.getElementById("tabNav");
  const panels = document.getElementById("panels");
  nav.innerHTML = "";
  panels.innerHTML = "";
  chartInstances.splice(0, chartInstances.length);

  const renderPanel = (tabData, panel) => {
    if (panel.dataset.rendered === "true") return;
    tabData.rows.forEach((row) => {
      const rowEl = document.createElement("div");
      rowEl.className = "chart-row";
      row.forEach((meta) => rowEl.appendChild(renderCard(meta, data)));
      panel.appendChild(rowEl);
    });
    panel.dataset.rendered = "true";
  };

  window.CHARTS_META.forEach((tabData, i) => {
    const btn = document.createElement("button");
    btn.className = "tab-btn" + (i === 0 ? " active" : "");
    btn.type = "button";
    btn.role = "tab";
    btn.textContent = tabData.tab;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      const panel = document.getElementById("panel-" + i);
      panel.classList.add("active");
      renderPanel(tabData, panel);
      requestAnimationFrame(resizeCharts);
    });
    nav.appendChild(btn);

    const panel = document.createElement("section");
    panel.className = "tab-panel" + (i === 0 ? " active" : "");
    panel.id = "panel-" + i;
    panel.role = "tabpanel";
    panels.appendChild(panel);
    if (i === 0) renderPanel(tabData, panel);
  });
  requestAnimationFrame(resizeCharts);
}

// ---------- Filter logic ----------

let orgList = [];

async function loadOrganizations() {
  try {
    const res = await fetch("organizations.json", { cache: "no-store" });
    if (!res.ok) return;
    orgList = await res.json();
    const orgSel = document.getElementById("filterOrg");
    orgList.forEach((org) => {
      const opt = document.createElement("option");
      opt.value = org.id;
      opt.textContent = org.name;
      orgSel.appendChild(opt);
    });
  } catch (err) {
    console.warn("Không tải được organizations.json:", err.message);
  }
}

async function loadFilterOptions() {
  try {
    const res = await fetch("api/filters");
    if (!res.ok) return;
    const options = await res.json();
    const yearSel = document.getElementById("filterYear");
    const monthSel = document.getElementById("filterMonth");

    (options.years || []).forEach((y) => {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      yearSel.appendChild(opt);
    });

    (options.months || []).forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = "Tháng " + m;
      monthSel.appendChild(opt);
    });
  } catch (err) {
    console.warn("Không lấy được danh sách filter:", err.message);
  }
}

function updateUrlParams() {
  const orgId = document.getElementById("filterOrg").value;
  const year = document.getElementById("filterYear").value;
  const month = document.getElementById("filterMonth").value;
  const params = new URLSearchParams();
  if (orgId) params.set("id", orgId);
  if (year) params.set("year", year);
  if (month) params.set("month", month);
  const qs = params.toString();
  const newUrl = window.location.pathname + (qs ? "?" + qs : "");
  window.history.replaceState(null, "", newUrl);
}

async function applyFilter() {
  const banner = document.getElementById("banner");
  const btn = document.getElementById("btnApply");
  const status = document.getElementById("filterStatus");
  const loadingOverlay = document.getElementById("loadingOverlay");
  const orgId = document.getElementById("filterOrg").value;
  const year = document.getElementById("filterYear").value;
  const month = document.getElementById("filterMonth").value;

  // Find org name for display
  const org = orgList.find((o) => String(o.id) === orgId);

  btn.disabled = true;
  loadingOverlay.classList.add("active");
  status.className = "filter-status loading";
  status.textContent = "Đang tải dữ liệu...";
  banner.className = "status-banner";
  banner.textContent = "";

  try {
    const params = new URLSearchParams();
    if (orgId) params.set("orgId", orgId);
    if (org) params.set("orgName", org.name);
    if (year) params.set("year", year);
    if (month) params.set("month", month);

    const res = await fetch("api/fetch?" + params.toString());
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Server error");
    }
    const data = await res.json();
    const results = Object.values(data.results || {});
    const errCount = results.filter((r) => !r.ok).length;
    banner.className = "status-banner " + (errCount ? "err" : "ok");
    banner.textContent = errCount ? `${errCount}/${results.length} chart lỗi truy vấn.` : "";
    renderTabs(data);
    updateUrlParams();
    status.className = "filter-status";
    status.textContent = "";
  } catch (err) {
    banner.className = "status-banner err";
    banner.textContent = err.message;
    status.className = "filter-status";
    status.textContent = "Lỗi!";
  } finally {
    btn.disabled = false;
    loadingOverlay.classList.remove("active");
  }
}

async function main() {
  const banner = document.getElementById("banner");
  try {
    if (!window.echarts) throw new Error("Không tải được ECharts. Kiểm tra kết nối CDN hoặc tải lại trang.");

    // Load organizations from JSON
    await loadOrganizations();

    // Load filter options from DB
    await loadFilterOptions();

    initCustomSelect(document.getElementById("filterOrg"));
    initCustomSelect(document.getElementById("filterYear"));
    initCustomSelect(document.getElementById("filterMonth"));

    // Read URL params (?id=69&year=2025&month=6)
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get("id");
    if (paramId) {
      document.getElementById("filterOrg").value = paramId;
      document.getElementById("orgFilterGroup").classList.add("is-hidden");
    }
    if (urlParams.get("year")) {
      const year = document.getElementById("filterYear");
      year.value = urlParams.get("year");
      year.dispatchEvent(new Event("change"));
    }
    if (urlParams.get("month")) {
      const month = document.getElementById("filterMonth");
      month.value = urlParams.get("month");
      month.dispatchEvent(new Event("change"));
    }

    // Bind Apply button
    document.getElementById("btnApply").addEventListener("click", applyFilter);

    // If URL has params, auto-apply filter
    if (urlParams.get("id") || urlParams.get("year") || urlParams.get("month")) {
      await applyFilter();
      return;
    }

    // Otherwise try to load cached data.json
    const res = await fetch("data.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Chưa có dữ liệu. Nhấn nút \"Áp dụng\" để lấy dữ liệu từ Oracle.");
    const data = await res.json();
    const results = Object.values(data.results || {});
    const errCount = results.filter((r) => !r.ok).length;
    banner.className = "status-banner " + (errCount ? "err" : "ok");
    banner.textContent = errCount ? `${errCount}/${results.length} chart lỗi truy vấn.` : "";

    // Restore filter selections from cached data
    if (data.filters) {
      if (data.filters.orgId) document.getElementById("filterOrg").value = data.filters.orgId;
      if (data.filters.year) document.getElementById("filterYear").value = data.filters.year;
      if (data.filters.month) document.getElementById("filterMonth").value = data.filters.month;
    }

    renderTabs(data);
  } catch (err) {
    banner.className = "status-banner err";
    banner.textContent = err.message;
    renderTabs({ results: {} });
  }
}

window.addEventListener("resize", resizeCharts);
main();

