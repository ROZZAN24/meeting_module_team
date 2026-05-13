# Autonoma ERP System

A professional ERP solution built with **React (Frontend)** and **Java Spring Boot (Backend)**, utilizing **Microsoft SQL Server** for data persistence.

---

## 🛠 Prerequisites

Before starting, ensure you have the following installed on your machine:

### 1. Global Requirements
*   **Java JDK 21 (LTS)**: [Download here](https://adoptium.net/temurin/releases/?version=21) (Crucial for Lombok compatibility)
*   **Node.js (v18 or v20)**: [Download here](https://nodejs.org/)
*   **Microsoft SQL Server**: 
    *   **Windows**: [SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) + [SSMS](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms)
    *   **Mac**: Run via Docker: `docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourPassword123" -p 1433:1433 --name sql_server -d mcr.microsoft.com/mssql/server:2022-latest`

---

## 🚀 Getting Started

### Step 1: Database Setup
1. Open your SQL tool (SSMS, Azure Data Studio, or DBeaver).
2. Run the following command to create the database:
   ```sql
   CREATE DATABASE AUTONOMA;
   ```
3. Run the schema script located at `/Autonoma_Backend/sql/schema.sql`.

### Step 2: Backend Setup (Java)
1. Navigate to the backend folder:
   ```bash
   cd Autonoma_Backend
   ```
2. Update `src/main/resources/application.properties` with your local SQL Server credentials if they differ from the default.
3. Run the application:
   *   **Mac/Linux**: `mvn spring-boot:run` (Ensure `JAVA_HOME` points to Java 21)
   *   **Windows**: `mvn spring-boot:run`

### Step 3: Frontend Setup (React)
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

## 💻 OS Specific Instructions

### MacOS
If you have multiple Java versions, force Java 21 for this project:
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
mvn spring-boot:run
```

### Windows
Ensure your Environment Variables include:
*   `JAVA_HOME`: Path to your JDK 21 folder.
*   `Path`: Include the `bin` folder of your JDK and Maven.

---

## 🤝 Team Workflow (Git Rules)

With 9 developers, we follow these strict rules:
1.  **Never push to `main`**: Always work on a feature branch (`feature/your-task`).
2.  **Pull Requests**: Every change must be reviewed via a PR on GitHub.
3.  **Sync Daily**: Pull the latest changes from `main` every morning before starting work.
4.  **Commits**: Use professional commit messages (e.g., `feat: add login validation`, `fix: resolve api timeout`).

---

## 📂 Project Structure
*   `Autonoma_Backend/`: Spring Boot 3.x, JPA, Hibernate, JWT Security.
*   `Autonoma_ERP/`: React 18, Material UI, Vite.
*   `Autonoma_Backend/sql/`: Database schema and migration scripts.