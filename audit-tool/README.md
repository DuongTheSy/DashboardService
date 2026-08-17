# Audit tool — PVPUS_LIVE (PVPTCT)

Công cụ local, chạy trên máy anh: kết nối thẳng vào Oracle `PVPUS_LIVE`, lấy số liệu thật cho 33 chart trong dashboard, và vẽ lại bằng Chart.js để mở song song với Superset và so trực quan (pie/bar/line thật, không phải bảng metadata).

Mật khẩu Oracle **chỉ nằm trong `config.json` trên máy anh**, không gửi cho Claude, không commit lên git (đã có trong `.gitignore`).

## Cài đặt

```bash
cd audit-tool
npm install
```

`oracledb` chạy ở chế độ *thin* (mặc định từ bản 6.x) — **không cần cài Oracle Instant Client**, chỉ cần Node.js.

## Cấu hình kết nối

```bash
cp config.example.json config.json
```

Mở `config.json`, điền:

```json
{
  "user": "PVP_LIVE",
  "password": "<mật khẩu thật>",
  "connectString": "103.5.209.91:1521/orcl",
  "filters": {
    "orgName3": "Tổng công ty Điện lực Dầu khí Việt Nam - CTCP",
    "year": null,
    "month": null
  }
}
```

- `filters.orgName3/year/month` tương ứng 3 filter "Đơn vị / Năm / Tháng" trên Superset. Để `null` nghĩa là không lọc (lấy tất cả).
- Nếu máy chạy lệnh này chưa vào được mạng nội bộ Histaff, cần bật VPN trước.

## Lấy số liệu thật

```bash
npm run fetch
```

Script sẽ chạy 33 câu `SELECT` (chỉ đọc, không ghi) lên 31 view `DBV_*`, in log OK/lỗi từng chart, rồi ghi kết quả vào `report/data.json`.

## Xem trang so sánh

```bash
npm run report
```

Mở `http://localhost:5173`. Trang hiển thị đúng 4 tab, đúng bố cục hàng/cột như dashboard gốc, mỗi chart vẽ bằng dữ liệu vừa lấy (pie/bar/line/big number), có banner báo bao nhiêu chart lấy được / bao nhiêu chart lỗi (ví dụ do sai tên view, thiếu quyền, cột không tồn tại).

Muốn cập nhật số liệu mới: chạy lại `npm run fetch` rồi refresh trình duyệt.

## Cấu trúc

```
audit-tool/
  config.example.json   # mẫu, copy thành config.json rồi điền
  src/
    charts.js            # định nghĩa 33 chart: bảng nguồn, công thức SQL, cột nhóm/trục X
    datasetColumns.js     # cột của 31 view, dùng để biết filter nào áp dụng được
    fetch.js              # kết nối Oracle, chạy query, ghi report/data.json
    serve.js               # static server nhỏ cho thư mục report/
  report/
    index.html / app.js / style.css / charts-meta.js   # trang hiển thị chart thật
```

## Nếu 1 chart báo lỗi

Thường do: tên view/cột đã đổi so với lúc export (kiểm tra lại trong `src/charts.js` và `src/datasetColumns.js`), hoặc user `PVP_LIVE` không có quyền `SELECT` trên view đó — nhờ DBA cấp quyền hoặc đổi sang tài khoản khác trong `config.json`.
