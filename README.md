# Milesora – Project Management & Team Collaboration System

\<p align="center">   A centralized platform for project management, task tracking, and team collaboration. \</p>

---

## 1. Project Overview

**Milesora** is a web-based Project Management and Team Collaboration System designed to help organizations manage projects, assign tasks, monitor progress, and improve communication between team members.

The application provides a centralized workspace where administrators, project managers, and employees can collaborate efficiently, track project activities, and manage their responsibilities.

## 2. Objectives

- Simplify project and task management.
- Improve collaboration between team members.
- Provide role-based access to application features.
- Track project progress and task status.
- Maintain activity records and team discussions.
- Provide a centralized platform for managing organizational work.

## 3. Key Features

- **User Authentication:** Secure login and registration.
- **Role-Based Access Control:** Different permissions for administrators, project managers, and employees.
- **Project Management:** Create, update, view, and manage projects.
- **Task Management:** Assign tasks, set priorities, manage deadlines, and update task statuses.
- **Team Collaboration:** Support discussions between team members.
- **Activity Tracking:** Maintain records of important project and task activities.
- **Dashboard:** Provide a centralized view of project information and activities.
- **Security:** JWT-based authentication and Spring Security integration.
- **Data Management:** Store application information using MySQL.

## 4. Technology Stack

### Backend

- Java 17
- Spring Boot 3.5.5
- Spring Security
- Spring Data JPA
- Hibernate
- JWT Authentication
- Maven
- MySQL

### Frontend

- React.js
- JavaScript
- HTML5
- CSS3
- Vite (if used in the current frontend setup)

### Development Tools

- Eclipse IDE
- Visual Studio Code
- MySQL Workbench
- Git and GitHub

## 5. System Architecture

Milesora follows a frontend-backend architecture.

```text
              USER
                |
                v
       REACT FRONTEND
                |
          REST API Calls
                |
                v
       SPRING BOOT BACKEND
                |
       SPRING SECURITY + JWT
                |
          SERVICE LAYER
                |
        REPOSITORY LAYER
                |
                v
           MYSQL DB
```

## 6. Project Structure

```text
milesora/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

*Note: Update this structure if your actual folders or files differ.*

## 7. Prerequisites

Install the following before running the application:

- Java Development Kit (JDK) 17
- Maven
- Node.js and npm
- MySQL Server
- Git

## 8. Installation and Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/aditi-0409/milesora.git
```

Navigate to the project directory:

```bash
cd milesora
```

### Step 2: Configure the MySQL Database

1. Start MySQL Server.
2. Open MySQL Workbench.
3. Create the database:

```sql
CREATE DATABASE milesora_db;
```

4. Configure your database connection using environment variables.

### Step 3: Configure Backend Environment Variables

The backend uses the following environment variables:

```properties
DB_URL=jdbc:mysql://localhost:3306/milesora_db
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_secure_jwt_secret
PORT=8080
```

Use your own local credentials. Never commit actual passwords or JWT secrets to GitHub.

### Step 4: Run the Backend

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

Run the Spring Boot application:

```bash
mvn spring-boot:run
```

The backend runs at:

```text
http://localhost:8080
```

### Step 5: Run the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Configure the frontend API URL in the frontend environment file:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Start the frontend:

```bash
npm run dev
```

Open the local frontend URL displayed in the terminal (commonly `http://localhost:5173`).

## 9. User Roles

| Role            | Responsibilities                                          |
| --------------- | --------------------------------------------------------- |
| Administrator   | Manage users and oversee the system                       |
| Project Manager | Manage projects, assign tasks, and monitor progress       |
| Employee        | View assigned tasks and participate in team collaboration |

*Actual permissions depend on the application's role-based security configuration.*

## 10. Security

Milesora uses:

- Spring Security for application security.
- JSON Web Tokens (JWT) for authentication.
- Role-based authorization.
- Password hashing through a password encoder.
- Protected REST API endpoints.

Sensitive configuration values should be maintained outside source control.

## 11. Screenshots

Add screenshots of the working application in this section.

| Screen             | Screenshot                   |
| ------------------ | ---------------------------- |
| Login Page         | Add login screenshot         |
| Dashboard          | Add dashboard screenshot     |
| Project Management | Add project screenshot       |
| Task Management    | Add task screenshot          |
| Collaboration      | Add collaboration screenshot |
| Activity Tracking  | Add activity screenshot      |

Suggested folder:

```text
milesora/
└── screenshots/
    ├── login.png
    ├── dashboard.png
    ├── projects.png
    ├── tasks.png
    ├── collaboration.png
    └── activity.png
```

Once screenshots are added, you can display them using:

```markdown
![Dashboard](screenshots/dashboard.png)
```

## 12. Future Enhancements

Potential improvements include:

- Real-time notifications.
- Advanced project analytics and reporting.
- Calendar and deadline management.
- Email notifications.
- Improved dashboard visualizations.
- Cloud deployment and scalability improvements.

## 13. Contributors

**Project:** Milesora – Project Management & Team Collaboration System

**Organization:** Qveto Technologies

**Project Type:** Java Development Internship

**Repository:** [https://github.com/aditi-0409/milesora](https://github.com/aditi-0409/milesora)

Contributors:

- Backend Development: Harsh
- Frontend Development: Nandhini

*Update contributor names and responsibilities as appropriate.*

## 14. License

This project was developed as part of an internship project at Qveto Technologies.

Add an appropriate license if the project is intended for public distribution.

---

\<p align="center">   \*\*Milesora – Plan. Manage. Collaborate.\*\* \</p>
