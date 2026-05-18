# 🛡️ Autonoma ERP System

A premium enterprise resource planning solution built with **React 19 (Frontend)** and **Spring Boot 3.x (Backend)**, powered by **Microsoft SQL Server 2022**.

---

## 📚 Documentation Hub
For detailed technical standards and module guides, please visit our **[Documentation Center](./docs/README.md)**.

*   **[Database Architecture](./DATABASE_ARCHITECTURE.md)**: Standards for MSSQL, Flyway, and Docker Sync.
*   **[UI Standards](./docs/UI_STANDARDS.md)**: Guidelines for BOS Premium UI components.
*   **[Development Guide](./docs/BOS_DEVELOPMENT_GUIDE.md)**: Coding standards for Java and React.

---

## 🚀 Quick Start (Docker Environment)

We use Docker to ensure every developer has the exact same database environment.

### 1. Start the Database
```bash
docker-compose up -d
```
*This spins up MSSQL Server 2022 on port 1433.*

### 2. Backend Setup (Java 21)
```bash
cd autonoma-backend
mvn spring-boot:run
```
*Flyway will automatically sync the schema from `src/main/resources/db/migration`.*

### 3. Frontend Setup (Vite + React)
```bash
cd autonoma-frontend
npm install
npm run dev
```
*The app will be available at http://localhost:3000 (or the port shown in terminal).*

---

## 🤝 Development Standards
*   **Java 21 (LTS)** is required for backend services.
*   **Flyway** is the sole authority for database schema changes.
*   **BOS Components** must be used for all new UI development to ensure consistency.

---

## 📂 Project Structure
*   `Autonoma_Backend/`: Spring Boot 3.x, JPA, Hibernate, JWT Security.
*   `Autonoma_ERP/`: React 18, Material UI, Vite.
<<<<<<< HEAD
*   `Autonoma_Backend/sql/`: Database schema and migration scripts.
=======
*   `Autonoma_Backend/sql/`: Database schema and migration scripts.
>>>>>>> origin/chore/repo-cleanup
