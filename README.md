# Hệ Thống Quản Lý Trung Tâm Tiếng Anh

Hệ thống quản lý toàn diện dành cho các trung tâm dạy tiếng Anh, bao gồm quản lý học sinh, giáo viên, lớp học, tài chính, công bố thông báo, và đăng ký học.

## 📋 Các Chức Năng Chính

### 1. Quản Lý Tài Khoản & Xác Thực
- Đăng nhập/Đăng xuất
- Quản lý tài khoản người dùng (Admin, Giáo viên, Học sinh, Phụ huynh)
- Phân quyền theo role

### 2. Dashboard Theo Role
- **Admin Dashboard**: Quản lý toàn bộ hệ thống
- **Teacher Dashboard**: Quản lý lớp học và học sinh
- **Student Dashboard**: Xem lớp học và thông tin cá nhân
- **Parent Dashboard**: Theo dõi tiến độ của con em

### 3. Quản Lý Lớp Học
- Tạo, chỉnh sửa, xóa lớp học
- Gán giáo viên cho lớp
- Xem danh sách học sinh

### 4. Quản Lý Đăng Ký Học
- Đăng ký vào lớp
- Quản lý trạng thái đăng ký
- Theo dõi lịch sử

### 5. Quản Lý Tài Chính
- Theo dõi khoản thu (học phí, phí khác)
- Theo dõi khoản chi
- Báo cáo tài chính

### 6. Công Bố Thông Báo
- Tạo và quản lý thông báo
- Gửi tới học sinh, phụ huynh, giáo viên

### 7. Dữ Liệu Chính
- Quản lý danh sách khoá học, trình độ, lớp

---

## 🏗️ Kiến Trúc Dự Án

### Backend (Java Spring Boot)
- **Spring Boot 3.3.5** - Framework REST API
- **Spring Data JPA** - ORM
- **MySQL 8.0** - Database (Docker), H2 (Local Development)
- **Flyway** - Database migrations
- **Java 17** - Language

**Dependencies chính:**
\\\
spring-boot-starter-web       → REST API endpoints
spring-boot-starter-data-jpa  → Database ORM
spring-boot-starter-validation → Input validation
flyway-core, flyway-mysql     → Auto database migrations
mysql-connector-j             → MySQL driver
h2database                    → H2 in-memory (local dev)
spring-boot-starter-test      → Unit testing
\\\

### Frontend (React + Vite)
- **React 18.3.1** - UI library
- **React Router 6.28.1** - Client-side routing
- **Vite 5.4.9** - Build tool & dev server
- **Node.js 20** - Runtime

**Dependencies chính:**
\\\
react                  → UI component library
react-dom              → React DOM rendering
react-router-dom       → Page routing
vite                   → Fast build tool
@vitejs/plugin-react   → React support for Vite
\\\

### Database
- **MySQL 8.0** - Production database (Docker)
- **H2** - Local development in-memory database

---

## 🚀 Cách Chạy Dự Án

### ✅ Yêu Cầu Tiên Quyết
- **Docker & Docker Compose** (Khuyến nghị - Đơn giản nhất)

---

## 🐳 Cách 1: Chạy với Docker Compose (Khuyến Nghị)

### Bước 1: Khởi động toàn bộ stack
\\\ash
docker compose up --build
\\\

### Bước 2: Truy cập ứng dụng
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api

### Bước 3: Dừng ứng dụng
\\\ash
docker compose down
\\\

---

## ✅ Cách Kiểm Test

### 1. Test Backend APIs
\\\ash
curl http://localhost:8080/api/health
curl http://localhost:8080/api/users
curl http://localhost:8080/api/classes
\\\

### 2. Test Frontend
Mở browser: **http://localhost:3000**

### 3. Xem Logs
\\\ash
docker compose logs -f backend
docker compose logs -f frontend
\\\

---

## 📁 API Endpoints Chính

### Users
- \GET /api/users\ - Danh sách
- \POST /api/users\ - Tạo mới
- \GET /api/users/{id}\ - Chi tiết
- \PUT /api/users/{id}\ - Cập nhật
- \DELETE /api/users/{id}\ - Xóa

### Classes
- \GET /api/classes\ - Danh sách
- \POST /api/classes\ - Tạo mới

### Enrollments
- \GET /api/enrollments\ - Danh sách
- \POST /api/enrollments\ - Đăng ký

### Finance
- \GET /api/finance\ - Danh sách

### Announcements
- \GET /api/announcements\ - Danh sách
- \POST /api/announcements\ - Tạo mới

---

**Cập nhật lần cuối:** 07/06/2026
