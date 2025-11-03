# Docker Migration Guide - VisitEase Backend

This comprehensive guide will help you migrate your VisitEase backend from a traditional Node.js deployment to a containerized Docker setup.

## Table of Contents

1. [Docker Basics for Beginners](#docker-basics-for-beginners)
2. [Project Analysis](#project-analysis)
3. [Dockerfile Creation](#dockerfile-creation)
4. [Docker Compose Setup](#docker-compose-setup)
5. [Environment Configuration](#environment-configuration)
6. [Database Migration](#database-migration)
7. [Production Optimization](#production-optimization)
8. [Deployment Strategies](#deployment-strategies)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

## Quick Update Checklist (BEGINNERS - UPDATE_ME)

Before you run anything, search this file for the text `UPDATE_ME` and replace the placeholders:
- Repository URL: <UPDATE_ME_REPO_URL>
- JWT Secret(s): <UPDATE_ME_JWT_SECRET>
- Database Password(s): <UPDATE_ME_DB_PASSWORD>
- Domain Names: <UPDATE_ME_DOMAIN>
- SSL Certificate Paths (if using HTTPS locally): <UPDATE_ME_SSL_CERT_PATH>, <UPDATE_ME_SSL_KEY_PATH>
- CORS Origin(s): <UPDATE_ME_CORS_ORIGIN>
- Image/Tag names (if pushing to a registry): <UPDATE_ME_IMAGE_TAG>

## Docker Basics for Beginners

### What is Docker?

Docker is a containerization platform that packages your application and its dependencies into a lightweight, portable container. Think of it as a shipping container for your code.

### Key Concepts:

- **Container**: A running instance of your application
- **Image**: A blueprint/template for creating containers
- **Dockerfile**: Instructions to build an image
- **Docker Compose**: Tool for defining multi-container applications
- **Volume**: Persistent storage for containers
- **Network**: Communication between containers

### Benefits for Your Project:

- **Consistency**: Same environment across development, testing, and production
- **Isolation**: Each service runs in its own container
- **Scalability**: Easy to scale individual services
- **Portability**: Run anywhere Docker is installed
- **Version Control**: Track changes to your infrastructure

## Project Analysis

### Current Project Structure:
```
visitease-backend/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── auth/
│   ├── queries/
│   └── validator/
├── prisma/
├── dist/
├── package.json
├── tsconfig.json
└── prisma/schema.prisma
```

### Dependencies to Containerize:
- **Node.js Application**: Your Express.js backend
- **PostgreSQL Database**: Using Prisma ORM
- **Redis** (if used for caching)
- **Nginx** (for reverse proxy in production)

## Dockerfile Creation

### Step 1: Create the Main Dockerfile

Create `Dockerfile` in your project root:

```dockerfile
# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1 # UPDATE_ME if your health route differs

# Start the application
CMD ["npm", "start"]
```

### Step 2: Create .dockerignore

Create `.dockerignore` to exclude unnecessary files:

```dockerignore
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
.coverage
.env.local
.env.development.local
.env.test.local
.env.production.local
dist
*.log
.DS_Store
Thumbs.db
```

### Step 3: Multi-stage Dockerfile (Production Optimized)

For production, use a multi-stage build:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1 # UPDATE_ME if your health route differs

# Start application
CMD ["node", "dist/index.js"]
```

## Docker Compose Setup

### Step 1: Create docker-compose.yml

Create `docker-compose.yml` for development:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: visitease-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: visitease
      POSTGRES_USER: visitease_user
      POSTGRES_PASSWORD: <UPDATE_ME_DB_PASSWORD>
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./prisma/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - visitease-network

  # Redis Cache (optional)
  redis:
    image: redis:7-alpine
    container_name: visitease-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - visitease-network

  # Backend Application
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: visitease-backend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://visitease_user:<UPDATE_ME_DB_PASSWORD>@postgres:5432/visitease # UPDATE_ME
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=<UPDATE_ME_JWT_SECRET>
      - PORT=3000
    depends_on:
      - postgres
      - redis
    volumes:
      - ./src:/app/src
      - ./prisma:/app/prisma
    networks:
      - visitease-network
    command: npm run dev

  # Nginx Reverse Proxy (for production)
  nginx:
    image: nginx:alpine
    container_name: visitease-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl # place your certs here if needed
    depends_on:
      - backend
    networks:
      - visitease-network

volumes:
  postgres_data:
  redis_data:

networks:
  visitease-network:
    driver: bridge
```

### Step 2: Create docker-compose.prod.yml

For production deployment:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: visitease-postgres-prod
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - visitease-network
    # Remove port exposure for security

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: visitease-redis-prod
    restart: always
    volumes:
      - redis_data:/data
    networks:
      - visitease-network
    # Remove port exposure for security

  # Backend Application
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: visitease-backend-prod
    restart: always
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET} # UPDATE_ME in .env.production
      - PORT=3000
    depends_on:
      - postgres
      - redis
    networks:
      - visitease-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: visitease-nginx-prod
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.prod.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl # UPDATE_ME_SSL_CERT_PATH / UPDATE_ME_SSL_KEY_PATH
    depends_on:
      - backend
    networks:
      - visitease-network

volumes:
  postgres_data:
  redis_data:

networks:
  visitease-network:
    driver: bridge
```

## Environment Configuration

### Step 1: Create Environment Files

Create `.env.development`:

```env
# Database
DATABASE_URL=postgresql://visitease_user:visitease_password@localhost:5432/visitease
POSTGRES_DB=visitease
POSTGRES_USER=visitease_user
POSTGRES_PASSWORD=visitease_password

# Redis
REDIS_URL=redis://localhost:6379

# Application
NODE_ENV=development
PORT=3000
JWT_SECRET=your-development-jwt-secret

# CORS
CORS_ORIGIN=http://localhost:3000
```

Create `.env.production`:

```env
# Database
DATABASE_URL=postgresql://visitease_user:secure_password@postgres:5432/visitease
POSTGRES_DB=visitease
POSTGRES_USER=visitease_user
POSTGRES_PASSWORD=secure_production_password

# Redis
REDIS_URL=redis://redis:6379

# Application
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secure-production-jwt-secret

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### Step 2: Update package.json Scripts

Add Docker-related scripts to your `package.json`:

```json
{
  "scripts": {
    "docker:build": "docker build -t visitease-backend .",
    "docker:run": "docker run -p 3000:3000 visitease-backend",
    "docker:dev": "docker-compose up",
    "docker:prod": "docker-compose -f docker-compose.prod.yml up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "docker:clean": "docker system prune -a",
    "db:migrate": "npx prisma migrate deploy",
    "db:seed": "npx prisma db seed"
  }
}
```

## Database Migration

### Step 1: Update Prisma Configuration

Update your `prisma/schema.prisma` to work with Docker:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Your existing models...
```

### Step 2: Create Database Initialization Script

Create `prisma/init.sql`:

```sql
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS visitease;

-- Create user if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'visitease_user') THEN
        CREATE ROLE visitease_user LOGIN PASSWORD 'visitease_password';
    END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE visitease TO visitease_user;
```

### Step 3: Create Migration Scripts

Create `scripts/migrate.sh`:

```bash
#!/bin/bash
set -e

echo "Waiting for database to be ready..."
sleep 10

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Generating Prisma client..."
npx prisma generate

echo "Database migration completed!"
```

Make it executable:
```bash
chmod +x scripts/migrate.sh
```

## Production Optimization

### Step 1: Create Nginx Configuration

Create `nginx.conf` for development:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3000;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

Create `nginx.prod.conf` for production:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3000;
    }

    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Step 2: Create Health Check Endpoint

Add to your `src/index.ts`:

```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## Deployment Strategies

### Strategy 1: Single Server Deployment

```bash
# 1. Clone your repository
git clone <your-repo-url>
cd visitease-backend

# 2. Build and run
docker-compose -f docker-compose.prod.yml up -d

# 3. Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate

# 4. Check status
docker-compose -f docker-compose.prod.yml ps
```

### Strategy 2: Docker Swarm (Multi-host)

```bash
# 1. Initialize swarm
docker swarm init

# 2. Create stack file
cat > docker-stack.yml << EOF
version: '3.8'
services:
  backend:
    image: visitease-backend:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    networks:
      - visitease-network

networks:
  visitease-network:
    driver: overlay
EOF

# 3. Deploy stack
docker stack deploy -c docker-stack.yml visitease
```

### Strategy 3: Kubernetes (Advanced)

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: visitease-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: visitease-backend
  template:
    metadata:
      labels:
        app: visitease-backend
    spec:
      containers:
      - name: backend
        image: visitease-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: visitease-secrets
              key: database-url
---
apiVersion: v1
kind: Service
metadata:
  name: visitease-backend-service
spec:
  selector:
    app: visitease-backend
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Check container status
docker-compose ps

# Restart specific service
docker-compose restart backend
```

#### 2. Database Connection Issues

```bash
# Check database logs
docker-compose logs postgres

# Test database connection
docker-compose exec backend npx prisma db pull

# Reset database
docker-compose down -v
docker-compose up -d
```

#### 3. Permission Issues

```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### 4. Memory Issues

```bash
# Check container resource usage
docker stats

# Limit memory usage in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
```

### Debugging Commands

```bash
# Enter running container
docker-compose exec backend sh

# Check container processes
docker-compose exec backend ps aux

# View container environment
docker-compose exec backend env

# Check network connectivity
docker-compose exec backend ping postgres
```

## Best Practices

### 1. Security

- Use non-root users in containers
- Keep base images updated
- Scan images for vulnerabilities
- Use secrets management
- Implement proper network segmentation

### 2. Performance

- Use multi-stage builds
- Optimize layer caching
- Use .dockerignore effectively
- Monitor resource usage
- Implement health checks

### 3. Monitoring

```yaml
# Add to docker-compose.yml
services:
  backend:
    # ... existing config
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 4. Backup Strategy

```bash
# Database backup
docker-compose exec postgres pg_dump -U visitease_user visitease > backup.sql

# Restore database
docker-compose exec -T postgres psql -U visitease_user visitease < backup.sql
```

### 5. CI/CD Integration

Create `.github/workflows/docker.yml`:

```yaml
name: Docker Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Build Docker image
      run: docker build -t visitease-backend:${{ github.sha }} .
    
    - name: Run tests
      run: docker run --rm visitease-backend:${{ github.sha }} npm test
    
    - name: Deploy to production
      run: |
        docker tag visitease-backend:${{ github.sha }} visitease-backend:latest
        docker push your-registry/visitease-backend:latest
```

## Migration Checklist

- [ ] Create Dockerfile
- [ ] Create docker-compose.yml
- [ ] Set up environment variables
- [ ] Configure database
- [ ] Add health checks
- [ ] Set up logging
- [ ] Configure reverse proxy
- [ ] Test locally
- [ ] Deploy to staging
- [ ] Deploy to production
- [ ] Set up monitoring
- [ ] Create backup strategy

## Next Steps

1. **Start with Development**: Use docker-compose for local development
2. **Test Thoroughly**: Ensure all functionality works in containers
3. **Optimize for Production**: Use multi-stage builds and production configs
4. **Set up CI/CD**: Automate building and deployment
5. **Monitor and Scale**: Implement monitoring and scaling strategies

This guide provides a complete path from beginner to production-ready Docker deployment for your VisitEase backend project.
