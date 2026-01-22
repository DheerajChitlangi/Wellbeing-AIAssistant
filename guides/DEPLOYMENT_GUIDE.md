# Wellbeing Copilot - Deployment Guide

Complete deployment guide for local development, Docker, and cloud deployment.

---

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Docker Deployment](#docker-deployment)
3. [Cloud Deployment](#cloud-deployment)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Security Checklist](#security-checklist)
7. [Monitoring & Logs](#monitoring--logs)

---

## Local Development Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- Git

### Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Copy environment variables
cp .env.example .env

# 6. Edit .env and set your values
# Especially: SECRET_KEY, DATABASE_URL

# 7. Run database migrations (if using Alembic)
# alembic upgrade head

# 8. (Optional) Seed sample data
python -m app.core.seed_data

# 9. Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be running at: **http://localhost:8000**
API Documentation: **http://localhost:8000/docs**

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Edit .env.local and set your values

# 5. Start development server
npm run dev
```

Frontend will be running at: **http://localhost:5173**

---

## Docker Deployment

### Docker Files

**backend/Dockerfile:**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Start application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**frontend/Dockerfile:**

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml** (root directory):

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    container_name: wellbeing-db
    environment:
      POSTGRES_USER: wellbeing
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme}
      POSTGRES_DB: wellbeing
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U wellbeing"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: wellbeing-backend
    env_file:
      - ./backend/.env
    environment:
      DATABASE_URL: postgresql://wellbeing:${DB_PASSWORD:-changeme}@db:5432/wellbeing
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: wellbeing-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      VITE_API_BASE_URL: http://localhost:8000/api/v1

volumes:
  postgres_data:
```

### Running with Docker

```bash
# 1. Create .env file in root directory
echo "DB_PASSWORD=your_secure_password" > .env

# 2. Build and start all services
docker-compose up -d

# 3. Check logs
docker-compose logs -f

# 4. Stop services
docker-compose down

# 5. Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Docker Commands

```bash
# View running containers
docker-compose ps

# Access backend shell
docker-compose exec backend bash

# Access database
docker-compose exec db psql -U wellbeing

# Restart a service
docker-compose restart backend

# View logs for specific service
docker-compose logs -f backend

# Rebuild after code changes
docker-compose up -d --build

# Seed sample data
docker-compose exec backend python -m app.core.seed_data
```

---

## Cloud Deployment

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Deploy Backend to Railway

1. **Create Railway Account**
   - Go to https://railway.app/
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Python app

3. **Add PostgreSQL Database**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set DATABASE_URL

4. **Configure Environment Variables**
   - Go to Variables tab
   - Add all variables from `.env.example`
   - Set `CORS_ORIGINS` to include your Vercel domain

5. **Deploy**
   - Railway will automatically deploy on git push
   - Copy your backend URL (e.g., `https://your-app.railway.app`)

#### Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com/
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import from GitHub repository
   - Set root directory to `frontend`

3. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variables**
   ```
   VITE_API_BASE_URL=https://your-backend.railway.app/api/v1
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically

---

### Option 2: Render (Full Stack)

#### Deploy to Render

1. **Create Render Account**
   - Go to https://render.com/
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - Dashboard → "New" → "PostgreSQL"
   - Choose free tier or paid
   - Note the Internal Database URL

3. **Deploy Backend**
   - "New" → "Web Service"
   - Connect GitHub repository
   - Settings:
     - Name: `wellbeing-backend`
     - Root Directory: `backend`
     - Environment: Python 3
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables (use Internal Database URL)

4. **Deploy Frontend**
   - "New" → "Static Site"
   - Connect GitHub repository
   - Settings:
     - Name: `wellbeing-frontend`
     - Root Directory: `frontend`
     - Build Command: `npm install && npm run build`
     - Publish Directory: `dist`
   - Add environment variables

---

### Option 3: AWS (Advanced)

#### Architecture

- **Frontend**: S3 + CloudFront
- **Backend**: EC2 or ECS (Fargate)
- **Database**: RDS PostgreSQL
- **File Storage**: S3
- **Load Balancer**: Application Load Balancer

#### Steps

1. **Create RDS Database**
   ```bash
   # Create PostgreSQL instance
   aws rds create-db-instance \
       --db-instance-identifier wellbeing-db \
       --db-instance-class db.t3.micro \
       --engine postgres \
       --master-username admin \
       --master-user-password <password> \
       --allocated-storage 20
   ```

2. **Deploy Backend to EC2**
   ```bash
   # SSH into EC2 instance
   ssh -i your-key.pem ec2-user@your-instance

   # Clone repository
   git clone <your-repo>
   cd wellbeing-copilot/backend

   # Setup and start
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

   # Use systemd or supervisor to run as service
   ```

3. **Deploy Frontend to S3**
   ```bash
   # Build frontend
   cd frontend
   npm install
   npm run build

   # Upload to S3
   aws s3 sync dist/ s3://your-bucket-name/

   # Configure CloudFront distribution
   ```

---

## Environment Variables

### Required Backend Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Security
SECRET_KEY=<generate with: openssl rand -hex 32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=https://your-frontend-domain.com,https://www.your-domain.com
```

### Optional Backend Variables

```bash
# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Google Calendar
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REDIRECT_URI=https://your-backend.com/api/v1/calendar/callback

# Redis (for caching and better rate limiting)
REDIS_URL=redis://localhost:6379/0
```

### Required Frontend Variables

```bash
VITE_API_BASE_URL=https://your-backend-api.com/api/v1
```

---

## Database Setup

### PostgreSQL Production Setup

1. **Create Database**
   ```sql
   CREATE DATABASE wellbeing;
   CREATE USER wellbeing_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE wellbeing TO wellbeing_user;
   ```

2. **Connection String**
   ```
   postgresql://wellbeing_user:secure_password@host:5432/wellbeing
   ```

3. **Backup**
   ```bash
   # Backup
   pg_dump -U wellbeing_user wellbeing > backup.sql

   # Restore
   psql -U wellbeing_user wellbeing < backup.sql
   ```

---

## Security Checklist

### Pre-Deployment

- [ ] Change `SECRET_KEY` to a secure random value
- [ ] Use HTTPS in production (SSL/TLS certificates)
- [ ] Set strong database passwords
- [ ] Configure CORS to only allow your domains
- [ ] Enable rate limiting (already implemented)
- [ ] Review and update security headers
- [ ] Disable debug mode in production
- [ ] Use environment variables for secrets (never commit to git)
- [ ] Set up database backups
- [ ] Configure firewall rules

### Post-Deployment

- [ ] Set up monitoring and alerts
- [ ] Configure logging (ERROR level in production)
- [ ] Enable automated backups
- [ ] Test disaster recovery procedures
- [ ] Set up SSL certificate auto-renewal
- [ ] Configure DDoS protection (Cloudflare, AWS Shield)
- [ ] Implement intrusion detection
- [ ] Regular security audits

---

## Monitoring & Logs

### Application Logs

**Backend logs location:**
- Development: Console output
- Production: `/var/log/wellbeing/` or check your hosting platform

**View logs:**
```bash
# Docker
docker-compose logs -f backend

# Railway
railway logs --service backend

# Render
Check dashboard logs section
```

### Health Checks

```bash
# Backend health
curl https://your-backend.com/health

# Expected response
{"status": "healthy"}
```

### Performance Monitoring

**Tools to consider:**
- **Sentry** - Error tracking
- **New Relic** - Application performance
- **DataDog** - Full stack monitoring
- **CloudWatch** (AWS) - AWS monitoring
- **Google Analytics** - Frontend analytics

---

## Troubleshooting

### Common Issues

**1. Database Connection Failed**
```
Solution: Check DATABASE_URL format and credentials
Verify database is running: docker-compose ps
```

**2. CORS Errors**
```
Solution: Add frontend URL to CORS_ORIGINS in backend .env
Format: https://your-domain.com (no trailing slash)
```

**3. 500 Internal Server Error**
```
Solution: Check backend logs
docker-compose logs backend
Look for Python exceptions
```

**4. Frontend Can't Reach Backend**
```
Solution: Check VITE_API_BASE_URL in frontend .env
Ensure backend is running and accessible
Check network/firewall rules
```

---

## Production Optimization

### Backend

1. **Use Gunicorn/Uvicorn Workers**
   ```bash
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. **Enable Database Connection Pooling**
   ```python
   # In database.py
   engine = create_engine(
       SQLALCHEMY_DATABASE_URL,
       pool_size=5,
       max_overflow=10
   )
   ```

3. **Add Redis for Caching**
   ```python
   # Install: pip install redis
   # Use for rate limiting and caching frequent queries
   ```

### Frontend

1. **Enable Gzip Compression**
   - Nginx: Already enabled in provided config
   - Vercel: Automatic

2. **Optimize Images**
   - Use WebP format
   - Implement lazy loading
   - Use CDN for static assets

3. **Code Splitting**
   - Vite does this automatically
   - Ensure large dependencies are lazy-loaded

---

## Backup Strategy

### Automated Backups

**Database (PostgreSQL):**
```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="wellbeing_backup_$DATE.sql.gz"

pg_dump -U wellbeing wellbeing | gzip > "$BACKUP_DIR/$FILENAME"

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

**Schedule with cron:**
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup-script.sh
```

---

## Scaling Considerations

### Horizontal Scaling

1. **Multiple Backend Instances**
   - Use load balancer (AWS ALB, Nginx)
   - Ensure session management is stateless (JWT)
   - Use Redis for shared cache

2. **Database Read Replicas**
   - For read-heavy operations
   - Configure read/write split

3. **CDN for Frontend**
   - CloudFront, Cloudflare, or Fastly
   - Reduces latency globally

### Vertical Scaling

- Upgrade server instance size
- Increase database resources
- Add more RAM/CPU as needed

---

## Cost Estimation

### Free Tier (Suitable for Development/Testing)

- **Frontend**: Vercel (Free) or Netlify (Free)
- **Backend**: Railway (Free tier) or Render (Free tier)
- **Database**: Railway PostgreSQL (Free) or Render PostgreSQL (Free)
- **Total**: $0/month (with limitations)

### Production (Paid)

- **Frontend**: Vercel Pro ($20/month) or Cloudflare Pages (Free-$20)
- **Backend**: Railway ($5-20/month) or AWS EC2 ($10-50/month)
- **Database**: Railway ($5-20/month) or AWS RDS ($15-100/month)
- **Domain**: $10-15/year
- **Total**: ~$30-100/month

---

## Support & Resources

- **Documentation**: Check STARTUP_GUIDE.md and README.md
- **API Docs**: `/docs` endpoint when server is running
- **GitHub Issues**: Report bugs and feature requests
- **Discord/Slack**: (Set up your community channel)

---

## Next Steps After Deployment

1. ✅ Verify all endpoints are working
2. ✅ Test authentication flow
3. ✅ Seed sample data for testing
4. ✅ Set up monitoring and alerts
5. ✅ Configure automated backups
6. ✅ Add your domain and SSL certificate
7. ✅ Test from different devices/browsers
8. ✅ Set up CI/CD pipeline (GitHub Actions)
9. ✅ Document any custom configurations
10. ✅ Celebrate! 🎉

---

*Last Updated: January 2025*
