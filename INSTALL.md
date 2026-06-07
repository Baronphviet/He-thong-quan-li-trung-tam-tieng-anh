# 📦 Hướng Dẫn Cài Đặt (Installation Guide)

## Yêu Cầu Hệ Thống

### Khuyến Nghị (Docker)
- Docker: 20.10+
- Docker Compose: 2.0+

### Tùy Chọn (Chạy Local)
- Java: 17+
- Maven: 3.9+
- Node.js: 18+
- npm: 9+

---

## Cài Đặt Docker

### Windows 10/11
1. Tải Docker Desktop: https://www.docker.com/products/docker-desktop
2. Chạy installer
3. Restart máy
4. Kiểm tra: docker --version

### macOS
1. Tải Docker Desktop for Mac
2. Drag vào Applications
3. Kiểm tra: docker --version

### Linux
\\\ash
sudo apt update
sudo apt install docker.io
docker --version
\\\

---

## Khởi Động Dự Án

### Docker Compose (Khuyến Nghị)
\\\ash
cd He-thong-quan-li-trung-tam-tieng-anh
docker compose up --build
\\\

### Local (Backend + Frontend)
\\\ash
# Backend
cd backend
mvn clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
\\\

---

## Cấu Hình

### Thay Đổi Ports
Sửa docker-compose.yml:
\\\yaml
frontend:
  ports:
    - "3001:3000"
backend:
  ports:
    - "8081:8080"
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

## Dọn Dẹp

### Dừng
\\\ash
docker compose down
\\\

### Reset (xóa database)
\\\ash
docker compose down -v
\\\

---

## Troubleshooting

### Port Already in Use
\\\ash
# Thay đổi port trong docker-compose.yml
\\\

### Docker Not Running
- Mở Docker Desktop (Windows/macOS)
- sudo systemctl start docker (Linux)

### Permission Denied (Linux)
\\\ash
sudo usermod -aG docker \
newgrp docker
\\\

---

**Cập nhật:** 07/06/2026