# Deployment Guide - Faculty Evaluation System

## 📋 Prerequisites

- Docker 24.0+ and Docker Compose V2
- At least 2GB RAM available
- At least 5GB disk space
- Ports 3000, 5000, 27017, 6379 available (or configure custom ports)

---

## 🚀 Quick Start (Development)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd final-year-project
```

### 2. Create Environment File

```bash
cp .env.example .env
# Edit .env and fill in your values (especially JWT_SECRET and email settings)
```

### 3. Start All Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

### 5. Create Admin User

```bash
# Execute inside backend container
docker-compose exec backend npm run create-admin

# Or manually:
docker-compose exec backend node dist/scripts/create-admin.js
```

---

## 🏭 Production Deployment

### 1. Prepare Environment

```bash
# Copy production env
cp .env.example .env.production

# Edit and set production values:
# - Strong JWT_SECRET (at least 64 characters)
# - Production MongoDB password
# - Production Redis password
# - Real email credentials
# - Production URLs
nano .env.production
```

### 2. Generate Strong Secrets

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use openssl
openssl rand -hex 64
```

### 3. Build and Start

```bash
# Load production environment
export $(cat .env.production | xargs)

# Build images
docker-compose build

# Start with nginx reverse proxy
docker-compose --profile production up -d

# Seed configuration
docker-compose exec backend npm run seed:config
```

### 4. SSL/TLS Setup (Nginx)

Create `nginx/conf.d/default.conf`:

```nginx
# HTTP - redirect to HTTPS
server {
    listen 80;
    server_name yourdomain.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }

    # Upload files
    location /uploads/ {
        proxy_pass http://backend:5000/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### 5. Get SSL Certificate (Let's Encrypt)

```bash
# Install certbot
apt-get install certbot

# Get certificate
certbot certonly --webroot -w /var/www/certbot \
  -d yourdomain.com \
  --email your@email.com \
  --agree-tos

# Copy certificates
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/

# Restart nginx
docker-compose restart nginx
```

---

## 🔧 Rate Limiting Options

### Option 1: Application-Level (No Redis)

Install express-rate-limit:

```bash
cd backend
npm install express-rate-limit
```

In `backend/src/app.ts`:

```typescript
import rateLimit from 'express-rate-limit'

// Basic rate limiting (uses memory)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Apply to all routes
app.use('/api/', limiter)

// Stricter limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
})

app.use('/api/auth/login', authLimiter)
app.use('/api/auth/forgot-password', authLimiter)
```

**Pros**:
- Simple, no extra infrastructure
- Works out of the box

**Cons**:
- Memory-based, resets on restart
- Doesn't work across multiple backend instances
- No persistent tracking

### Option 2: Redis-Based (Recommended for Production)

Install rate-limit-redis:

```bash
cd backend
npm install rate-limit-redis redis
```

In `backend/src/app.ts`:

```typescript
import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import Redis from 'redis'

// Create Redis client
const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD,
})

redisClient.connect().catch(console.error)

// Redis-based rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:',
  }),
  message: 'Too many requests, please try again later.',
})

app.use('/api/', limiter)

// Auth routes - stricter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:',
  }),
  skipSuccessfulRequests: true,
})

app.use('/api/auth/login', authLimiter)
app.use('/api/auth/forgot-password', authLimiter)
```

**Pros**:
- Persistent across restarts
- Works with multiple backend instances
- Can track long-term abuse patterns

**Cons**:
- Requires Redis infrastructure
- Slightly more complex

### Option 3: Nginx Rate Limiting (Best Performance)

Add to `nginx/nginx.conf`:

```nginx
http {
    # Define rate limiting zones
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=1r/s;

    # Connection limits
    limit_conn_zone $binary_remote_addr zone=addr:10m;

    server {
        # General site
        location / {
            limit_req zone=general burst=20;
            limit_conn addr 10;
            proxy_pass http://frontend:3000;
        }

        # API endpoints
        location /api/ {
            limit_req zone=api burst=10 nodelay;
            limit_conn addr 5;
            proxy_pass http://backend:5000/api/;
        }

        # Auth endpoints - strictest
        location ~* ^/api/auth/(login|register|forgot-password) {
            limit_req zone=auth burst=3 nodelay;
            limit_conn addr 2;
            proxy_pass http://backend:5000;
        }
    }
}
```

**Pros**:
- Highest performance
- Blocks bad requests before hitting backend
- Battle-tested

**Cons**:
- Requires nginx
- Less flexible than application-level

---

## 📊 Monitoring & Maintenance

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Check Health

```bash
# Health check all services
docker-compose ps

# Backend health
curl http://localhost:5000/api/health

# Frontend health
curl http://localhost:3000
```

### Backup Database

```bash
# Backup MongoDB
docker-compose exec mongodb mongodump \
  --username admin \
  --password yourpassword \
  --authenticationDatabase admin \
  --out /data/backup

# Copy backup to host
docker cp faculty-eval-mongodb:/data/backup ./backups/$(date +%Y%m%d)

# Restore from backup
docker-compose exec mongodb mongorestore \
  --username admin \
  --password yourpassword \
  --authenticationDatabase admin \
  /data/backup
```

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Run migrations if needed
docker-compose exec backend npm run seed:config
```

---

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT secret (64+ characters)
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Use httpOnly cookies for tokens
- [ ] Enable helmet security headers
- [ ] Set up MongoDB authentication
- [ ] Use Redis password
- [ ] Regular backups scheduled
- [ ] Monitor logs for suspicious activity
- [ ] Keep Docker images updated
- [ ] Disable unnecessary ports
- [ ] Use non-root users in containers

---

## 🐳 Docker Commands Cheat Sheet

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# View logs
docker-compose logs -f [service]

# Execute command in container
docker-compose exec backend bash

# Scale services (multiple instances)
docker-compose up -d --scale backend=3

# Check resource usage
docker stats

# Prune unused data
docker system prune -a
```

---

## 🎯 Next Steps

1. **Security Hardening**: Implement all items from security checklist
2. **Monitoring**: Add Prometheus + Grafana for metrics
3. **Logging**: Set up ELK stack or similar
4. **CI/CD**: Automate deployment with GitHub Actions
5. **Backups**: Schedule automated database backups
6. **Scaling**: Load balance across multiple backend instances
7. **CDN**: Use CDN for static assets
8. **Performance**: Add Redis caching layer

---

## 📞 Support

For deployment issues:
1. Check logs: `docker-compose logs`
2. Verify environment variables: `docker-compose config`
3. Check health endpoints
4. Review this guide
5. Contact development team
