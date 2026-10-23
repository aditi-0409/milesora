# Taskora Pulse — Java Spring Boot REST API Contract Specification
**Status**: Proposed Backend Contract Specification (v1.0.0)  
**Target Backend Framework**: Java 17+, Spring Boot 3.x, Spring Security (JWT / Bearer Token), Spring Data JPA, MySQL 8.x  
**Base URL**: `http://localhost:8080/api`

This document defines the complete REST API contract that the Taskora Pulse frontend is built to communicate with. All endpoints, DTO schemas, enumerations, HTTP status codes, and error payloads are detailed below.

---

## 1. Authentication & Security Specification

All secured endpoints expect the following HTTP header:
```http
Authorization: Bearer <jwt-token>
```

### 1.1 Standard Enums

#### User Roles (`Role`)
- `ADMIN`: Platform administrator with full access to manage users, audit logs, and system settings.
- `PROJECT_MANAGER`: Can create, edit, archive projects, assign team members, manage tasks, and view risk analytics.
- `EMPLOYEE`: Team member who can view assigned projects, update task statuses, log time, comment, and upload files.

#### Project Status (`ProjectStatus`)
- `PLANNING`: In initial scoping.
- `ACTIVE`: Currently ongoing.
- `ON_HOLD`: Temporarily paused.
- `COMPLETED`: Finished and verified.
- `ARCHIVED`: Archived for historical records.

#### Priority (`Priority`)
- `LOW`: Low urgency.
- `MEDIUM`: Standard operational urgency.
- `HIGH`: Requires immediate attention.
- `CRITICAL`: Blocker or deadline risk.

#### Task Status (`TaskStatus`)
- `TO_DO`: Task created, ready to be picked up.
- `IN_PROGRESS`: Actively being worked on.
- `IN_REVIEW`: Ready for code review / QA / sign-off.
- `COMPLETED`: Done and signed off.

---

## 2. API Endpoints

### 2.1 Authentication (`/auth`)

#### `POST /auth/login`
Authenticates user and returns JWT token and profile details.
- **Request Body**:
```json
{
  "email": "sarah.pm@taskora.io",
  "password": "Password123!"
}
```
- **Response `200 OK`**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "user": {
    "id": 1,
    "name": "Sarah Connor",
    "email": "sarah.pm@taskora.io",
    "role": "PROJECT_MANAGER",
    "title": "Lead Technical Project Manager",
    "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    "createdAt": "2026-01-15T09:30:00Z"
  }
}
```
- **Errors**: `401 Unauthorized` (Invalid credentials), `400 Bad Request` (Missing fields).

#### `POST /auth/register`
Creates a new user account.
- **Request Body**:
```json
{
  "name": "Alex Rivera",
  "email": "alex.dev@taskora.io",
  "password": "Password123!",
  "role": "EMPLOYEE"
}
```
- **Response `201 Created`**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "user": {
    "id": 2,
    "name": "Alex Rivera",
    "email": "alex.dev@taskora.io",
    "role": "EMPLOYEE",
    "title": "Full Stack Engineer",
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    "createdAt": "2026-10-14T10:00:00Z"
  }
}
```
- **Errors**: `409 Conflict` (Email already registered), `400 Bad Request` (Validation error).

#### `GET /auth/me`
Fetches the currently authenticated user session.
- **Response `200 OK`**: returns user profile object.

---

### 2.2 Dashboard & Metrics (`/dashboard`)

#### `GET /dashboard/stats`
Returns role-appropriate KPI metrics and summary indicators.
- **Query Params**: `role` (Optional override/audit)
- **Response `200 OK`**:
```json
{
  "totalUsers": 24,
  "totalProjects": 8,
  "activeProjects": 6,
  "completedProjects": 2,
  "totalTasks": 86,
  "completedTasks": 48,
  "inProgressTasks": 24,
  "overdueTasks": 5,
  "blockedTasks": 3,
  "overallCompletionRate": 68.5,
  "teamHealthScore": 88,
  "tasksDueToday": 4,
  "myAssignedTasks": 12
}
```

---

### 2.3 Projects (`/projects`)

#### `GET /projects`
Fetches list of projects with filtering, sorting, and pagination.
- **Query Params**: `status`, `priority`, `managerId`, `search`, `page`, `size`, `sort`
- **Response `200 OK`**:
```json
[
  {
    "id": 1,
    "name": "Cloud Architecture Migration",
    "key": "CAM",
    "description": "Migrate monolithic legacy services to microservices on AWS ECS.",
    "status": "ACTIVE",
    "priority": "HIGH",
    "startDate": "2026-08-01",
    "dueDate": "2026-11-30",
    "manager": {
      "id": 1,
      "name": "Sarah Connor",
      "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    },
    "memberCount": 6,
    "taskStats": {
      "total": 24,
      "completed": 16,
      "inProgress": 5,
      "toDo": 3,
      "progressPercentage": 66.7
    },
    "riskLevel": "MODERATE",
    "createdAt": "2026-08-01T08:00:00Z"
  }
]
```

#### `GET /projects/{id}`
Returns full project detail including members and milestone summary.

#### `POST /projects`
Creates a project.
- **Request Body**:
```json
{
  "name": "AI Workflow Automation",
  "key": "AWA",
  "description": "Build automated workflow bots for internal ticket resolution.",
  "status": "PLANNING",
  "priority": "MEDIUM",
  "startDate": "2026-10-20",
  "dueDate": "2027-01-15",
  "managerId": 1,
  "memberIds": [1, 2, 3]
}
```

#### `PUT /projects/{id}`
Updates existing project details.

#### `DELETE /projects/{id}`
Soft deletes or archives the project. Returns `204 No Content`.

---

### 2.4 Tasks (`/tasks`)

#### `GET /tasks`
Lists tasks with multi-field filtering.
- **Query Params**: `projectId`, `assigneeId`, `status`, `priority`, `search`
- **Response `200 OK`**:
```json
[
  {
    "id": 101,
    "taskCode": "CAM-12",
    "title": "Configure Redis Distributed Cache",
    "description": "Implement AWS ElastiCache Redis cluster configuration and cache warming.",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "projectId": 1,
    "projectName": "Cloud Architecture Migration",
    "assignee": {
      "id": 2,
      "name": "Alex Rivera",
      "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    "startDate": "2026-10-10",
    "dueDate": "2026-10-22",
    "estimatedHours": 16,
    "spentHours": 10,
    "dependencyIds": [99],
    "dependencyTitles": ["Provision AWS VPC and Security Groups"],
    "hasIncompleteDependencies": false,
    "commentsCount": 4,
    "attachmentsCount": 2,
    "createdAt": "2026-10-10T11:00:00Z"
  }
]
```

#### `POST /tasks`
Creates a new task.
- **Request Body**:
```json
{
  "title": "Design Database Schema for User Roles",
  "description": "Create JPA entities and Liquibase migrations.",
  "projectId": 1,
  "assigneeId": 2,
  "status": "TO_DO",
  "priority": "HIGH",
  "dueDate": "2026-10-28",
  "estimatedHours": 12,
  "dependencyIds": []
}
```

#### `PATCH /tasks/{id}/status`
Updates task status (used in Kanban board and Task details).
- **Request Body**:
```json
{
  "status": "COMPLETED"
}
```
- **Response**: `200 OK` on success, or `409 Conflict` if dependent prerequisite tasks are still incomplete with message:
```json
{
  "timestamp": "2026-10-14T11:15:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Cannot complete task 'CAM-12' because prerequisite task 'CAM-10: Provision AWS VPC' is not yet COMPLETED."
}
```

---

### 2.5 Taskora Pulse Project Insights (`/insights`)

#### `GET /insights/projects/{id}`
Returns algorithmic project health, risk distribution, and prioritized recommendations.
- **Response `200 OK`**:
```json
{
  "projectId": 1,
  "projectName": "Cloud Architecture Migration",
  "healthScore": 76,
  "healthStatus": "NEEDS_ATTENTION",
  "riskDistribution": {
    "critical": 1,
    "high": 3,
    "medium": 6,
    "low": 14
  },
  "atRiskTasks": [
    {
      "taskId": 104,
      "taskCode": "CAM-15",
      "title": "Database Read Replica Replication",
      "riskScore": 84,
      "riskLevel": "CRITICAL",
      "reason": "Deadline approaches in 2 days but prerequisite #CAM-12 is still in progress; assignee Alex is concurrently assigned 5 active tasks.",
      "factors": ["Approaching Deadline", "Dependency Risk", "Assignee Workload"],
      "recommendedAction": "Reassign auxiliary review tasks or extend deadline by 3 days."
    }
  ],
  "teamWorkloadWarnings": [
    {
      "userId": 2,
      "userName": "Alex Rivera",
      "activeTasksCount": 5,
      "threshold": 3,
      "status": "OVERLOADED"
    }
  ]
}
```

---

### 2.6 Team & Workload (`/team`)

#### `GET /team`
Returns all registered team members with workload metrics.
- **Response `200 OK`**:
```json
[
  {
    "id": 1,
    "name": "Sarah Connor",
    "email": "sarah.pm@taskora.io",
    "role": "PROJECT_MANAGER",
    "title": "Lead Technical Project Manager",
    "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    "assignedTasks": 3,
    "completedTasks": 18,
    "overdueTasks": 0,
    "activeWorkload": "OPTIMAL",
    "activeProjects": ["Cloud Architecture Migration", "AI Workflow Automation"]
  }
]
```

---

### 2.7 Collaboration, Comments, & Attachments

#### `GET /tasks/{taskId}/comments` & `POST /tasks/{taskId}/comments`
```json
{
  "content": "Redis test cluster passed latency benchmarks under 2ms."
}
```

#### `POST /tasks/{taskId}/attachments` (Multipart)
`Content-Type: multipart/form-data` with form field `file`. Returns attachment metadata.

#### `POST /tasks/{taskId}/time-entries`
```json
{
  "hours": 3.5,
  "description": "Benchmarking memory usage under load.",
  "date": "2026-10-14"
}
```

---

### 2.8 Notifications (`/notifications`)

#### `GET /notifications`
Returns user notifications.
#### `PATCH /notifications/{id}/read`
Marks single notification as read.
#### `PATCH /notifications/read-all`
Marks all as read.

---

### 2.9 Standard Spring Boot Error Format

```json
{
  "timestamp": "2026-10-14T11:20:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Field 'dueDate' must be in the future.",
  "path": "/api/tasks"
}
```
