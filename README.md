# Autonoma ERP System

A comprehensive Enterprise Resource Planning (ERP) system built with modern technologies including React frontend and Spring Boot backend with SQL Server database.

## 🏗️ Architecture Overview

This ERP system consists of:
- **Frontend**: React.js application with Material-UI components
- **Backend**: Spring Boot REST API with Java 21
- **Database**: Microsoft SQL Server (with H2 for local development)
- **Authentication**: JWT-based security
- **Documentation**: Swagger/OpenAPI integration

## 📋 Prerequisites

### Required Software for Windows

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Java Development Kit (JDK)** (version 21)
   - Download from: https://adoptium.net/
   - Verify installation: `java -version`

3. **Apache Maven** (v3.8 or higher)
   - Download from: https://maven.apache.org/download.cgi
   - Add to PATH environment variable
   - Verify installation: `mvn --version`

4. **Git**
   - Download from: https://git-scm.com/download/win
   - Verify installation: `git --version`

5. **Microsoft SQL Server** (optional for production)
   - SQL Server Express: https://www.microsoft.com/sql-server/sql-server-downloads
   - OR SQL Server Developer Edition
   - Default connection: `localhost:1433`

6. **IDE/Code Editor** (Recommended)
   - Visual Studio Code: https://code.visualstudio.com/
   - IntelliJ IDEA: https://www.jetbrains.com/idea/
   - Spring Tools Suite for Eclipse

## 🚀 Quick Setup Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/EASHWARAPRASADH/BOS_INTERNAL.git
cd BOS_INTERNAL
```

### Step 2: Database Setup

#### Option A: Using SQL Server (Production Setup)

1. Install SQL Server (if not already installed)
2. Create a new database named `AUTONOMA`
3. Execute the SQL script:
   ```sql
   -- Run this script in SQL Server Management Studio
   -- Path: Autonoma_Backend/sql/V1.2__Create_HR_Department_Master.sql
   ```

4. Update database credentials in `Autonoma_ERP/Autonoma_Backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=AUTONOMA;trustServerCertificate=true
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

#### Option B: Using H2 Database (Easy Local Development)

1. Comment out SQL Server configuration and uncomment H2 configuration in `application.properties`:
   ```properties
   # Comment these lines:
   # spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=AUTONOMA;trustServerCertificate=true
   # spring.datasource.username=${DB_USERNAME:nutech}
   # spring.datasource.password=${DB_PASSWORD:nutech@2026}
   
   # Uncomment these lines:
   spring.datasource.url=jdbc:h2:mem:AUTONOMA;DB_CLOSE_DELAY=-1;MODE=MSSQLServer
   spring.datasource.driver-class-name=org.h2.Driver
   spring.datasource.username=sa
   spring.datasource.password=
   spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
   spring.h2.console.enabled=true
   ```

### Step 3: Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Autonoma_ERP/Autonoma_Backend
   ```

2. Build the project using Maven:
   ```bash
   mvn clean install
   ```

3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   
   The backend will start on `http://localhost:8081`

4. Verify API documentation:
   - Open browser: `http://localhost:8081/swagger-ui.html`
   - This will show all available REST endpoints

### Step 4: Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd Autonoma_ERP/Autonoma_ERP
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   
   **Note**: If you encounter permission issues, try:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   
   The frontend will start on `http://localhost:3000`

## 🔧 Configuration Details

### Backend Configuration

The main configuration file is located at:
```
Autonoma_ERP/Autonoma_Backend/src/main/resources/application.properties
```

Key configurations:
- **Server Port**: 8081
- **Database**: SQL Server (configurable to H2)
- **JWT Secret**: Configurable via environment variable `JWT_SECRET`
- **File Upload**: Max 10MB per file

### Frontend Configuration

The frontend configuration is in:
```
Autonoma_ERP/Autonoma_ERP/package.json
```

Key features:
- **UI Framework**: Material-UI (MUI)
- **State Management**: Redux Toolkit
- **Routing**: React Router
- **Charts**: ApexCharts
- **Date Handling**: date-fns
- **Forms**: Formik with Yup validation

## 🗂️ Project Structure

```
BOS_INTERNAL/
├── Autonoma_ERP/
│   ├── Autonoma_ERP/          # React Frontend
│   │   ├── public/           # Static assets
│   │   ├── src/              # Source code
│   │   │   ├── components/   # React components
│   │   │   ├── pages/        # Page components
│   │   │   ├── utils/        # Utility functions
│   │   │   └── services/     # API services
│   │   └── package.json      # Frontend dependencies
│   └── Autonoma_Backend/     # Spring Boot Backend
│       ├── src/
│       │   └── main/
│       │       ├── java/     # Java source code
│       │       └── resources/ # Configuration files
│       ├── sql/              # Database scripts
│       └── pom.xml           # Maven configuration
└── README.md                 # This file
```

## 🧪 Testing

### Backend Testing

```bash
cd Autonoma_ERP/Autonoma_Backend
mvn test
```

### Frontend Testing

```bash
cd Autonoma_ERP/Autonoma_ERP
npm test
```

## 🐛 Common Issues & Solutions

### Issue 1: Node.js Version Compatibility
**Problem**: Frontend fails to start due to Node version
**Solution**: Ensure Node.js v18+ is installed. Use `nvm` to manage versions:
```bash
nvm install 18
nvm use 18
```

### Issue 2: Maven Build Failures
**Problem**: Maven compilation errors
**Solution**: 
1. Ensure Java 21 is installed and set as JAVA_HOME
2. Clean and rebuild:
   ```bash
   mvn clean install -DskipTests
   ```

### Issue 3: Database Connection Issues
**Problem**: Cannot connect to SQL Server
**Solution**:
1. Verify SQL Server is running
2. Check firewall settings
3. Enable TCP/IP in SQL Server Configuration Manager
4. Use H2 database for easier local development

### Issue 4: Port Already in Use
**Problem**: Port 8081 or 3000 already in use
**Solution**:
1. Kill the process using the port:
   ```bash
   # For Windows
   netstat -ano | findstr :8081
   taskkill /PID <PID> /F
   ```
2. Or change the port in configuration files

### Issue 5: Frontend Build Issues
**Problem**: npm install fails with peer dependency conflicts
**Solution**:
```bash
npm install --legacy-peer-deps
```

## 📚 API Documentation

Once the backend is running, access the interactive API documentation:
- **Swagger UI**: `http://localhost:8081/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8081/v3/api-docs`

## 🔐 Security Configuration

### JWT Authentication
- Default secret key is configured in `application.properties`
- For production, set `JWT_SECRET` environment variable
- Token expiration: 24 hours (configurable)

### Database Security
- Use strong passwords for database connections
- Enable SQL Server authentication
- Consider using connection pooling

## 🚀 Deployment

### Production Deployment Steps

1. **Build Frontend**:
   ```bash
   cd Autonoma_ERP/Autonoma_ERP
   npm run build
   ```

2. **Build Backend**:
   ```bash
   cd Autonoma_ERP/Autonoma_Backend
   mvn clean package
   ```

3. **Database Setup**:
   - Configure production SQL Server
   - Run migration scripts
   - Set up proper user permissions

4. **Environment Variables**:
   ```bash
   set DB_URL=jdbc:sqlserver://your-server:1433;databaseName=AUTONOMA
   set DB_USERNAME=your_username
   set DB_PASSWORD=your_password
   set JWT_SECRET=your-secure-secret-key
   ```

## 🤝 Development Guidelines

### Code Style
- **Backend**: Follow Spring Boot conventions
- **Frontend**: Use ESLint and Prettier configurations
- Run linting before commits:
  ```bash
  # Backend
  mvn checkstyle:check
  
  # Frontend
  npm run lint
  npm run prettier
  ```

### Git Workflow
1. Create feature branches from `main`
2. Commit with descriptive messages
3. Create pull requests for review
4. Ensure all tests pass before merging

## 📞 Support

For any setup issues or questions:
1. Check this README for common solutions
2. Review the application logs for error details
3. Check the Swagger documentation for API usage
4. Contact the development team for additional support

## 📄 License

This project is proprietary software. All rights reserved.

---

**Happy Coding! 🎉**