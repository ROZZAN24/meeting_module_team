# 🚀 Autonoma ERP — Stack Startup Guide

> **Stack**: SQL Server (Docker) → Spring Boot Backend (Maven) → React Frontend (Vite)
>
> **Always start in this exact order.** If any layer is skipped or out of order, the app will fail.

---

## 📋 Prerequisites (One-time Setup)

| Requirement | Version | Check |
|-------------|---------|-------|
| Java (OpenJDK) | 17+ | `java -version` |
| Maven | 3.8+ | `mvn -version` |
| Node.js | 18+ | `node -version` |
| Docker Desktop | Latest | `docker -version` |

---

## 🗂️ Project Structure

```
ERP 1.11.56 AM/
├── docker-compose.yml       ← SQL Server (database)
├── autonoma-backend/        ← Spring Boot API (port 8081)
└── autonoma-frontend/       ← React + Vite UI (port 3001)
```

---

## ⚡ Quick Start (All-in-One Commands)

Open **3 separate terminal windows/tabs** and run one command in each:

### Terminal 1 — Database (SQL Server)
```bash
cd "/Users/eash/Desktop/ERP 1.11.56 AM"
docker-compose up -d
```

### Terminal 2 — Backend (Spring Boot)
```bash
cd "/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-backend"
mvn spring-boot:run
```

### Terminal 3 — Frontend (React)
```bash
cd "/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-frontend"
npm run dev
```

**Then open:** http://localhost:3001

---

## 🔢 Step-by-Step Detailed Guide

---

### STEP 1 — Start the Database (SQL Server via Docker)

The database is a Microsoft SQL Server 2022 instance running in Docker.

```bash
cd "/Users/eash/Desktop/ERP 1.11.56 AM"
docker-compose up -d
```

**Verify it's running:**
```bash
docker ps
# You should see: autonoma-sqlserver   ...   0.0.0.0:1433->1433/tcp
```

**Database credentials:**
| Field | Value |
|-------|-------|
| Host | `localhost` |
| Port | `1433` |
| Database | `AUTONOMA` |
| Username | `sa` |
| Password | `nutech@2026` |

> ⏳ Wait ~15 seconds after starting before launching the backend. SQL Server needs time to initialize.

---

### STEP 2 — Start the Backend (Spring Boot)

The backend is a Spring Boot 3.2 REST API. It connects to the SQL Server on port 1433 and serves APIs on port **8081**.

```bash
cd "/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-backend"
mvn spring-boot:run
```

**Verify it's running:**
```bash
curl http://localhost:8081/api/master/employee
# Should return JSON array of employees
```

Or open in browser: http://localhost:8081/swagger-ui.html (Swagger API docs)

> ⏳ First startup takes ~30–60 seconds (Maven downloads dependencies, Spring Boot initializes).
>
> ✅ Look for this line in the terminal:
> ```
> Started ErpBackendApplication in X.XXX seconds
> ```

**Backend config file:** `autonoma-backend/src/main/resources/application.properties`

---

### STEP 3 — Start the Frontend (React + Vite)

The frontend is a React app served by Vite. It proxies all `/api` calls to the backend at port 8081.

```bash
cd "/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-frontend"
npm run dev
```

**Verify it's running:**
Open → http://localhost:3001

> ✅ You'll see:
> ```
>   VITE vX.X.X  ready in XXX ms
>   ➜  Local:   http://localhost:3001/
> ```

**Proxy configuration** (in `vite.config.mjs`):
```
/api/* → http://localhost:8081
```
All frontend API calls are automatically forwarded to the Spring Boot backend.

---

## 🔄 Stopping the Stack

### Stop the Frontend
Press `Ctrl + C` in Terminal 3.

### Stop the Backend
Press `Ctrl + C` in Terminal 2.

### Stop the Database
```bash
cd "/Users/eash/Desktop/ERP 1.11.56 AM"
docker-compose down
```

> ⚠️ Use `docker-compose down` (NOT `docker stop`). This properly stops the container.
> Your database data is **persisted** in the Docker volume `mssql_data` — it survives restarts.

---

## 🔁 Restart the Backend (After Code Changes)

When you modify Java backend code, restart the backend:

```bash
# Kill the running backend first
pkill -f "spring-boot:run"

# Wait 3 seconds, then restart
sleep 3 && cd "/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-backend" && mvn spring-boot:run
```

Or simply press `Ctrl + C` in the backend terminal, then run `mvn spring-boot:run` again.

> The frontend (Vite) has **Hot Module Replacement (HMR)** — frontend code changes apply instantly without restart.

---

## 🌐 Service URLs at a Glance

| Service | URL | Notes |
|---------|-----|-------|
| **Frontend (App)** | http://localhost:3001 | Main ERP application |
| **Backend API** | http://localhost:8081 | REST API |
| **Swagger Docs** | http://localhost:8081/swagger-ui.html | All API endpoints |
| **SQL Server** | `localhost:1433` | Use Azure Data Studio or DBeaver to connect |

---

## 🛠️ Troubleshooting

### ❌ Backend fails with "Connection refused to localhost:1433"
→ SQL Server (Docker) is not running.
```bash
docker-compose up -d
# Wait 15 seconds, then restart backend
```

### ❌ Frontend shows "ECONNREFUSED" / API errors
→ Backend is not running.
```bash
cd "/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-backend"
mvn spring-boot:run
```

### ❌ Port 3001 already in use
→ Another Vite instance is running.
```bash
lsof -i :3001
kill -9 <PID>
# Then restart frontend
```

### ❌ Port 8081 already in use
→ Another Spring Boot instance is running.
```bash
lsof -i :8081
kill -9 <PID>
# Then restart backend
```

### ❌ Docker container won't start
```bash
docker-compose down
docker-compose up -d
# Or full reset (WARNING: wipes database):
docker-compose down -v
docker-compose up -d
```

### ❌ Maven build errors
```bash
cd "/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-backend"
mvn clean install -DskipTests
mvn spring-boot:run
```

### ❌ npm / Node errors on frontend
```bash
cd "/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-frontend"
rm -rf node_modules
npm install
npm run dev
```

---

## 📊 Check Everything Is Running

Run this quick health check:

```bash
# 1. Database
docker ps | grep autonoma-sqlserver && echo "✅ DB running" || echo "❌ DB down"

# 2. Backend
curl -s http://localhost:8081/api/master/employee > /dev/null && echo "✅ Backend running" || echo "❌ Backend down"

# 3. Frontend
curl -s http://localhost:3001 > /dev/null && echo "✅ Frontend running" || echo "❌ Frontend down"
```

---

## 🔐 Default Login

After the stack is up, login at http://localhost:3001 using credentials stored in the `AUTONOMA` database (`ad_user_credential` table).

---

*Last updated: May 2026 — Autonoma ERP v1.11*
