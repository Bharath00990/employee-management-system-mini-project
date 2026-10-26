# 🚀 SECUREX Employee Management System (EMS)

A comprehensive enterprise-grade **Employee Management System** built with **Spring Boot 3.x**, **PostgreSQL**, **Spring Security (JWT)**, and **React 18 + Vite**.

---

## 🏛️ System Architecture

```text
React 18 Frontend (Vite, Framer Motion, Lucide, Recharts)
       │
       │ HTTP / REST / JSON (Axios + JWT Bearer Interceptors)
       ▼
Spring Boot REST API (Port 8080)
       │
       ▼
Spring Security & JWT Authentication Filter
       │
       ▼
Controller Layer (Role-Based Permissions & Endpoints)
       │
       ▼
Service Layer & Business Validations
       │
       ▼
Spring Data JPA / Hibernate Repositories
       │
       ▼
PostgreSQL Database (Database: employee_management_db)
```

---

## 📂 Project Structure

```text
employee-management-system/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/ems/
│       │   ├── config/ (WebSecurityConfig, DataInitializer)
│       │   ├── controller/ (Auth, Employee, Leave, Salary, Parking, Projects, Notifications, Audit)
│       │   ├── dto/ (LoginRequest, JwtResponse, ApiResponse)
│       │   ├── entity/ (User, Role, Employee, Attendance, LeaveRequest, Salary, ParkingSlot, Project...)
│       │   ├── exception/ (GlobalExceptionHandler, ResourceNotFound, Conflict)
│       │   ├── repository/ (JPA Repositories with custom queries)
│       │   ├── security/ (JwtUtils, AuthTokenFilter, UserDetailsServiceImpl)
│       │   └── service/ (AuditLogService, NotificationService)
│       └── resources/application.properties
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── components/layout/ (Navbar, Sidebar, DashboardLayout)
        ├── context/ (AuthContext with Theme & User session)
        ├── pages/ (AdminDashboard, EmployeeManagement, Leaves, Payroll, Parking, Projects, AuditLogs...)
        ├── services/ (api.js Axios interceptor)
        └── index.css (Custom CSS Variables, Tokens, Dark Mode)
```

---

## 🔑 Default Seed Credentials

When Spring Boot starts up with PostgreSQL, the `DataInitializer` seeds realistic sample data:

| Role | Username | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin` | `admin123` | Full control across all 12 modules, users, payroll, reports, and logs |
| **Engineering Manager** | `manager1` | `manager123` | Leave review/approvals, project management, employee tracking |
| **Product Manager** | `manager2` | `manager123` | Deliverable timelines and team assignments |
| **Employee 1** | `emp1` | `emp123` | Clock-in/out, leave requests, pay slips, parking bookings |

---

## 🛠️ Setup & Running

### 1. PostgreSQL Database Setup
1. Ensure PostgreSQL is installed and running on port `5432`.
2. Create the database:
   ```sql
   CREATE DATABASE employee_management_db;
   ```
3. *(Optional)* If your PostgreSQL password differs from default, set environment variables:
   ```powershell
   $env:DB_HOST="localhost"
   $env:DB_PORT="5432"
   $env:DB_NAME="employee_management_db"
   $env:DB_USERNAME="postgres"
   $env:DB_PASSWORD="your_postgres_password"
   ```

### 2. Backend (Spring Boot 3.x)
```powershell
cd employee-management-system/backend
mvn spring-boot:run
```
* Backend runs at: `http://localhost:8080`
* Spring Data JPA will automatically create and update all tables in `employee_management_db`.

### 3. Frontend (React 18 + Vite)
```powershell
cd employee-management-system/frontend
npm install
npm run dev
```
* Frontend runs at: `http://localhost:5173`
