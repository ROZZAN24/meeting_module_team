# Autonoma ERP System

A professional ERP solution built with **React (Frontend)** and **Java Spring Boot (Backend)**. This project is configured for **Zero-Config Development**, allowing your team to start coding immediately.

---

## 🛠 Prerequisites

Before starting, ensure you have the following installed:
*   **Java JDK 21 (LTS)**: [Download here](https://adoptium.net/temurin/releases/?version=21)
*   **Node.js (v18 or v20)**: [Download here](https://nodejs.org/)

---

## 🐳 Running with Docker (Recommended for Teams)

If you have Docker installed, you can start the entire stack (Frontend, Backend, and SQL Server) with a single command:

```bash
docker-compose up --build
```

*   **Frontend**: http://localhost:3000
*   **Backend**: http://localhost:8080
*   **Database**: SQL Server runs on port 1433

---

## 🚀 Quick Start (Manual Development)

No database installation is required for local development. We use an in-memory **H2 Database** that resets every time you restart the server.

### 1. Backend Setup (Java)
1. Navigate to the backend folder:
   ```bash
   cd Autonoma_Backend
   ```
2. Run the application:
   ```bash
   mvn spring-boot:run
   ```
   *The backend will automatically create the tables and seed an admin user.*

### 2. Frontend Setup (React)
1. Navigate to the frontend folder:
   ```bash
   cd Autonoma_ERP
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
   *The app will be available at http://localhost:3000*

---

## 🔐 Default Credentials
*   **Username**: `admin`
*   **Password**: `admin`

---

## 🛠 Developer Tools
*   **H2 Console**: To view the database tables, visit [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
    *   **JDBC URL**: `jdbc:h2:mem:AUTONOMA`
    *   **Username**: `sa`
    *   **Password**: (Leave blank)

---

## 🤝 Team Workflow (Git Rules)

With 9 developers, we follow these strict rules:
1.  **Never push to `main`**: Always work on a feature branch (`feature/your-task`).
2.  **Pull Requests**: Every change must be reviewed via a PR on GitHub.
3.  **Sync Daily**: Pull the latest changes from `main` every morning (`git pull origin main`).
4.  **Commits**: Use professional commit messages (e.g., `feat: add login validation`, `fix: resolve api timeout`).

---

## 📂 Project Structure
*   `Autonoma_Backend/`: Spring Boot 3.x, JPA, H2 (Dev), JWT Security.
*   `Autonoma_ERP/`: React 18, Material UI, Vite.

