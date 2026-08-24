// Static file server + API fetch endpoint cho audit-tool.
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const oracledb = require("oracledb");
const CHARTS = require("./charts");
const DATASET_COLUMNS = require("./datasetColumns");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const ROOT = path.join(__dirname, "..", "report");
const ORGANIZATIONS_FILE = path.join(ROOT, "organizations.json");
const LOG_DIR = path.join(__dirname, "..", "logs");
const PORT = Number(process.env.PORT || 5173);
const HOST = process.env.HOST || "0.0.0.0";

fs.mkdirSync(LOG_DIR, { recursive: true });

function writeLog(level, message, details) {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const timestamp = now.toISOString();
  const suffix = details ? ` ${JSON.stringify(details)}` : "";
  const line = `${timestamp} [${level}] ${message}${suffix}\n`;
  fs.appendFileSync(path.join(LOG_DIR, `dashboard-${date}.log`), line, "utf-8");
  if (level === "ERROR") console.error(line.trim());
  else console.log(line.trim());
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

// ---------- Oracle helpers ----------

function loadConfig() {
  const configPath = path.join(__dirname, "..", "config.json");
  if (!fs.existsSync(configPath)) {
    writeLog("ERROR", "Không tìm thấy config.json");
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

function buildWhere(chart, filters) {
  const cols = DATASET_COLUMNS[chart.table] || [];
  const clauses = [];
  const binds = {};

  if (cols.includes("ORG_NAME3") && filters.orgName3) {
    clauses.push("UPPER(TRIM(ORG_NAME3)) = UPPER(TRIM(:orgName3))");
    binds.orgName3 = filters.orgName3;
  }
  if (cols.includes("YEAR") && filters.year) {
    clauses.push("YEAR = :year");
    binds.year = Number(filters.year);
  }
  if (cols.includes("MONTH") && filters.month) {
    clauses.push("MONTH = :month");
    binds.month = Number(filters.month);
  }
  if (chart.extraWhere) {
    clauses.push(chart.extraWhere);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, binds };
}

function buildQuery(chart, filters) {
  const { where, binds } = buildWhere(chart, filters);
  if (!chart.dim) {
    return {
      sql: `SELECT ${chart.metric} AS VALUE FROM ${chart.table} ${where}`,
      binds,
    };
  }
  return {
    sql: `SELECT ${chart.dim} AS DIM, ${chart.metric} AS VALUE FROM ${chart.table} ${where} GROUP BY ${chart.dim} ORDER BY ${chart.dim}`,
    binds,
  };
}

function resolveOrganizationName(orgId) {
  if (!orgId || !fs.existsSync(ORGANIZATIONS_FILE)) return null;
  try {
    const organizations = JSON.parse(fs.readFileSync(ORGANIZATIONS_FILE, "utf-8"));
    const organization = organizations.find((item) => String(item.id) === String(orgId));
    return organization ? organization.name : null;
  } catch (err) {
    writeLog("WARN", "Không đọc được organizations.json", { error: err.message });
    return null;
  }
}

async function fetchFromOracle(filters) {
  const config = loadConfig();
  // Merge filters: orgId takes priority, fallback to orgName3 from config
  const mergedFilters = {
    orgId: filters.orgId || null,
    orgName3: filters.orgName3 || config.filters?.orgName3 || null,
    year: filters.year || null,
    month: filters.month || null,
  };

  const connection = await oracledb.getConnection({
    user: config.user,
    password: config.password,
    connectString: config.connectString,
  });

  const results = {};
  for (const chart of CHARTS) {
    const { sql, binds } = buildQuery(chart, mergedFilters);
    try {
      const result = await connection.execute(sql, binds);
      if (!chart.dim) {
        const value = result.rows[0] ? result.rows[0].VALUE : null;
        results[chart.id] = { ok: true, type: "single", value };
      } else {
        const rows = result.rows.map((r) => ({ dim: r.DIM, value: r.VALUE }));
        results[chart.id] = { ok: true, type: "series", rows };
      }
    } catch (err) {
      results[chart.id] = { ok: false, error: err.message, sql };
    }
  }

  await connection.close();

  return {
    generatedAt: new Date().toISOString(),
    filters: mergedFilters,
    results,
  };
}

// ---------- Lấy danh sách năm/tháng có trong DB ----------

async function fetchFilterOptions() {
  const config = loadConfig();
  const connection = await oracledb.getConnection({
    user: config.user,
    password: config.password,
    connectString: config.connectString,
  });

  let years = [];
  let months = [];
  try {
    // Lấy danh sách năm từ một view phổ biến
    const yResult = await connection.execute(
      `SELECT DISTINCT YEAR FROM DBV_PA_PAYROLL_TOTAL_INCOME WHERE YEAR IS NOT NULL ORDER BY YEAR DESC`
    );
    years = yResult.rows.map((r) => r.YEAR);

    // Tháng cố định 1-12
    months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  } catch (err) {
    writeLog("ERROR", "Lỗi khi lấy filter options", { error: err.message });
  }

  await connection.close();
  return { years, months };
}

// ---------- HTTP server ----------

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const startedAt = Date.now();

  // API: lấy dữ liệu với filter
  if (url.pathname === "/api/fetch") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    try {
      const filters = {
        orgId: url.searchParams.get("orgId") || null,
        orgName3: url.searchParams.get("orgName") || null,
        year: url.searchParams.get("year") || null,
        month: url.searchParams.get("month") || null,
      };
      if (!filters.orgName3 && filters.orgId) {
        filters.orgName3 = resolveOrganizationName(filters.orgId);
      }
      writeLog("INFO", "API fetch bắt đầu", {
        orgId: filters.orgId,
        year: filters.year,
        month: filters.month,
      });
      const data = await fetchFromOracle(filters);

      // Đồng thời ghi ra file data.json để lần sau mở trang có sẵn
      const outPath = path.join(ROOT, "data.json");
      fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf-8");

      res.writeHead(200);
      res.end(JSON.stringify(data));
      writeLog("INFO", "API fetch hoàn tất", { durationMs: Date.now() - startedAt });
    } catch (err) {
      writeLog("ERROR", "API fetch lỗi", { error: err.message, durationMs: Date.now() - startedAt });
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // API: lấy danh sách năm/tháng
  if (url.pathname === "/api/filters") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    try {
      writeLog("INFO", "API filters bắt đầu");
      const options = await fetchFilterOptions();
      res.writeHead(200);
      res.end(JSON.stringify(options));
      writeLog("INFO", "API filters hoàn tất", { durationMs: Date.now() - startedAt });
    } catch (err) {
      writeLog("ERROR", "API filters lỗi", { error: err.message, durationMs: Date.now() - startedAt });
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Static files
  let reqPath = decodeURIComponent(url.pathname);
  if (reqPath === "/") reqPath = "/index.html";
  const filePath = path.normalize(path.join(ROOT, reqPath));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found: " + reqPath);
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
});

function getUrls() {
  const urls = [`http://localhost:${PORT}`];
  Object.values(os.networkInterfaces()).forEach((items) => {
    (items || [])
      .filter((item) => item.family === "IPv4" && !item.internal)
      .forEach((item) => urls.push(`http://${item.address}:${PORT}`));
  });
  return urls;
}

server.listen(PORT, HOST, () => {
  writeLog("INFO", "DashboardService khởi động", { host: HOST, port: PORT });
  getUrls().forEach((url) => writeLog("INFO", "Service URL", { url }));
});
