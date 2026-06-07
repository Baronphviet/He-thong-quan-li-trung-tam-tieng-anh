# Hệ Thống Quản Lý Trung Tâm Tiếng Anh - Website

Ứng dụng web quản lý toàn diện cho các trung tâm dạy tiếng Anh.

**Website:** http://localhost:3000 (sau khi chạy)

---

## 🎯 Chức Năng Chính (7 Features)

1. **Quản Lý Tài Khoản** - Đăng nhập, phân quyền role (Admin/Teacher/Student/Parent)
2. **Dashboard** - Dashboard riêng cho mỗi role
3. **Quản Lý Lớp Học** - Tạo, sửa, xóa lớp và gán giáo viên
4. **Đăng Ký Học** - Học sinh đăng ký lớp, quản lý trạng thái
5. **Tài Chính** - Theo dõi học phí, chi phí, báo cáo
6. **Thông Báo** - Công bố thông báo từ trung tâm
7. **Dữ Liệu Chính** - Quản lý khoá học, trình độ, lớp

---

## 🚀 Khởi Động (3 Bước)

### Yêu Cầu
- Docker 20.10+
- Docker Compose 2.0+

### Khởi Động

\\\ash
# 1. Vào thư mục
cd He-thong-quan-li-trung-tam-tieng-anh

# 2. Chạy
docker compose up --build

# 3. Chờ cho đến khi thấy:
# backend      | Started EnglishCenterApp
# frontend     | Local:  http://localhost:3000
\\\

### Truy Cập
- **Website**: http://localhost:3000 ✅
- **API Backend**: http://localhost:8080/api
- **Database**: mysql://localhost:3306

---

## 🏗️ Kiến Trúc

### Frontend (Website - React)
- **Framework**: React 18.3.1 + Vite 5.4.9
- **Routing**: React Router 6.28.1
- **Runtime**: Node.js 20
- **Port**: 3000

**Pages:**
- Home: /
- Admin Dashboard: /dashboard/admin
- Teacher Dashboard: /dashboard/teacher
- Student Dashboard: /dashboard/student
- Parent Dashboard: /dashboard/parent

### Backend (Spring Boot - Java)
- **Framework**: Spring Boot 3.3.5
- **ORM**: Spring Data JPA
- **Language**: Java 17
- **Port**: 8080

**Controllers & API:**
- /api/users - Quản lý người dùng
- /api/classes - Quản lý lớp
- /api/enrollments - Đăng ký học
- /api/finance - Tài chính
- /api/announcements - Thông báo
- /api/auth - Xác thực
- /api/health - Health check

### Database (MySQL)
- **Database**: english_center
- **Tables**: users, classes, enrollments, finance, announcements, master_data
- **Migrations**: Flyway (auto)
- **Local Dev**: H2 in-memory
- **Docker**: MySQL 8.0 with persistent volume

---

## 📦 Dependencies

### Backend
| Package | Công Dụng |
|---------|----------|
| spring-boot-starter-web | REST API |
| spring-boot-starter-data-jpa | ORM |
| spring-boot-starter-validation | Input validation |
| flyway-core/mysql | Database migrations |
| mysql-connector-j | MySQL driver |
| h2database | H2 in-memory (dev) |

### Frontend
| Package | Công Dụng |
|---------|----------|
| react | UI library |
| react-router-dom | Routing |
| vite | Build tool |
| @vitejs/plugin-react | React plugin |

---

## 📖 API Endpoints

### Authentication
- POST /api/auth/login - Đăng nhập
- POST /api/auth/logout - Đăng xuất

### Users
- GET /api/users - Danh sách
- POST /api/users - Tạo mới
- GET /api/users/{id} - Chi tiết
- PUT /api/users/{id} - Cập nhật
- DELETE /api/users/{id} - Xóa

### Classes
- GET /api/classes - Danh sách
- POST /api/classes - Tạo mới
- GET /api/classes/{id} - Chi tiết
- PUT /api/classes/{id} - Cập nhật
- DELETE /api/classes/{id} - Xóa

### Enrollments
- GET /api/enrollments - Danh sách
- POST /api/enrollments - Tạo mới
- PUT /api/enrollments/{id} - Cập nhật

### Finance
- GET /api/finance - Danh sách
- POST /api/finance - Thêm mới

### Announcements
- GET /api/announcements - Danh sách
- POST /api/announcements - Tạo mới
- DELETE /api/announcements/{id} - Xóa

### Health
- GET /api/health - Health check

---

## ✅ Kiểm Test

### Test Website
Mở browser: http://localhost:3000

### Test API
\\\ash
curl http://localhost:8080/api/health
curl http://localhost:8080/api/users
curl http://localhost:8080/api/classes
\\\

### Test Database
\\\ash
docker exec -it english-center-db mysql -u root -proot -D english_center
SHOW TABLES;
SELECT * FROM users LIMIT 5;
\\\

### Test Logs
\\\ash
docker compose logs -f backend
docker compose logs -f frontend
\\\

### Checklist
- [ ] Website loads at http://localhost:3000
- [ ] Backend health check: curl http://localhost:8080/api/health
- [ ] Can see data in database
- [ ] No console errors in browser
- [ ] Can navigate between pages

---

## 🔧 Cấu Hình

### Thay Đổi Ports (docker-compose.yml)
\\\yaml
frontend:
  ports:
    - "3001:3000"  # Website port

backend:
  ports:
    - "8081:8080"  # API port

db:
  ports:
    - "3307:3306"  # Database port
\\\

### Thay Đổi Database Credentials
\\\yaml
db:
  environment:
    MYSQL_ROOT_PASSWORD: new_password

backend:
  environment:
    DB_PASSWORD: new_password
\\\

---

## 🐛 Troubleshooting

### Website không load (http://localhost:3000)
\\\ash
# Kiểm tra frontend container
docker compose ps frontend

# Xem logs
docker compose logs frontend

# Restart
docker compose restart frontend
\\\

### API không phản hồi
\\\ash
# Kiểm tra health
curl http://localhost:8080/api/health

# Xem logs
docker compose logs backend

# Restart
docker compose restart backend
\\\

### Database connection error
\\\ash
# Kiểm tra database
docker compose logs db

# Health check
docker exec english-center-db mysqladmin -u root -proot ping

# Restart
docker compose restart db
\\\

### Port already in use
\\\ash
# Dừng tất cả containers
docker compose down

# Hoặc đổi port trong docker-compose.yml
\\\

### Docker not running (macOS/Windows)
- Mở **Docker Desktop**
- Chờ 30 giây để Docker khởi động

### Permission denied (Linux)
\\\ash
sudo usermod -aG docker \
newgrp docker
\\\

---

## 🧹 Commands Hữu Ích

\\\ash
# Khởi động
docker compose up --build

# Dừng
docker compose down

# Reset database
docker compose down -v

# Status
docker compose ps

# Logs
docker compose logs -f

# Backend logs
docker compose logs -f backend

# Frontend logs
docker compose logs -f frontend

# Database logs
docker compose logs -f db

# Resource usage
docker stats

# Connect to database
docker exec -it english-center-db mysql -u root -proot -D english_center

# Test API
curl http://localhost:8080/api/health
\\\

---

## 📝 Local Development (Nếu có Java + Node.js)

### Backend
\\\ash
cd backend
mvn clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar
# Backend: http://localhost:8080
\\\

### Frontend
\\\ash
cd frontend
npm install
npm run dev
# Frontend: http://localhost:5173
\\\

---

## 📂 File Cấu Hình Quan Trọng

- **docker-compose.yml** - Docker Compose config
- **backend/pom.xml** - Maven dependencies
- **frontend/package.json** - npm dependencies
- **frontend/vite.config.js** - Vite config

---

## 📊 Tóm Tắt

| Item | Chi Tiết |
|------|---------|
| Chức năng | 7 features quản lý |
| Backend | Spring Boot 3.3.5 (Java 17) |
| Frontend | React 18.3.1 + Vite 5.4.9 |
| Database | MySQL 8.0 |
| Infrastructure | Docker Compose |
| Cách chạy | docker compose up --build |
| Website | http://localhost:3000 |
| API | http://localhost:8080/api |
| Yêu cầu | Docker + Docker Compose |

---

**Cập nhật:** 07/06/2026 | **Trạng thái:** ✅ Sẵn sàng chạy