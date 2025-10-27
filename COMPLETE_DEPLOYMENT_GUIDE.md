# Complete VisitEase Deployment Guide - Single EC2 with VPC

This guide will walk you through deploying a complete VisitEase application (React frontend + Express backend + PostgreSQL RDS) on a single EC2 instance with proper VPC networking including public and private subnets.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [VPC Setup with Public/Private Subnets](#vpc-setup-with-publicprivate-subnets)
4. [RDS Database Setup](#rds-database-setup)
5. [EC2 Instance Setup](#ec2-instance-setup)
6. [Application Deployment](#application-deployment)
7. [Frontend Configuration](#frontend-configuration)
8. [Backend Configuration](#backend-configuration)
9. [Nginx Reverse Proxy Setup](#nginx-reverse-proxy-setup)
10. [SSL Certificate Setup](#ssl-certificate-setup)
11. [Testing Your Deployment](#testing-your-deployment)
12. [Troubleshooting](#troubleshooting)

## Architecture Overview

```
Internet
    ↓
Internet Gateway
    ↓
Public Subnet (10.0.1.0/24)
    ↓
EC2 Instance (Frontend + Backend + Nginx)
    ↓
Private Subnet (10.0.2.0/24)
    ↓
RDS PostgreSQL Database
```

**Components:**
- **Public Subnet**: EC2 instance with public IP
- **Private Subnet**: RDS database (no public access)
- **EC2 Instance**: Runs React frontend, Express backend, and Nginx
- **RDS**: PostgreSQL database in private subnet
- **Security Groups**: Control traffic flow between components

## Prerequisites

Before starting, ensure you have:

- **AWS Account** with appropriate permissions
- **AWS CLI** installed and configured
- **Domain name** (optional, for SSL)
- **Git** installed
- **Basic knowledge** of Linux commands

### AWS CLI Setup

```bash
# Install AWS CLI (if not already installed)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure
# Enter your Access Key ID, Secret Access Key, Region (e.g., us-east-1), and output format (json)
```

## VPC Setup with Public/Private Subnets

### 1. Create VPC

1. Go to AWS Console → VPC
2. Click "Create VPC"
3. Choose "VPC and more"
4. Configure:
   - **Name tag**: `visitease-vpc`
   - **IPv4 CIDR block**: `10.0.0.0/16`
   - **Availability Zones**: Select 2 zones (e.g., us-east-1a, us-east-1b)
   - **Number of Availability Zones**: 2
   - **Number of public subnets**: 2
   - **Number of private subnets**: 2
   - **NAT gateways**: 1 (for private subnet internet access)
   - **VPC endpoints**: None
   - **DNS options**: Enable DNS hostnames and DNS resolution

This will create:
- **Public Subnets**: `10.0.1.0/24` and `10.0.2.0/24`
- **Private Subnets**: `10.0.3.0/24` and `10.0.4.0/24`
- **Internet Gateway**: For public subnet internet access
- **NAT Gateway**: For private subnet internet access
- **Route Tables**: Properly configured for each subnet

### 2. Create Security Groups

#### Application Security Group
1. Go to EC2 → Security Groups
2. Click "Create security group"
3. Configure:
   - **Name**: `visitease-app-sg`
   - **Description**: `Security group for VisitEase application`
   - **VPC**: Select visitease-vpc
4. Add inbound rules:
   - **HTTP**: Port 80, Source: 0.0.0.0/0
   - **HTTPS**: Port 443, Source: 0.0.0.0/0
   - **SSH**: Port 22, Source: Your IP/32
   - **Custom TCP**: Port 3000, Source: 127.0.0.1/32 (for local backend access)

#### Database Security Group
1. Create another security group:
   - **Name**: `visitease-db-sg`
   - **Description**: `Security group for VisitEase database`
   - **VPC**: Select visitease-vpc
2. Add inbound rule:
   - **PostgreSQL**: Port 5432, Source: visitease-app-sg (reference by security group)

## RDS Database Setup

### 1. Create DB Subnet Group

1. Go to RDS → Subnet groups
2. Click "Create DB subnet group"
3. Configure:
   - **Name**: `visitease-db-subnet-group`
   - **Description**: `Subnet group for VisitEase database`
   - **VPC**: Select visitease-vpc
   - **Availability Zones**: Select both zones
   - **Subnets**: Select both private subnets (10.0.3.0/24 and 10.0.4.0/24)

### 2. Create RDS Instance

1. Go to RDS → Databases
2. Click "Create database"
3. Configure:
   - **Engine type**: PostgreSQL
   - **Version**: PostgreSQL 15.x
   - **Templates**: Free tier (for testing) or Production
   - **DB instance identifier**: `visitease-db`
   - **Master username**: `visitease_admin`
   - **Master password**: Create strong password (save this!)
   - **DB instance class**: db.t3.micro (free tier)
   - **Storage**: 20 GB (free tier)
   - **Storage type**: General Purpose SSD (gp2)
4. **Connectivity**:
   - **VPC**: visitease-vpc
   - **Subnet group**: visitease-db-subnet-group
   - **Public access**: No
   - **VPC security groups**: visitease-db-sg
   - **Database port**: 5432
5. **Additional configuration**:
   - **Initial database name**: `visitease`
   - **Backup retention**: 7 days
   - **Monitoring**: Enable enhanced monitoring (optional)

**Note the RDS endpoint** (e.g., `visitease-db.xxxxx.us-east-1.rds.amazonaws.com`)

## EC2 Instance Setup

### 1. Create EC2 Instance

1. Go to EC2 → Instances
2. Click "Launch instance"
3. Configure:
   - **Name**: `visitease-app-server`
   - **AMI**: Amazon Linux 2023 (free tier eligible)
   - **Instance type**: t3.micro (free tier) or t3.small
   - **Key pair**: Create new or use existing
   - **Network settings**:
     - **VPC**: visitease-vpc
     - **Subnet**: Select public subnet (10.0.1.0/24)
     - **Auto-assign public IP**: Enable
     - **Security group**: visitease-app-sg
   - **Storage**: 20 GB (free tier)

### 2. Connect to EC2 Instance

```bash
# Set proper permissions for key file
chmod 400 your-key.pem

# Connect via SSH
ssh -i your-key.pem ec2-user@your-instance-public-ip
```

### 3. Install Required Software

```bash
# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Git
sudo yum install -y git

# Install Nginx
sudo yum install -y nginx

# Install PM2 for process management
sudo npm install -g pm2

# Install PostgreSQL client (for testing connection)
sudo yum install -y postgresql15

# Verify installations
node --version
npm --version
nginx -v
pm2 --version
```

## Application Deployment

### 1. Create Application Directory Structure

```bash
# Create application directories
sudo mkdir -p /opt/visitease/{frontend,backend}
sudo chown -R ec2-user:ec2-user /opt/visitease
cd /opt/visitease
```

### 2. Deploy Backend Application

```bash
# Clone backend repository
cd /opt/visitease/backend
git clone https://github.com/yourusername/visitease-backend.git .
# Or upload your backend files

# Install dependencies
npm install

# Install Prisma CLI
sudo npm install -g prisma

# Build the application
npm run build
```

### 3. Deploy Frontend Application

```bash
# Clone frontend repository
cd /opt/visitease/frontend
git clone https://github.com/yourusername/my-react-app.git .
# Or upload your React build files

# Install dependencies
npm install

# Build for production
npm run build

# Copy build files to web directory
sudo cp -r dist/* /usr/share/nginx/html/
sudo chown -R nginx:nginx /usr/share/nginx/html/
```

## Frontend Configuration

### 1. Update API Configuration

Create environment configuration for production:

```bash
# Create production environment file
sudo nano /usr/share/nginx/html/.env.production
```

Add:
```env
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_ENVIRONMENT=production
```

### 2. Update Frontend Build

If you need to rebuild with production API URL:

```bash
cd /opt/visitease/frontend

# Create .env.production file
cat > .env.production << EOF
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_ENVIRONMENT=production
EOF

# Rebuild with production settings
npm run build

# Copy new build files
sudo cp -r dist/* /usr/share/nginx/html/
sudo chown -R nginx:nginx /usr/share/nginx/html/
```

## Backend Configuration

### 1. Create Environment File

```bash
# Create production environment file
sudo nano /opt/visitease/backend/.env.production
```

Add:
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
DATABASE_URL=postgresql://visitease_admin:your-password@your-rds-endpoint:5432/visitease

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=https://your-domain.com

# Logging
LOG_LEVEL=info
```

### 2. Database Migration

```bash
cd /opt/visitease/backend

# Set environment variables
export DATABASE_URL="postgresql://visitease_admin:your-password@your-rds-endpoint:5432/visitease"

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Optional: Seed the database
npm run seed:slots:prod
```

### 3. Create PM2 Configuration

```bash
# Create PM2 ecosystem file
sudo nano /opt/visitease/backend/ecosystem.config.js
```

Add:
```javascript
module.exports = {
  apps: [{
    name: 'visitease-backend',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env.production'
  }]
};
```

### 4. Start Backend Service

```bash
cd /opt/visitease/backend

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command above

# Check status
pm2 status
pm2 logs visitease-backend
```

## Nginx Reverse Proxy Setup

### 1. Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/conf.d/visitease.conf
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Frontend (React app)
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://your-domain.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://your-domain.com";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Authorization, Content-Type";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        root /usr/share/nginx/html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Test and Start Nginx

```bash
# Test Nginx configuration
sudo nginx -t

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

## SSL Certificate Setup

### 1. Install Certbot

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificate

```bash
# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### 3. Update Nginx Configuration for HTTPS

The Certbot will automatically update your Nginx configuration to include HTTPS. You can verify by checking:

```bash
sudo cat /etc/nginx/conf.d/visitease.conf
```

## Testing Your Deployment

### 1. Test Database Connection

```bash
# Test from EC2 instance
psql -h your-rds-endpoint -U visitease_admin -d visitease
```

### 2. Test Backend API

```bash
# Test backend locally
curl http://localhost:3000/api/v1/health

# Test through Nginx
curl http://your-domain.com/api/v1/health
```

### 3. Test Frontend

```bash
# Test frontend
curl http://your-domain.com
```

### 4. Test Complete Application Flow

```bash
# Test user registration
curl -X POST https://your-domain.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "Password123",
    "role": "admin"
  }'
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Error**: `ECONNREFUSED` or `ENOTFOUND`

**Solutions**:
```bash
# Check RDS endpoint
nslookup your-rds-endpoint

# Test connection
psql -h your-rds-endpoint -U visitease_admin -d visitease

# Check security groups
aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx
```

#### 2. Frontend Not Loading

**Error**: 404 or blank page

**Solutions**:
```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Verify files exist
ls -la /usr/share/nginx/html/

# Test Nginx configuration
sudo nginx -t
```

#### 3. Backend API Not Responding

**Error**: 502 Bad Gateway

**Solutions**:
```bash
# Check PM2 status
pm2 status
pm2 logs visitease-backend

# Check if backend is running
netstat -tlnp | grep 3000

# Restart backend
pm2 restart visitease-backend
```

#### 4. SSL Certificate Issues

**Error**: SSL not working

**Solutions**:
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Check Nginx SSL configuration
sudo nginx -t
```

### Useful Commands

```bash
# Check all services
sudo systemctl status nginx
pm2 status
pm2 logs visitease-backend

# Monitor resources
htop
df -h
free -h

# Check network connectivity
ping your-rds-endpoint
telnet your-rds-endpoint 5432

# View logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
pm2 logs visitease-backend --lines 50
```

## Security Best Practices

### 1. Firewall Configuration

```bash
# Configure firewall (if using firewalld)
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Allow only necessary ports
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

### 2. Regular Updates

```bash
# Create update script
sudo nano /opt/visitease/update.sh
```

Add:
```bash
#!/bin/bash
sudo yum update -y
sudo systemctl restart nginx
pm2 restart visitease-backend
```

```bash
# Make executable
sudo chmod +x /opt/visitease/update.sh

# Schedule regular updates (optional)
echo "0 2 * * 0 /opt/visitease/update.sh" | sudo crontab -
```

### 3. Backup Strategy

```bash
# Create backup script
sudo nano /opt/visitease/backup.sh
```

Add:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/visitease/backups"

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /opt/visitease/frontend /opt/visitease/backend

# Backup database (if you have pg_dump access)
# pg_dump -h your-rds-endpoint -U visitease_admin visitease > $BACKUP_DIR/db_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

## Monitoring and Maintenance

### 1. Set Up CloudWatch Agent

```bash
# Download and install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# Configure CloudWatch agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

### 2. Log Rotation

```bash
# Configure log rotation for Nginx
sudo nano /etc/logrotate.d/nginx
```

Add:
```
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 640 nginx adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

## Cost Optimization

### Free Tier Usage
- **EC2**: t3.micro instance
- **RDS**: db.t3.micro instance
- **EBS**: 20 GB storage
- **Data Transfer**: 1 GB/month

### Production Considerations
- Use Application Load Balancer for high availability
- Implement auto-scaling groups
- Use RDS Multi-AZ for database redundancy
- Consider using ECS or EKS for containerized deployment

## Next Steps

1. **Domain Setup**: Configure Route 53 for your domain
2. **CDN**: Implement CloudFront for static assets
3. **Monitoring**: Set up comprehensive monitoring with CloudWatch
4. **CI/CD**: Implement automated deployment pipeline
5. **Backup**: Set up automated backups for database and application

---

This guide provides a complete deployment solution for your VisitEase application on a single EC2 instance with proper VPC networking. The architecture is scalable and can be easily upgraded to a multi-instance setup as your application grows.


