# Taskora Pulse — Project & Team Intelligence Platform

> **Tagline**: Plan Smarter. Collaborate Better. Deliver on Time.  
> **Target Backend**: Java 17+, Spring Boot 3.x, Spring Security (JWT), Spring Data JPA, MySQL 8.x

---

## 1. Overview
Taskora Pulse is an enterprise project management and team intelligence platform built with React, Vite, Tailwind CSS, and Recharts. It features deep indigo/violet SaaS aesthetics, role-based workflows for Administrators, Project Managers, and Engineers, an interactive Kanban board with dependency enforcement, and an algorithmic project risk intelligence engine.

---

## 2. Key Features

- **Role-Based Experience**: Tailored dashboards and actions for `ADMIN` (Platform governance & team audit), `PROJECT_MANAGER` (Initiative delivery & bottleneck resolution), and `EMPLOYEE` (Personal queue & today's focus).
- **Interactive Kanban Board**: 4 stages (`TO_DO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`) with drag-and-drop, accessible keyboard controls, optimistic updates with rollback, and dependency validation rules.
- **Taskora Pulse Project Insights (Flagship)**: Algorithmic health index (0-100), factor identification (approaching deadlines, incomplete prerequisite dependencies, overloaded assignees), and clear remediation recommendations.
- **Centralized API Architecture**: Single configured `apiClient.js` with Bearer token injection, automatic error normalization (400, 401, 403, 404, 409, 500), and multipart/form-data support.
- **Reports & Analytics**: Recharts data visualizations with dynamic project filters and direct CSV data export.
- **Dual-Mode System**: Instant, toggleable Demo Mode with local state persistence alongside strict live backend integration mode.

---

## 3. Quick Start

### Installation
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

### Production Build
```bash
npm run build
```

---

## 4. Connecting to Java Spring Boot Backend

1. In `.env`, ensure the backend URL points to your Spring Boot instance:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   VITE_DEMO_MODE=false
   ```
2. Review `API_CONTRACT.md` for all REST controller endpoints, DTO formats, and error responses.
3. Test your connection at any time in the application via **Settings & Profile &rarr; Test Connection to Spring Boot**.
