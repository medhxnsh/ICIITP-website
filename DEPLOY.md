# IC IITP — Deployment Guide

## Requirements
- Linux server (Ubuntu 20.04+ recommended)
- Docker + docker-compose installed
- Ports 80 and 443 open
- Minimum: 2 GB RAM, 20 GB disk

## First-time Setup

### 1. Clone / copy files to server
```bash
git clone <repo-url> /opt/iciitp
cd /opt/iciitp
```

### 2. Create environment file
```bash
cp .env.example .env
nano .env
```
Fill in all values — especially `DB_PASSWORD`, `JWT_SECRET`, and `ADMIN_PASSWORD`.
Generate a strong JWT_SECRET: `openssl rand -base64 32`

### 3. Start everything
```bash
docker compose up -d --build
```

First run takes ~3 minutes (builds images, initialises DB, seeds admin user).

### 4. Verify
```bash
docker compose ps          # all 4 services should show "running"
curl http://localhost/api/v1/auth/me   # should return 401 (not 502)
```

### 5. SSL (HTTPS)
Place your certificate files in `./data/ssl/`:
- `./data/ssl/cert.pem`
- `./data/ssl/key.pem`

Then update `nginx/nginx.conf` to add an HTTPS server block and redirect port 80.
For Let's Encrypt: `certbot certonly --standalone -d iciitp.ac.in`

---

## Routine Operations

### Start / stop
```bash
docker compose up -d      # start
docker compose down       # stop (data is preserved)
```

### Update to new version
```bash
git pull
docker compose up -d --build
```
Data volumes (`./data/postgres`, `./data/uploads`) are never touched by updates.

### View logs
```bash
docker compose logs -f backend     # Java API logs
docker compose logs -f frontend    # Next.js logs
docker compose logs -f nginx       # access logs
```

### Restart a single service
```bash
docker compose restart backend
```

---

## Backups (CRITICAL — do this regularly)

Two things must be backed up:

**1. Database**
```bash
docker compose exec db pg_dump -U iciitp iciitp > backup-$(date +%Y%m%d).sql
```

**2. Uploaded files**
```bash
tar -czf uploads-$(date +%Y%m%d).tar.gz ./data/uploads/
```

Recommended: set up a cron job to run both daily and copy to an external location.

```bash
# Example cron (daily at 2am)
0 2 * * * cd /opt/iciitp && docker compose exec -T db pg_dump -U iciitp iciitp > /backups/db-$(date +\%Y\%m\%d).sql
0 2 * * * tar -czf /backups/uploads-$(date +\%Y\%m\%d).tar.gz /opt/iciitp/data/uploads/
```

---

## Restore from Backup

```bash
# Restore database
docker compose exec -T db psql -U iciitp iciitp < backup-20260101.sql

# Restore uploads
tar -xzf uploads-20260101.tar.gz -C /opt/iciitp/
```

---

## Admin Panel
Visit: `https://iciitp.ac.in/admin`
Default login: the `ADMIN_EMAIL` and `ADMIN_PASSWORD` set in `.env`
**Change the password immediately after first login.**
