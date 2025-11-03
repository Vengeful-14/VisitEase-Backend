# Simple Deployment: Frontend, Backend, Database on EC2 in one VPC (Singapore)

Scope: Single VPC in `ap-southeast-1` (Singapore), basic subnets, route tables, Network ACLs, and Security Groups. Three EC2 instances (frontend, backend, database) with secure connectivity. No extra networking components beyond core VPC primitives.

## 1) VPC Layout

- Region: `ap-southeast-1`
- VPC CIDR: `10.0.0.0/16`
- Internet Gateway: attach to VPC
- Subnets (for simplicity, use one AZ; you can add more later):
  - Public Subnet A: `10.0.1.0/24` (ap-southeast-1a)

Route Table (Public):
- Associate with Public Subnet A
- Routes:
  - `10.0.0.0/16` -> local
  - `0.0.0.0/0` -> Internet Gateway

Note: For a very simple setup and to avoid additional components (e.g., NAT), all three EC2 instances will reside in the public subnet but will be locked down via Security Groups and NACLs.

## 2) Network ACL (NACL) for Public Subnet A

Stateless rules (remember to allow ephemeral ports):
- Inbound Allow:
  - 80 (HTTP) from 0.0.0.0/0
  - 443 (HTTPS) from 0.0.0.0/0
  - 22 (SSH) from your-admin-IP/32
  - Ephemeral 1024-65535 from 0.0.0.0/0
- Outbound Allow:
  - 0.0.0.0/0 on 80, 443
  - 0.0.0.0/0 on 22 (optional for git/ssh)
  - 0.0.0.0/0 on 1024-65535

Keep default deny for unspecified rules.

## 3) Security Groups (stateful, preferred enforcement)

Create 3 SGs and reference by SG IDs (not CIDR) to minimize exposure.

### SG-Frontend
- Inbound:
  - 80 (HTTP): 0.0.0.0/0
  - 443 (HTTPS): 0.0.0.0/0
  - 22 (SSH): your-admin-IP/32
- Outbound:
  - All traffic: 0.0.0.0/0

### SG-Backend
- Inbound:
  - 3000 (Node backend): from SG-Frontend
  - 22 (SSH): your-admin-IP/32
- Outbound:
  - All traffic: 0.0.0.0/0

### SG-Database (PostgreSQL)
- Inbound:
  - 5432 (Postgres): from SG-Backend
  - 22 (SSH): your-admin-IP/32 (optional, only if managing DB over SSH)
- Outbound:
  - All traffic: 0.0.0.0/0

Result:
- Internet -> Frontend (80/443) only
- Frontend -> Backend (3000) only
- Backend -> Database (5432) only

## 4) EC2 Instances (ap-southeast-1a)

Allocate Elastic IPs for convenience. Use latest Amazon Linux 2023 or Ubuntu LTS.

### EC2-Frontend
- Subnet: Public Subnet A
- SG: SG-Frontend
- User data (nginx serving a static SPA build):
```
#!/bin/bash
set -e
apt-get update -y || yum update -y
apt-get install -y nginx || yum install -y nginx
systemctl enable nginx
cat > /var/www/html/index.html << 'EOF'
<!doctype html><html><head><meta charset="utf-8"><title>VisitEase Frontend</title></head><body><h1>VisitEase Frontend</h1></body></html>
EOF
sed -i 's|try_files.*|try_files $uri /index.html;|g' /etc/nginx/sites-available/default || true
systemctl restart nginx
```

Point your React/SPA build to backend URL via env (e.g., `REACT_APP_API_URL=https://<frontend-eip-or-domain>/api` if reverse-proxying, or backend EIP directly).

### EC2-Backend
- Subnet: Public Subnet A
- SG: SG-Backend
- Env:
```
PORT=3000
DATABASE_URL=postgresql://dbuser:dbpass@<db-private-ip-or-eip>:5432/visitease
NODE_ENV=production
JWT_SECRET=change-me
```
- User data (Node.js with PM2):
```
#!/bin/bash
set -e
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - || true
apt-get install -y nodejs git || yum install -y nodejs git -y
npm install -g pm2
mkdir -p /opt/visitease && cd /opt/visitease
git clone <your-backend-repo-url> app || true
cd app
npm ci || npm install
npm run build || true
pm2 start dist/index.js --name visitease-backend
pm2 save
pm2 startup -u root --hp /root
```

### EC2-Database (PostgreSQL)
- Subnet: Public Subnet A
- SG: SG-Database
- User data (Postgres 15+):
```
#!/bin/bash
set -e
apt-get update -y || yum update -y
apt-get install -y postgresql postgresql-contrib || true
systemctl enable postgresql || systemctl enable postgresql-15 || true
systemctl start postgresql || systemctl start postgresql-15 || true
sudo -u postgres psql -c "CREATE USER dbuser WITH PASSWORD 'dbpass';" || true
sudo -u postgres psql -c "CREATE DATABASE visitease OWNER dbuser;" || true
sed -i "s/^#listen_addresses.*/listen_addresses = '*' /" /etc/postgresql/*/main/postgresql.conf || true
echo "host    all             all             10.0.0.0/16            md5" >> /etc/postgresql/*/main/pg_hba.conf || true
systemctl restart postgresql || systemctl restart postgresql-15 || true
```

Note: DB is in a public subnet for simplicity, but access is restricted to SG-Backend only. For production hardening, move DB to a private subnet and add NAT/bastion later.

## 5) DNS (optional)

- Create A records pointing to the Elastic IPs:
  - `app.example.com` -> EC2-Frontend EIP
  - `api.example.com` -> EC2-Backend EIP

## 6) Minimal Hardening Checklist

- Use strong SSH keys, disable password SSH logins
- Limit SSH to your IP only in SGs and NACLs
- Keep instances updated; enable automatic security updates
- Rotate secrets; store env in SSM Parameter Store instead of instance files
- Enable CloudWatch agent for logs/metrics

## 7) Connectivity Test Matrix

- From Internet:
  - HTTP/HTTPS to Frontend: allowed
  - HTTP/HTTPS to Backend: denied
  - Postgres to DB: denied
- From Frontend instance:
  - TCP 3000 to Backend: allowed
  - TCP 5432 to DB: denied
- From Backend instance:
  - TCP 5432 to DB: allowed

## 8) Cost Notes (rough)

- 3× t3.small instances in ap-southeast-1 + 3 EIPs
- Data transfer and EBS volumes apply

This is a minimal, VPC-only deployment in Singapore prioritizing simplicity and basic security boundaries using SGs/NACLs. You can later evolve to private subnets, NAT, ALB, and RDS without readdressing the VPC.


