# 🚀 Khởi Động Nhanh (Quick Start)

Chỉ cần 3 bước để chạy dự án!

## Yêu Cầu
- Docker & Docker Compose

## Các Bước

### 1. Khởi Động
```bash
docker compose up --build
```

### 2. Chờ cho đến khi thấy:
```
backend      | Started EnglishCenterApp
frontend     | Local:  http://localhost:3000
```

### 3. Truy Cập
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080
- **Database**: mysql://localhost:3306

## Kiểm Tra

### Test API
```bash
curl http://localhost:8080/api/health
```

### Xem Logs
```bash
docker compose logs -f backend
```

### Dừng Ứng Dụng
```bash
docker compose down
```

---

**Chi tiết hơn:** Xem README.md