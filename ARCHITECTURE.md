# 📐 Kiến Trúc & Các Gói (Architecture & Packages)

## 🏗️ Tổng Quan Kiến Trúc

Hệ thống sử dụng mô hình 3-tier:
```
┌─────────────────────────┐
│   FRONTEND (React)      │  Port 3000
├─────────────────────────┤
│  Backend API (Spring)   │  Port 8080
├─────────────────────────┤
│  Database (MySQL)       │  Port 3306
└─────────────────────────┘
```

---

## 🖥️ BACKEND (Spring Boot Java)

### Cấu Trúc Thư Mục
```
backend/
├── src/main/
│   ├── java/com/englishcenter/
│   │   ├── controller/           # REST endpoints
│   │   ├── service/              # Business logic
│   │   ├── repository/           # Data access (JPA)
│   │   ├── entity/               # Database entities
│   │   ├── dto/                  # Data Transfer Objects
│   │   ├── exception/            # Custom exceptions
│   │   └── config/               # Spring configuration
│   └── resources/
│       ├── application.yml       # Spring config
│       └── db/migration/         # Flyway SQL migrations
├── pom.xml                       # Maven dependencies
├── Dockerfile                    # Docker image config
└── target/                       # Build output
```

### Dependencies & Công Dụng

#### Core Framework
| Package | Phiên Bản | Công Dụng |
|---------|---------|----------|
| spring-boot-starter-web | 3.3.5 | REST API framework |
| spring-boot-starter-data-jpa | 3.3.5 | JPA ORM for database |

#### Database
| Package | Phiên Bản | Công Dụng |
|---------|---------|----------|
| mysql-connector-j | Latest | MySQL JDBC driver |
| h2database | Latest | In-memory DB (dev) |
| flyway-core | Latest | Database migrations |
| flyway-mysql | Latest | Flyway MySQL support |

#### Validation & Security
| Package | Phiên Bản | Công Dụng |
|---------|---------|----------|
| spring-boot-starter-validation | 3.3.5 | Input validation (@Valid) |

#### Testing
| Package | Phiên Bản | Công Dụng |
|---------|---------|----------|
| spring-boot-starter-test | 3.3.5 | JUnit, Mockito, etc |

### Controllers (API Endpoints)
```
UserController              → /api/users
ClassController             → /api/classes
EnrollmentController        → /api/enrollments
FinanceController           → /api/finance
AnnouncementController      → /api/announcements
AuthController              → /api/auth
HealthController            → /api/health
MasterDataController        → /api/master-data
```

### Services (Business Logic)
- UserService              → Manage users
- ClassService             → Manage classes
- EnrollmentService        → Manage enrollments
- FinanceService           → Manage finance
- AnnouncementService      → Manage announcements
- AuthService              → Authentication

### Entities (Database Tables)
- User                      → Users table
- Class                     → Classes table
- Enrollment               → Enrollments table
- Finance                  → Finance records
- Announcement             → Announcements
- MasterData               → Reference data

### Cách Build
```bash
# Local development (H2 in-memory)
mvn clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar

# Docker
docker build -t english-center-backend ./backend
docker run -p 8080:8080 english-center-backend
```

### Environment Variables
- `DB_URL`: JDBC connection string (auto uses H2 if not set)
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `SERVER_PORT`: Port (default 8080)

---

## ⚛️ FRONTEND (React + Vite)

### Cấu Trúc Thư Mục
```
frontend/
├── src/
│   ├── components/           # Reusable React components
│   ├── pages/                # Page components
│   │   ├── AdminDashboardPage.jsx
│   │   ├── TeacherDashboardPage.jsx
│   │   ├── StudentDashboardPage.jsx
│   │   ├── ParentDashboardPage.jsx
│   │   └── HomePage.jsx
│   ├── router/               # React Router config
│   ├── services/             # API client
│   │   └── apiClient.js      # Axios instance
│   ├── store/                # State management
│   ├── utils/                # Utility functions
│   ├── App.jsx               # Root component
│   ├── main.jsx              # Entry point
│   └── styles.css            # Global styles
├── package.json              # npm dependencies
├── vite.config.js            # Vite config
├── index.html                # HTML template
├── Dockerfile                # Docker config
└── node_modules/             # Dependencies
```

### Dependencies & Công Dụng

#### Core
| Package | Phiên Bản | Công Dụng |
|---------|---------|----------|
| react | 18.3.1 | UI library |
| react-dom | 18.3.1 | React DOM rendering |

#### Routing
| Package | Phiên Bản | Công Dụng |
|---------|---------|----------|
| react-router-dom | 6.28.1 | Client-side routing |

#### Build & Dev
| Package | Phiên Bản | Công Dụng |
|---------|---------|----------|
| vite | 5.4.9 | Fast build tool |
| @vitejs/plugin-react | 4.3.2 | React support for Vite |

### Cách Build
```bash
# Development
npm install
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# Docker
docker build -t english-center-frontend ./frontend
docker run -p 3000:3000 english-center-frontend
```

### Pages (Routes)
```
/                          → HomePage
/dashboard/admin           → AdminDashboardPage
/dashboard/teacher         → TeacherDashboardPage
/dashboard/student         → StudentDashboardPage
/dashboard/parent          → ParentDashboardPage
```

### Environment Variables
- `VITE_API_URL`: Backend API URL (default: http://localhost:8080/api)

### API Service
```javascript
// services/apiClient.js
// Axios instance để call backend API
```

---

## 🗄️ DATABASE (MySQL 8.0)

### Database Name
```
english_center
```

### Tables (Entity)
- `users`          → User accounts
- `classes`        → Classes
- `enrollments`    → Student enrollments
- `finance`        → Finance records
- `announcements`  → System announcements
- `master_data`    → Reference data

### Migration Tool
- **Flyway**: Auto-run SQL migrations từ `backend/src/main/resources/db/migration/`

### Development Database
- **H2 In-Memory**: Khi chạy local (data mất sau shutdown)

### Production Database
- **MySQL 8.0**: Khi chạy Docker (data lưu trong volume)

---

## 🐳 DOCKER INFRASTRUCTURE

### Services
1. **db** (MySQL 8.0)
   - Container name: english-center-db
   - Port: 3306
   - Volume: db_data:/var/lib/mysql
   - Health check: Every 10s

2. **backend** (Spring Boot)
   - Container name: english-center-backend
   - Port: 8080
   - Depends on: db (healthy)
   - Environment: DB_URL, DB_USERNAME, DB_PASSWORD

3. **frontend** (React + Vite)
   - Container name: english-center-frontend
   - Port: 3000
   - Depends on: backend
   - Environment: VITE_API_URL

### Volumes
- **db_data**: MySQL data persistence

### Network
- Docker Compose tạo default network
- Services giao tiếp qua service names (e.g., http://backend:8080)

---

## 🔄 Data Flow

### Typical Request Flow
```
1. User interacts with UI (React Component)
   ↓
2. Frontend calls API via apiClient.js
   ↓
3. Request sent to Backend (http://backend:8080/api)
   ↓
4. Spring Controller routes request
   ↓
5. Service layer processes business logic
   ↓
6. Repository (JPA) queries database
   ↓
7. Database returns data
   ↓
8. Response travels back through layers
   ↓
9. Frontend receives JSON response
   ↓
10. React updates UI
```

---

## 🏃 Performance Notes

### Caching Strategies
- Frontend: React component state
- Backend: Spring Cache (optional)
- Database: MySQL query cache

### Connection Pooling
- Spring Data JPA handles connection pooling

### Load Time
- Development: H2 in-memory (very fast)
- Production: MySQL with network latency

---

## 🧪 Testing Strategy

### Backend Testing
```bash
# Run unit tests
mvn test

# With coverage
mvn test jacoco:report
```

### Frontend Testing
```bash
# Run tests (if set up)
npm test

# Build production
npm run build
```

---

## 📦 Dependency Management

### Backend (Maven)
```bash
# Add new dependency
# Edit backend/pom.xml, then:
mvn clean package
docker compose build backend
```

### Frontend (npm)
```bash
# Add new dependency
cd frontend
npm install <package-name>
docker compose build frontend
```

---

## 🔐 Security Notes

- CORS configured for frontend ↔ backend communication
- No hardcoded credentials (use environment variables)
- Database credentials should be changed in production

---

**Cập nhật lần cuối:** 07/06/2026
