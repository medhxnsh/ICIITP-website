# IC IITP Website — Developer Setup Guide

Complete guide for running locally, understanding the config, and deploying with Docker.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Prerequisites](#2-prerequisites)
3. [First-Time Setup](#3-first-time-setup)
4. [Config Files — Every Variable Explained](#4-config-files--every-variable-explained)
5. [Running Locally](#5-running-locally)
6. [Troubleshooting Ports & Common Errors](#6-troubleshooting-ports--common-errors)
7. [Project Structure](#7-project-structure)
8. [Hosting with Docker](#8-hosting-with-docker)
9. [SSL / HTTPS Setup](#9-ssl--https-setup)
10. [Useful Commands](#10-useful-commands)

---

## 1. Project Overview

This is a full-stack web application with three parts:

| Layer | Technology | Port |
|-------|-----------|------|
| Frontend | Next.js 16 (React, Tailwind CSS) | 3000 |
| Backend API | Spring Boot 3 (Java 21) | 8080 |
| Database | PostgreSQL 16 | 5432 |

In production, an **Nginx** reverse proxy sits in front and routes:
- `/api/v1/*` → Spring Boot backend
- `/uploads/*` → static file serving (direct)
- everything else → Next.js frontend

---

## 2. Prerequisites

### For local development (`npm run dev:all`)

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18 or higher | https://nodejs.org |
| Java | 21 | `brew install openjdk@21` (Mac) or https://adoptium.net |
| Maven | 3.9+ | comes bundled with Java / `brew install maven` |
| PostgreSQL | 14 or higher | `brew install postgresql@14` (Mac) or https://postgresql.org |

**Check your versions:**
```bash
node -v        # should be v18+
java -version  # should be 21
mvn -v         # should be 3.9+
psql --version # should be 14+
```

### For Docker deployment

| Tool | Version |
|------|---------|
| Docker | 24+ |
| Docker Compose | v2 (bundled with Docker Desktop) |

Install Docker Desktop: https://www.docker.com/products/docker-desktop

---

## 3. First-Time Setup

### Step 1 — Install frontend dependencies

```bash
cd /path/to/iciitp-website
npm install
```

### Step 2 — Set up the config file

The single config file that controls everything is `config/.env`.

It is already provided in this repo with working credentials.
If you need to change anything (e.g. your own DB password), edit it there — **one place, everything updates**.

See [Section 4](#4-config-files--every-variable-explained) for what every variable does.

### Step 2b — Create the root `.env` symlink (required for Docker)

Docker Compose automatically reads a `.env` file at the project root for variable substitution. Run this once after cloning or unzipping:

```bash
ln -sf config/.env .env
```

> **Windows users:** symlinks require Developer Mode or running the terminal as Administrator. Alternatively, just copy the file: `copy config\.env .env` — but remember to re-copy it if you change `config/.env`.

### Step 3 — Set up PostgreSQL (local dev only)

The backend script (`scripts/backend.sh`) automatically:
- Starts PostgreSQL if it is not running
- Creates the `iciitp` database if it does not exist
- Creates the `iciitp` user with the password from `config/.env`

You do **not** need to manually create the database.

The Spring Boot JPA is set to `ddl-auto: update` which means it **auto-creates and updates all tables** on startup. No migration scripts to run.

### Step 4 — Run it

```bash
npm run dev:all
```

This starts both backend and frontend together. See [Section 5](#5-running-locally) for details.

---

## 4. Config Files — Every Variable Explained

### Main config: `config/.env`

This is the **single source of truth** for all configuration. Both the frontend (Next.js) and backend (Spring Boot) read from here. Docker Compose also uses this file via `env_file`.

```bash
# ── Database ──────────────────────────────────────────────────────────────────
DB_NAME=iciitp           # PostgreSQL database name
DB_USER=iciitp           # PostgreSQL username
DB_PASSWORD=...          # PostgreSQL password — change this for your server

# ── JWT Secret ───────────────────────────────────────────────────────────────
JWT_SECRET=...           # Long random string used to sign login tokens.
                         # MUST be at least 32 characters.
                         # Change this for production — anyone with this value
                         # can forge admin sessions.

# ── Admin Account ─────────────────────────────────────────────────────────────
ADMIN_EMAIL=admin@iciitp.ac.in   # Email address for the admin login
ADMIN_PASSWORD=...               # Admin panel password
                                 # The backend seeds this account on first start.
                                 # Change it here and restart to update it.

# ── CORS ──────────────────────────────────────────────────────────────────────
CORS_ORIGINS=https://iciitp.ac.in   # Comma-separated list of allowed frontend origins.
                                    # For local dev: http://localhost:3000
                                    # For production: https://yourdomain.com

# ── API URL ───────────────────────────────────────────────────────────────────
API_URL=http://localhost:8080/api/v1   # Where the frontend calls the backend.
                                       # Local dev: http://localhost:8080/api/v1
                                       # Docker: automatically overridden to
                                       #         http://backend:8080/api/v1

# ── SMTP (Email) ──────────────────────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com   # Mail server host
SMTP_PORT=587              # Mail server port (587 = STARTTLS, 465 = SSL)
SMTP_USER=...              # Email account username
SMTP_PASS=...              # Email account password / app password
                           # For Gmail: use an App Password, not your real password
                           # (Google Account → Security → App Passwords)
                           # Leave SMTP_USER blank to disable email entirely.

# ── Notification Emails ───────────────────────────────────────────────────────
RECOVERY_EMAIL=...   # OTP / password reset emails go here
NOTIFY_EMAIL=...     # New form submission notifications go here

# ── Cookie security ───────────────────────────────────────────────────────────
COOKIE_SECURE=false   # false = cookies work over HTTP (local Docker, dev).
                      # true  = cookies require HTTPS (production with SSL).
                      # Wrong value = admin logs out on every page in Docker.

# ── Emergency Reset ───────────────────────────────────────────────────────────
ADMIN_FORCE_RESET=false   # Set to true to force-reset admin password on next restart.
                          # Set back to false after recovering access.
```

---

### Backend config: `backend/src/main/resources/application.yml`

You **do not normally edit this file**. It reads all values from environment variables (which come from `config/.env`). The defaults shown are fallbacks only.

Key settings and what they do:

| Setting | What it does |
|---------|-------------|
| `ddl-auto: update` | Hibernate auto-creates/updates DB tables on startup. Safe for dev. For production, consider switching to `validate` once schema is stable. |
| `max-file-size: 50MB` | Maximum upload size for files (brochures, images, etc.) |
| `access-expiry-ms: 900000` | JWT access token lives 15 minutes (override via env if needed) |
| `refresh-expiry-ms: 604800000` | JWT refresh token lives 7 days |
| `upload.dir: ../data/uploads` | Where uploaded files are stored on disk |

---

### Frontend config: loaded from `config/.env` at runtime

The `npm run dev` script does `set -a && . config/.env && set +a` which exports all variables to the Node process before Next.js starts. No separate `.env.local` or `.env.production` needed.

---

### Nginx config: `nginx/nginx.conf`

Only relevant for Docker/production deployment.

Routing rules:
- `/api/v1/*` → proxied to Spring Boot on port 8080
- `/uploads/*` → served directly from `data/uploads/` folder (fast static serving)
- everything else → proxied to Next.js on port 3000

To change the domain name, update `server_name` in this file (currently `_` = accept all).

---

## 5. Running Locally

### Start everything (recommended)

```bash
npm run dev:all
```

Starts both backend and backend together. `Ctrl+C` stops both cleanly.

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Admin panel: http://localhost:3000/admin

Login with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `config/.env`.

---

### Start frontend only

```bash
npm run dev
```

Useful if you already have the backend running separately.

---

### Start backend only

```bash
npm run backend
# or directly:
bash scripts/backend.sh
```

---

### First start — what happens automatically

On the very first `npm run dev:all`:

1. PostgreSQL starts (if not already running)
2. `iciitp` database and user are created automatically
3. Spring Boot starts and Hibernate creates all tables (`ddl-auto: update`)
4. The admin account (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) is seeded into the database
5. Next.js starts and connects to the backend

All subsequent starts are faster — setup is skipped once already done.

---

## 6. Troubleshooting Ports & Common Errors

### Port 3000 already in use

```bash
# Find what is using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

Or change the Next.js port:
```bash
npm run dev -- --port 3001
```

---

### Port 8080 already in use

```bash
# Find what is using port 8080
lsof -i :8080

# Kill it
kill -9 <PID>
```

Or change the backend port in `config/.env`:
```bash
SERVER_PORT=8081
```
Then update `API_URL` in the same file to match:
```bash
API_URL=http://localhost:8081/api/v1
```

---

### Port 5432 already in use (PostgreSQL conflict)

You may have another PostgreSQL instance running.

```bash
# Check which PostgreSQL is running
brew services list | grep postgresql

# Stop the conflicting one
brew services stop postgresql@14

# Or stop all
brew services stop --all
```

---

### `Cannot find module '.../node_modules/.bin/next'`

Node modules are not installed. Run:
```bash
npm install
```

---

### Backend fails to start — `Connection refused` to PostgreSQL

PostgreSQL is not running. Start it:
```bash
brew services start postgresql@14
```

Or just run `npm run dev:all` — it starts PostgreSQL automatically.

---

### Backend fails — `password authentication failed for user "iciitp"`

The DB user password doesn't match `config/.env`. Fix it:
```bash
psql -U $(whoami) postgres
ALTER USER iciitp WITH PASSWORD 'your_password_from_env';
\q
```

---

### Admin login not working

The admin account is seeded on **first start only**. If you changed `ADMIN_PASSWORD` in `config/.env` after the first run, force a reset:

1. Set `ADMIN_FORCE_RESET=true` in `config/.env`
2. Restart the backend
3. Set it back to `false`

---

### Docker — admin logs out on every page navigation

**Cause:** The session cookie is set with `Secure: true` which means the browser only sends it over HTTPS. Docker runs on `http://localhost`, so the browser silently drops the cookie after login.

**Fix:** Ensure `config/.env` has:
```bash
COOKIE_SECURE=false
```
Then rebuild:
```bash
docker compose up --build -d
```

When deploying to a real server with SSL, set `COOKIE_SECURE=true`.

---

### Java version errors

The backend requires Java 21. Check:
```bash
java -version
```

If you have multiple Java versions, set `JAVA_HOME` in your shell:
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
```

Or the script already handles this on Mac with Homebrew (`/opt/homebrew/opt/openjdk@21`).

---

### `CORS` errors in browser console

The backend is rejecting requests from the frontend origin. Update `CORS_ORIGINS` in `config/.env`:
```bash
CORS_ORIGINS=http://localhost:3000
```
Then restart the backend.

---

### Docker build fails — `npm ci` lock file out of sync

```
npm error `npm ci` can only install packages when your package.json and
npm error package-lock.json or npm-shrinkwrap.json are in sync.
npm error Missing: @swc/helpers@0.5.23 from lock file
```

The `package-lock.json` is out of sync with `package.json`. Regenerate it then rebuild:

```bash
npm install
docker compose --env-file config/.env up --build
```

`npm install` updates the lock file to match `package.json` exactly. After that `npm ci` inside the Docker build will work.

---

## 7. Project Structure

```
iciitp-website/
│
├── config/
│   └── .env                   ← ALL configuration lives here (secrets, URLs, DB creds)
│
├── app/                       ← Next.js App Router pages
│   ├── [locale]/              ← Public-facing pages (home, about, events, etc.)
│   └── admin/                 ← Admin panel (protected, /admin/*)
│
├── components/                ← Reusable React components
├── lib/
│   ├── cms/                   ← Frontend API clients (talks to Spring Boot)
│   ├── auth.ts                ← Session / JWT handling on the frontend
│   └── ...
│
├── backend/                   ← Spring Boot Java API
│   └── src/main/
│       ├── java/com/iciitp/api/
│       │   ├── features/      ← Controllers, Services, Repos per feature
│       │   └── shared/        ← Auth, security, config, exceptions
│       └── resources/
│           └── application.yml ← Spring Boot config (reads from env vars)
│
├── data/
│   ├── uploads/               ← Uploaded files stored here (PDFs, images)
│   └── postgres/              ← PostgreSQL data volume (Docker only)
│
├── nginx/
│   └── nginx.conf             ← Reverse proxy config (Docker/production only)
│
├── scripts/
│   ├── dev.sh                 ← Starts backend + frontend together
│   └── backend.sh             ← Starts PostgreSQL + Spring Boot
│
├── content/                   ← Static JSON content (programs, team, labs)
│                                 These are read-only — edit directly in files
│
├── docker-compose.yml         ← Full production stack (db + backend + frontend + nginx)
├── Dockerfile                 ← Next.js frontend Docker image
└── backend/Dockerfile         ← Spring Boot backend Docker image
```

---

## 8. Hosting with Docker

Docker Compose runs the entire stack — database, backend, frontend, and Nginx — in containers. No need to install Java, Node, or PostgreSQL on the server.

### Requirements on the server

- Docker Engine 24+
- Docker Compose v2
- At least 2GB RAM, 10GB disk

### Step 1 — Copy the project to the server

```bash
scp -r ./iciitp-website user@your-server:/opt/iciitp
# or use rsync:
rsync -avz --exclude='.git' --exclude='node_modules' ./iciitp-website/ user@your-server:/opt/iciitp/
```

### Step 2 — Update `config/.env` for production

Edit `config/.env` on the server:

```bash
# Change these for production:
DB_PASSWORD=<strong_random_password>
JWT_SECRET=<long_random_string_min_64_chars>
ADMIN_PASSWORD=<strong_admin_password>
CORS_ORIGINS=https://yourdomain.com
# API_URL is overridden automatically by docker-compose.yml — leave as is
```

### Step 3 — Build and start

```bash
cd /opt/iciitp
docker compose --env-file config/.env up --build -d
```

This builds all images, starts all containers, and runs in the background.

First build takes 3–5 minutes. Subsequent starts are fast.

### Step 4 — Restore the database (first time only)

A database dump is included at `data/db-dump.sql`. This contains all the real content — news, events, startups, notifications, media records, and uploaded files.

**Restore it once after the first build:**

```bash
docker compose --env-file config/.env exec -T db psql -U iciitp -d iciitp < data/db-dump.sql
```

Then restart the backend to pick up the restored data:

```bash
docker compose --env-file config/.env restart backend
```

> **This only needs to be done once.** The data is stored in `data/postgres/` on disk and persists across all future restarts and rebuilds. It is only lost if you run `docker compose down -v` (which explicitly deletes the database volume).

#### If restoring from an older dump (pre-June 2026)

The `login_attempts` table was added after the initial dump. If the dump you are restoring was created before this, run these two statements manually after the restore:

```sql
-- Connect to the DB first:
-- docker compose --env-file config/.env exec db psql -U iciitp -d iciitp

CREATE TABLE IF NOT EXISTS login_attempts (
    id           VARCHAR(255) NOT NULL PRIMARY KEY,
    ip           VARCHAR(255) NOT NULL,
    attempted_at TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON login_attempts (ip, attempted_at);
```

Then restart the backend. If you skip this, the backend will fail to start (schema validation will reject the missing table).

### Step 6 — Check it is running

```bash
docker compose --env-file config/.env ps           # all containers should show "running"
docker compose --env-file config/.env logs -f      # watch live logs
docker compose --env-file config/.env logs backend # backend logs only
docker compose --env-file config/.env logs frontend # frontend logs only
```

The site will be live on **port 80** (http://yourdomain.com).

---

### What persists across builds

> **All content added through the admin panel — news, media, logos, startups, events, notifications, uploaded files — persists permanently across every `docker compose up --build`.**

Data lives on your actual disk in two folders:

| Folder | What's stored | Persists across `--build`? |
|--------|--------------|---------------------------|
| `data/postgres/` | Database — all CMS content, users, submissions | ✅ Yes |
| `data/uploads/` | Uploaded files — logos, PDFs, images | ✅ Yes |

`--build` only rebuilds the code (Next.js + Spring Boot). It never touches these folders.

**The only command that deletes data is `docker compose down -v`** — the `-v` flag explicitly removes the database volume. Never run this unless you want a full wipe.

---

### Stopping and restarting

```bash
docker compose --env-file config/.env down          # stop containers — data is FULLY preserved
docker compose --env-file config/.env restart       # restart all containers
docker compose --env-file config/.env restart backend  # restart backend only
```

> ⚠️ **Never run `docker compose down -v`** — the `-v` flag deletes the database volume and all its data permanently. There is no undo.

---

### Updating the code

```bash
git pull                          # pull latest code
docker compose --env-file config/.env up --build -d      # rebuild and restart (zero-downtime for DB)
```

---

### Ports used by Docker

| Container | Internal port | Exposed |
|-----------|--------------|---------|
| nginx | 80, 443 | ✅ public |
| frontend | 3000 | ❌ internal only |
| backend | 8080 | ❌ internal only |
| db | 5432 | ❌ internal only |

Only Nginx is exposed to the internet. Frontend and backend are internal to the Docker network.

### Port conflicts on the server

If port 80 is already in use (e.g. Apache or another Nginx):

```bash
# Find what is using port 80
sudo lsof -i :80
# Stop it (e.g. Apache)
sudo systemctl stop apache2
```

Or change the Nginx port in `docker-compose.yml`:
```yaml
ports:
  - "8000:80"   # expose on 8000 instead of 80
```

---

## 9. SSL / HTTPS Setup

### Option A — Certbot (Let's Encrypt, recommended)

1. Point your domain DNS to the server IP
2. Install certbot on the server:
```bash
sudo apt install certbot
```
3. Get a certificate:
```bash
sudo certbot certonly --standalone -d yourdomain.com
```
4. Copy certs to the project:
```bash
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./data/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem   ./data/ssl/key.pem
```
5. Update `nginx/nginx.conf` to add HTTPS:
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    ssl_certificate     /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of the config
}
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}
```
6. Restart nginx:
```bash
docker compose --env-file config/.env restart nginx
```

### Option B — Cloudflare (simplest)

Put the server behind Cloudflare. Set SSL mode to "Full". No cert setup needed on the server.

---

## 10. Useful Commands

### Database

```bash
# Connect to DB (local dev)
psql -U iciitp -d iciitp

# Connect to DB (Docker)
docker compose --env-file config/.env exec db psql -U iciitp -d iciitp

# Dump DB (backup)
docker compose --env-file config/.env exec db pg_dump -U iciitp iciitp > backup-$(date +%F).sql

# Restore DB from backup
docker compose --env-file config/.env exec -T db psql -U iciitp iciitp < backup.sql
```

### Logs

```bash
# All containers
docker compose --env-file config/.env logs -f

# One container
docker compose --env-file config/.env logs -f backend
docker compose --env-file config/.env logs -f frontend
docker compose --env-file config/.env logs -f nginx
```

### Rebuild a single service

```bash
docker compose --env-file config/.env up --build -d backend    # rebuild backend only
docker compose --env-file config/.env up --build -d frontend   # rebuild frontend only
```

### Clear everything and start fresh

> 🚨 **WARNING: This permanently deletes ALL database data** — news, media, startups, events, submissions, everything. There is no undo. If you need the data back you will have to restore from `data/db-dump.sql` and lose any changes made since.

```bash
docker compose --env-file config/.env down -v        # removes containers AND database volume
docker compose --env-file config/.env up --build -d  # fresh start
docker compose --env-file config/.env exec -T db psql -U iciitp -d iciitp < data/db-dump.sql  # restore data
```
