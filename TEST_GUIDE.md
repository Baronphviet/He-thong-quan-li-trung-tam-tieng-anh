# ✅ Hướng Dẫn Kiểm Test (Test Guide)

## 1. Kiểm Test Cơ Bản (Sanity Check)

### Bước 1: Khởi Động Dự Án
```bash
docker compose up --build
```

**Chờ cho đến khi thấy:**
- backend: Started EnglishCenterApp
- frontend: Local: http://localhost:3000

### Bước 2: Kiểm Tra Services Đang Chạy
```bash
docker compose ps
```

---

## 2. Kiểm Test API (Backend)

### Test Health Endpoint
```bash
curl http://localhost:8080/api/health
```

### Test Users API
```bash
curl http://localhost:8080/api/users
```

### Test Classes API  
```bash
curl http://localhost:8080/api/classes
```

### Test Announcements API
```bash
curl http://localhost:8080/api/announcements
```

---

## 3. Kiểm Test Frontend (UI)

### Truy Cập Ứng Dụng
Browser: http://localhost:3000

### Kiểm Tra Các Trang
- Home: http://localhost:3000
- Admin Dashboard: http://localhost:3000/dashboard/admin
- Teacher Dashboard: http://localhost:3000/dashboard/teacher
- Student Dashboard: http://localhost:3000/dashboard/student
- Parent Dashboard: http://localhost:3000/dashboard/parent

---

## 4. Kiểm Test Database

### Kết Nối MySQL
```bash
docker exec -it english-center-db mysql -u root -proot -D english_center
```

### Kiểm Tra Tables
```sql
SHOW TABLES;
```

### Xem Dữ Liệu
```sql
SELECT * FROM users LIMIT 5;
SELECT * FROM classes LIMIT 5;
SELECT COUNT(*) FROM users;
```

---

## 5. Kiểm Test Logs

### Backend Logs
```bash
docker compose logs -f backend --tail=50
```

### Frontend Logs
```bash
docker compose logs -f frontend --tail=50
```

### All Logs
```bash
docker compose logs -f --tail=100
```

---

## 6. Cleanup & Restart

### Dừng Services
```bash
docker compose down
```

### Dừng & Xóa Volumes
```bash
docker compose down -v
```

---

## Test Checklist

- [ ] Docker Compose khởi động thành công
- [ ] Backend service health check passing
- [ ] Frontend loads at http://localhost:3000
- [ ] API endpoints respond with 2xx status
- [ ] Database accessible and tables exist
- [ ] Frontend can fetch data from backend
- [ ] Can navigate between pages
- [ ] Can perform CRUD operations via API

---

**Cập nhật:** 07/06/2026