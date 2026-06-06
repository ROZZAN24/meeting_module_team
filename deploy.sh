#!/bin/bash
set -e

# Configuration
PEM_KEY="/Users/eash/Desktop/ERP 1.11.56 AM/autonoma-key.pem"
SERVER_IP="52.90.0.221"
SERVER_USER="ubuntu"
REMOTE_HOST="${SERVER_USER}@${SERVER_IP}"

echo "=========================================="
echo "🚀 Starting Deployment to AWS EC2 (${SERVER_IP})"
echo "=========================================="

# Temporarily update .env.production to clear VITE_APP_API_URL for relative paths
echo "🔧 Configuring .env.production for relative paths..."
ENV_FILE="autonoma-frontend/.env.production"
cp "$ENV_FILE" "${ENV_FILE}.bak"
echo "VITE_API_URL=" > "$ENV_FILE"
echo "VITE_APP_API_URL=" >> "$ENV_FILE"

# 1. Build Frontend
echo "📦 Building frontend static assets..."
cd autonoma-frontend
npm run build
cd ..

# Restore original .env.production
echo "🔧 Restoring original .env.production..."
mv "${ENV_FILE}.bak" "$ENV_FILE"

# 2. Copy frontend assets to backend resources/static
echo "📂 Copying frontend assets into backend static resources..."
rm -rf autonoma-backend/src/main/resources/static/*
mkdir -p autonoma-backend/src/main/resources/static
cp -r autonoma-frontend/dist/* autonoma-backend/src/main/resources/static/

# 3. Build Backend JAR (which will now package the frontend inside it)
echo "📦 Building backend JAR..."
cd autonoma-backend
mvn package -DskipTests
cd ..

# 4. Upload backend JAR
echo "📤 Uploading package to EC2 with compression (Rsync)..."
rsync -avz -e "ssh -o StrictHostKeyChecking=no -i \"$PEM_KEY\"" autonoma-backend/target/erp-backend-0.0.1-SNAPSHOT.jar "${REMOTE_HOST}:/home/ubuntu/autonoma-backend-new.jar"

# Write Nginx configuration to upload
echo "📝 Generating Nginx configuration..."
cat << 'EOF' > nginx-default.conf
server {
    listen 80 default_server;
    server_name _;
    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

scp -C -o StrictHostKeyChecking=no -i "$PEM_KEY" nginx-default.conf "${REMOTE_HOST}:/home/ubuntu/nginx-default.conf"
rm -f nginx-default.conf

# 5. Remote Server Config and Restart
echo "🔧 Executing remote deployment commands..."
ssh -o StrictHostKeyChecking=no -i "$PEM_KEY" "$REMOTE_HOST" << 'EOF'
    set -e
    
    echo "⚙️ Applying Nginx configuration..."
    sudo mv /home/ubuntu/nginx-default.conf /etc/nginx/sites-available/default
    sudo systemctl reload nginx
    
    echo "🧹 Cleaning up legacy web root (/var/www/html)..."
    sudo rm -rf /var/www/html/*
    
    echo "🔄 Restarting backend service..."
    PID=$(pgrep -f autonoma-backend.jar || true)
    if [ -n "$PID" ]; then
        echo "Killing running backend process: $PID"
        sudo kill -15 $PID
        sleep 3
        PID2=$(pgrep -f autonoma-backend.jar || true)
        if [ -n "$PID2" ]; then
            echo "Force killing remaining process: $PID2"
            sudo kill -9 $PID2
        fi
    fi
    
    echo "⚙️ Moving new backend JAR version..."
    mv /home/ubuntu/autonoma-backend-new.jar /home/ubuntu/autonoma-backend.jar
    
    echo "Starting new backend instance with RDS datasource overrides..."
    nohup java -Dspring.datasource.url="jdbc:sqlserver://autonoma-db.c274kqgw8lfr.us-east-1.rds.amazonaws.com:1433;databaseName=AUTONOMA;loginTimeout=5;trustServerCertificate=true;sendStringParametersAsUnicode=true;responseBuffering=adaptive;encrypt=true" -Dspring.datasource.username="sa" -Dspring.datasource.password="Eashwar2005" -Dspring.datasource.hikari.connection-timeout=5000 -jar /home/ubuntu/autonoma-backend.jar > /home/ubuntu/erp-backend.log 2>&1 &
    
    echo "⏳ Waiting for backend to bind..."
    sleep 5
    
    if curl -s http://localhost:8081/api/test > /dev/null || [ $? -eq 22 ] || [ $? -eq 0 ]; then
        echo "✅ Backend successfully started and listening on port 8081!"
    else
        echo "⚠️ Warning: Could not verify port 8081 endpoint, check /home/ubuntu/erp-backend.log for status."
    fi
EOF

echo "=========================================="
echo "🎉 Deployment Completed Successfully!"
echo "Visit http://${SERVER_IP} to access the application."
echo "=========================================="
