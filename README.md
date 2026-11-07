# Employee Management System

A full-stack Employee Management System built with **Spring Boot**, **React**, **PostgreSQL**, and **JWT authentication**.

The system provides role-based functionality for **Administrators**, **Project Managers**, and **Employees** to manage employees, projects, attendance, leave, salaries, and parking.

---

## Features

### Authentication & Security
- JWT-based authentication
- Role-based authorization
- Password encryption
- Protected frontend routes
- Session handling and logout
- Change password functionality
- Roles:
  - `ADMIN`
  - `PROJECT_MANAGER`
  - `EMPLOYEE`

### Admin
- User management
- Employee management
- Project management
- Project manager management
- Attendance management
- Leave management
- Salary management
- Parking slot and allocation management

### Project Manager
- View assigned projects
- View and manage project teams
- Assign employees to projects
- Remove employees from projects
- View team attendance
- Review and approve/reject leave requests
- View parking information

### Employee
- Account/profile information
- Change password
- View assigned projects
- View project details
- Mark attendance
- View attendance history
- Apply for leave
- Cancel pending leave
- View salary history
- View parking allocation

---

## Technology Stack

### Backend
- Java 21
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA / Hibernate
- Maven
- PostgreSQL
- Bean Validation

### Frontend
- React 19
- Vite
- JavaScript
- Axios
- React Router
- CSS
- Lucide icons

### Development Tools
- Git
- GitHub
- VS Code / Eclipse
- Postman
- Beekeeper Studio
- Maven

---

## Project Structure

```text
employee-management-system/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/ems/
│   │   │   │   ├── config/
│   │   │   │   ├── controller/
│   │   │   │   ├── dto/
│   │   │   │   ├── entity/
│   │   │   │   ├── exception/
│   │   │   │   ├── mapper/
│   │   │   │   ├── repository/
│   │   │   │   ├── security/
│   │   │   │   ├── service/
│   │   │   │   └── service/impl/
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   ├── test/
│   │   ├── pom.xml
│   │   ├── mvnw
│   │   └── mvnw.cmd
│   │
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── .gitignore
└── README.md
```

---

## Backend Modules

The backend contains the following major modules:

1. Authentication
2. Users
3. Employees
4. Projects
5. Project Assignments / Teams
6. Attendance
7. Leave Management
8. Salary Management
9. Parking Management

---

## API Structure

The backend runs under the `/api` base path.

### Public APIs

```text
POST /api/auth/login
GET  /api/health
```

### Authenticated APIs

```text
GET /api/auth/me
PUT /api/auth/change-password
```

### Admin APIs

```text
/api/admin/users
/api/admin/employees
/api/admin/project-managers
/api/admin/projects
/api/admin/attendance
/api/admin/leaves
/api/admin/salaries
/api/admin/parking
```

### Project Manager APIs

```text
/api/manager/projects
/api/manager/attendance
/api/manager/leaves
/api/manager/parking
```

Project team operations are handled under the manager project routes, including project employee assignment/removal.

### Employee APIs

```text
/api/employee/projects
/api/employee/attendance
/api/employee/leaves
/api/employee/salary
/api/employee/parking
```

---

## Database

Production/runtime configuration uses **PostgreSQL**.

Example database configuration:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/employee_management
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

Do not commit real database passwords or secrets to GitHub.

---

## Environment Variables

### Frontend

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### Backend

Configure database credentials and JWT secrets through environment variables or your local `application.properties`.

**Never commit production secrets, passwords, JWT keys, or API keys.**

---

## Running the Backend

Open a terminal in the backend directory:

### Windows

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The backend will run on:

```text
http://localhost:8080
```

---

## Running the Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend will run on:

```text
http://localhost:5173
```

---

## Build Commands

### Backend

```powershell
cd backend
.\mvnw.cmd clean compile
```

Run tests:

```powershell
.\mvnw.cmd test
```

### Frontend

```powershell
cd frontend
npm run build
```

---

## Login Flow

1. User opens the React application.
2. User enters username and password.
3. React sends credentials to `/api/auth/login`.
4. Backend authenticates the user.
5. Backend returns a JWT.
6. Frontend stores the authentication session.
7. Axios attaches the JWT to protected API requests.
8. User is redirected according to their role.

Role-based dashboards:

```text
ADMIN           → /admin
PROJECT_MANAGER → /manager
EMPLOYEE        → /employee
```

---

## Role-Based Access

| Feature | Admin | Project Manager | Employee |
|---|:---:|:---:|:---:|
| Users | ✅ | ❌ | ❌ |
| Employees | ✅ | ❌ | ❌ |
| Projects | ✅ | ✅ | View |
| Team Management | ❌ | ✅ | ❌ |
| Attendance | ✅ | ✅ | Own |
| Leave | ✅ | Approve/Reject | Own |
| Salary | ✅ | ❌ | Own |
| Parking | ✅ | View | Own |

Authorization is enforced by the backend using Spring Security and JWT roles.

---

## Frontend UI

The frontend includes:

- Responsive sidebar navigation
- Role-specific dashboards
- Reusable cards, tables, modals and forms
- Loading states
- Empty states
- Error handling
- Toast notifications
- Confirmation dialogs
- Responsive layouts
- Project status badges
- Attendance and leave status badges
- Mobile-friendly navigation

---

## Testing

The project includes backend unit/integration tests and frontend production-build verification.

Parking integration testing includes scenarios such as:

- Create parking slot
- Duplicate slot
- List slots
- Get slot
- Nonexistent slot
- Create allocation
- List allocations
- Get allocation
- Employee parking access
- Role-based access restrictions
- Occupied slot validation
- Duplicate allocation validation
- Release allocation
- Slot availability after release

The frontend is verified using:

```bash
npm run build
```

---

## Known Development Note

The project has PostgreSQL as its main database configuration.

Some older test configurations may use H2. H2 versions that treat `month` as a reserved identifier can produce a salary-table DDL error during the complete test suite. This does not affect the PostgreSQL runtime configuration.

---

## Security Notes

Before deploying:

- Change all default passwords.
- Use a strong JWT secret.
- Store secrets in environment variables or a secret manager.
- Do not commit `.env` files containing secrets.
- Use HTTPS in production.
- Configure PostgreSQL with a dedicated application user.
- Restrict database network access.
- Review CORS allowed origins before production deployment.

---

## GitHub Setup

From the project root:

```powershell
git init
git add .
git commit -m "Initial commit - Employee Management System"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

If the repository is already initialized:

```powershell
git status
git add .
git commit -m "Update Employee Management System"
git push
```

---

## Future Enhancements

Possible future improvements:

- Dashboard analytics and charts
- Pagination and advanced filtering
- Email notifications
- Forgot/reset password
- Profile photo management
- Employee self-service profile editing
- Audit logs
- Docker deployment
- CI/CD pipeline
- AWS deployment
- Production monitoring
- Automated API documentation with OpenAPI/Swagger

---

## Author

**Tharun Kumar**

Employee Management System  
Full-Stack Application — Spring Boot + React + PostgreSQL
