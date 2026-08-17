const fs = require("fs");
const path = require("path");
const oracledb = require("oracledb");
const CHARTS = require("./charts");
const DATASET_COLUMNS = require("./datasetColumns");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

function loadConfig() {
  const configPath = path.join(__dirname, "..", "config.json");
  if (!fs.existsSync(configPath)) {
    console.error(
      "Không tìm thấy config.json. Copy config.example.json -> config.json rồi điền user/password/connectString."
    );
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

function buildWhere(chart, filters) {
  const cols = DATASET_COLUMNS[chart.table] || [];
  const clauses = [];
  const binds = {};

  if (cols.includes("ORG_NAME3") && filters.orgName3) {
    clauses.push("ORG_NAME3 = :orgName3");
    binds.orgName3 = filters.orgName3;
  }
  if (cols.includes("YEAR") && filters.year) {
    clauses.push("YEAR = :year");
    binds.year = filters.year;
  }
  if (cols.includes("MONTH") && filters.month) {
    clauses.push("MONTH = :month");
    binds.month = filters.month;
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

async function main() {
  const config = loadConfig();
  const filters = config.filters || {};

  console.log(`Kết nối Oracle ${config.connectString} với user ${config.user}...`);
  const connection = await oracledb.getConnection({
    user: config.user,
    password: config.password,
    connectString: config.connectString,
  });
  console.log("Kết nối thành công. Bắt đầu chạy 33 câu query...\n");

  const results = {};
  for (const chart of CHARTS) {
    const { sql, binds } = buildQuery(chart, filters);
    process.stdout.write(`#${chart.id} ${chart.name} ... `);
    try {
      const result = await connection.execute(sql, binds);
      if (!chart.dim) {
        const value = result.rows[0] ? result.rows[0].VALUE : null;
        results[chart.id] = { ok: true, type: "single", value };
        console.log(`OK (${value})`);
      } else {
        const rows = result.rows.map((r) => ({ dim: r.DIM, value: r.VALUE }));
        results[chart.id] = { ok: true, type: "series", rows };
        console.log(`OK (${rows.length} dòng)`);
      }
    } catch (err) {
      results[chart.id] = { ok: false, error: err.message, sql };
      console.log(`LỖI: ${err.message}`);
    }
  }

  await connection.close();

  const output = {
    generatedAt: new Date().toISOString(),
    filters,
    results,
  };
  const outPath = path.join(__dirname, "..", "report", "data.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");
  console.log(`\nĐã ghi kết quả vào ${outPath}`);
}

main().catch((err) => {
  console.error("Lỗi không xử lý được:", err);
  process.exit(1);
});
