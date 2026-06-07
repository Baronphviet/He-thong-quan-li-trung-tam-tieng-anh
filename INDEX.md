# 📚 Chỉ Mục Tài Liệu (Documentation Index)

Dự án đã được hoàn thành với đầy đủ tài liệu tiếng Việt.

---

## 🚀 Bắt Đầu Nhanh

**Bạn chỉ cần 3 bước:**
1. Có Docker cài đặt
2. Chạy: \docker compose up --build\
3. Truy cập: http://localhost:3000

👉 **Xem:** [QUICK_START.md](./QUICK_START.md) - Khởi động 3 bước

---

## 📖 Tài Liệu Chính

### 📘 README.md
**Mô tả:** Tài liệu chính, giải thích:
- 7 chức năng chính của hệ thống
- Kiến trúc backend (Spring Boot, dependencies)
- Kiến trúc frontend (React, Vite, dependencies)
- Cách chạy với Docker Compose
- Cách chạy local (Java + Node.js)
- API endpoints chính
- Troubleshooting phổ biến

👉 **Dành cho:** Những người muốn hiểu toàn bộ hệ thống

---

### 🔧 INSTALL.md
**Mô tả:** Hướng dẫn cài đặt chi tiết:
- Yêu cầu hệ thống
- Cài Docker trên Windows/macOS/Linux
- Khởi động dự án
- Cấu hình tuỳ chỉnh (ports, database)
- Dọn dẹp & reset
- Troubleshooting cài đặt

👉 **Dành cho:** Người mới bắt đầu

---

### 📐 ARCHITECTURE.md
**Mô tả:** Chi tiết kiến trúc & packages:
- Sơ đồ kiến trúc 3-tier
- Backend structure (controllers, services, entities)
- Frontend structure (components, pages, routes)
- Database tables
- Dependencies & công dụng chi tiết
- Data flow
- Performance notes
- Testing strategy

👉 **Dành cho:** Developer muốn hiểu code structure

---

### ✅ TEST_GUIDE.md
**Mô tả:** Hướng dẫn kiểm test chi tiết:
- Sanity check (kiểm tra cơ bản)
- Test API endpoints (curl examples)
- Test frontend (UI checks)
- Test database (MySQL queries)
- Xem logs
- Performance testing
- Error handling
- Test checklist

👉 **Dành cho:** QA tester & developer

---

### 🐳 QUICK_START.md
**Mô tả:** Khởi động nhanh trong 3 bước
- Yêu cầu duy nhất: Docker
- Khởi động: docker compose up --build
- Truy cập: http://localhost:3000
- Kiểm tra nhanh

👉 **Dành cho:** Người muốn chạy ngay lập tức

---

## 📋 Danh Sách Chức Năng

### 1. Quản Lý Tài Khoản
- Đăng nhập/Đăng xuất
- Quản lý người dùng (Admin, Giáo viên, Học sinh, Phụ huynh)
- Phân quyền theo role

### 2. Dashboard Theo Role
- Admin Dashboard
- Teacher Dashboard  
- Student Dashboard
- Parent Dashboard
- Home Page

### 3. Quản Lý Lớp Học
- Tạo, chỉnh sửa, xóa lớp
- Gán giáo viên
- Danh sách học sinh

### 4. Quản Lý Đăng Ký Học
- Đăng ký vào lớp
- Quản lý trạng thái
- Lịch sử đăng ký

### 5. Quản Lý Tài Chính
- Theo dõi khoản thu
- Theo dõi khoản chi
- Báo cáo tài chính

### 6. Công Bố Thông Báo
- Tạo thông báo
- Gửi tới người dùng

### 7. Dữ Liệu Chính
- Quản lý danh sách khoá học
- Quản lý trình độ
- Quản lý lớp

---

## 🏗️ Kiến Trúc Nhanh

### Backend
- **Framework:** Spring Boot 3.3.5 (Java 17)
- **Database:** MySQL 8.0 (Docker) / H2 (Local)
- **ORM:** Spring Data JPA
- **Migrations:** Flyway
- **API:** REST endpoints

### Frontend
- **Framework:** React 18.3.1
- **Build Tool:** Vite 5.4.9
- **Routing:** React Router 6.28.1
- **Runtime:** Node.js 20 (Alpine)

### Infrastructure
- **Docker:** Container orchestration
- **Docker Compose:** Multi-container management
- **MySQL:** Persistent data storage
- **Volumes:** db_data volume

---

## 📁 Cấu Trúc File Chính

\\\
project/
├── README.md              ← Tài liệu chính (ĐỌC TRƯỚC)
├── QUICK_START.md         ← Khởi động nhanh
├── INSTALL.md             ← Hướng dẫn cài đặt
├── ARCHITECTURE.md        ← Chi tiết kiến trúc
├── TEST_GUIDE.md          ← Hướng dẫn test
├── docker-compose.yml     ← Docker config
├── backend/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/java/...
└── frontend/
    ├── package.json
    ├── Dockerfile
    └── src/...
\\\

---

## 🎯 Bước Tiếp Theo

### Lần Đầu Tiên
1. Đọc: [README.md](./README.md)
2. Cài đặt: [INSTALL.md](./INSTALL.md)
3. Khởi động: [QUICK_START.md](./QUICK_START.md)
4. Test: [TEST_GUIDE.md](./TEST_GUIDE.md)

### Phát Triển
- Xem: [ARCHITECTURE.md](./ARCHITECTURE.md) để hiểu code structure
- Sửa backend: \ackend/src/main/java/com/englishcenter/\
- Sửa frontend: \rontend/src/\
- Rebuild: \docker compose build\ và \docker compose up\

### Test & Debug
- Xem: [TEST_GUIDE.md](./TEST_GUIDE.md)
- Logs: \docker compose logs -f\
- Database: \docker exec -it english-center-db mysql ...\

---

## 🚀 Commands Hữu Ích

### Docker
\\\ash
# Khởi động
docker compose up --build

# Dừng
docker compose down

# Logs
docker compose logs -f backend
docker compose logs -f frontend

# Reset database
docker compose down -v
\\\

### API Testing
\\\ash
# Health check
curl http://localhost:8080/api/health

# Get users
curl http://localhost:8080/api/users

# Get classes
curl http://localhost:8080/api/classes
\\\

### Database
\\\ash
# Connect
docker exec -it english-center-db mysql -u root -proot -D english_center

# View tables
SHOW TABLES;

# View data
SELECT * FROM users LIMIT 5;
\\\

---

## 📞 Hỗ Trợ

### Problem: Backend không khởi động
→ Xem: [INSTALL.md](./INSTALL.md) - Troubleshooting

### Problem: Frontend không load
→ Xem: [TEST_GUIDE.md](./TEST_GUIDE.md) - Kiểm test

### Problem: Database error
→ Xem: [README.md](./README.md) - Troubleshooting

---

## 📊 Tóm Tắt

| Item | Chi Tiết |
|------|---------|
| **Chức năng** | 7 chức năng quản lý trung tâm tiếng Anh |
| **Backend** | Spring Boot 3.3.5 (Java 17) |
| **Frontend** | React 18.3.1 + Vite 5.4.9 |
| **Database** | MySQL 8.0 / H2 |
| **Infrastructure** | Docker Compose |
| **Cách chạy** | \docker compose up --build\ |
| **Truy cập** | http://localhost:3000 |
| **API** | http://localhost:8080/api |
| **Yêu cầu** | Docker & Docker Compose |

---

**Tài liệu hoàn chỉnh & được Việt hóa**
Cập nhật: 07/06/2026