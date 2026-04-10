# Notes App

A full-stack notes application with a FastAPI backend, React frontend, and PostgreSQL database. Fully containerized and deployed to AWS via GitHub Actions.

**Tech stack:** FastAPI (Python) | React + Vite | PostgreSQL | Docker | Nginx | GitHub Actions | AWS EC2 + Aurora RDS

---

## How to Run Locally

### Prerequisites

- Docker & Docker Compose

### Start the full stack

```bash
docker compose up
```

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost              |
| API docs | http://localhost:8000/docs    |
| Database | localhost:5432 (user: notes)  |

### Frontend dev mode (with HMR)

```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```

### Run tests

```bash
# Backend
cd backend && pip install -r requirements.txt && pytest tests/

# Frontend
cd frontend && npm install && npm test
```

---

## How It Is Built and Deployed

### Infrastructure

**Local (Docker Compose)**

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│  Frontend   │     │  Backend    │     │  PostgreSQL  │
│  (Nginx)    │────▶│  (FastAPI)  │────▶│  (pg 16)     │
│  :80        │     │  :8000      │     │  :5432       │
└─────────────┘     └─────────────┘     └──────────────┘
```

Nginx proxies `/notes` requests to the backend so the frontend and API are served from the same origin.

**Production (AWS)**

```
┌─────────────────────────────────────┐     ┌──────────────────┐
│              EC2 Instance           │     │  Aurora RDS      │
│  ┌───────────┐   ┌───────────┐     │     │  PostgreSQL 17   │
│  │ Frontend  │──▶│ Backend   │─────│────▶│  :5432           │
│  │ :80       │   │ :8000     │     │     └──────────────────┘
│  └───────────┘   └───────────┘     │
└─────────────────────────────────────┘
```

The `DATABASE_URL` environment variable switches between local Postgres and Aurora RDS with no code changes.

### CI/CD Pipelines

**On Pull Request (`ci.yml`)**

Runs automatically on PRs touching `backend/` or `frontend/`:

- **backend-lint** — Ruff check + format
- **backend-test** — pytest
- **frontend-lint** — ESLint
- **frontend-test** — Vitest
- **frontend-build** — Vite production build

**On Merge to main (`backend.yml` / `frontend.yml`)**

```
lint → test → Docker build & push to DockerHub → SSH deploy to EC2
```

Each service has its own pipeline, path-filtered so a backend change does not trigger a frontend deploy and vice versa. Images are tagged `latest` and pulled directly on the EC2 instance via SSH.

### Required GitHub Secrets

| Secret               | Description                          |
|----------------------|--------------------------------------|
| `DOCKERHUB_USERNAME` | DockerHub account username           |
| `DOCKERHUB_TOKEN`    | DockerHub access token               |
| `EC2_HOST`           | EC2 public IP or hostname            |
| `EC2_SSH_KEY`        | SSH private key for EC2 access       |
| `DATABASE_URL`       | PostgreSQL connection string for RDS |

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **SQLAlchemy ORM** | Database-agnostic -- swap between SQLite (tests), local Postgres, and Aurora RDS with a single env var |
| **Aurora Serverless v2** | Scales to 0 ACU when idle, near-zero cost for low-traffic apps |
| **Nginx reverse proxy** | Serves frontend and proxies API requests on the same origin, eliminating CORS in production |
| **Two separate CI pipelines** | Backend and frontend deploy independently -- no unnecessary deploys, faster feedback loops |
| **Vitest** | Native Vite integration, shares config, zero setup compared to Jest |
| **No react-router** | A view-state string is right-sized for this scope -- no over-engineering |

---

## Known Limitations and Possible Improvements

| Limitation | Improvement |
|------------|-------------|
| Single EC2 instance, no load balancer | Add an ALB + Auto Scaling Group for horizontal scaling |
| No HTTPS | Add Let's Encrypt via Certbot on the EC2 instance |
| `latest` Docker tag only | Tag images with the Git SHA for proper rollback capability |
| No request authentication | Add JWT-based auth or API key middleware |
| CORS open in development | Restrict `allow_origins` to the production domain |
| No structured logging | Add a logging middleware that emits JSON logs for CloudWatch ingestion |
| No health check in CI | Add a smoke test step after deploy to verify the container is responding |
| Manual DB migrations on deploy | Wire Alembic `upgrade head` into the deploy step automatically |