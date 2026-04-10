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
┌────────────────────────────────────┐     ┌──────────────────┐
│              EC2 Instance          │     │  Aurora RDS      │
│  ┌───────────┐   ┌───────────┐     │     │  PostgreSQL 17   │
│  │ Frontend  │──▶│ Backend   │─────│────▶│  :5432           │
│  │ :80       │   │ :8000     │     │     └──────────────────┘
│  └───────────┘   └───────────┘     │
└────────────────────────────────────┘
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

Each service has its own pipeline, path-filtered so a backend change does not trigger a frontend deploy and vice versa. The workflow files themselves (`.github/workflows/backend.yml`, `.github/workflows/frontend.yml`) are also included in the path filters so that pipeline fixes trigger a deploy without requiring a code change. Images are tagged `latest` and pulled directly on the EC2 instance via SSH.

**Docker Hub & authentication:** Docker Hub free accounts allow only one private repository. The backend image is private; the frontend image is public. The backend deploy step logs into Docker Hub over SSH before pulling the image.

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
| **Nginx runtime DNS resolution** | `proxy_pass` uses a variable + Docker's embedded DNS (`127.0.0.11`) so nginx resolves the backend at request time, not at startup -- avoids crash loops when backend isn't ready yet |
| **Docker user-defined network** | Containers run on a shared `notes-network` bridge so they can resolve each other by name via Docker DNS |
| **Two separate CI pipelines** | Backend and frontend deploy independently -- no unnecessary deploys, faster feedback loops |
| **Vitest** | Native Vite integration, shares config, zero setup compared to Jest |
| **No react-router** | A view-state string is right-sized for this scope -- no over-engineering |

---

## Branch Policy

| Branch | Purpose |
|--------|---------|
| `main` | Production branch — merges here trigger the CD pipelines and deploy to EC2 |
| `dev` | Integration branch for ongoing work before it is ready for production |
| `feat/*` | Feature branches (e.g., `feat/notes-app`) — one branch per feature |
| `ci/*` | CI/CD pipeline changes (e.g., `ci/init-pipelines`) |

**Workflow:** feature and CI branches are created from `dev` or `main`, developed locally, then opened as a Pull Request targeting `main`. The CI pipeline (`ci.yml`) runs lint and tests on every PR. On merge to `main`, the CD pipelines build, push, and deploy the affected service.

**Recommended protections (not yet configured):**

- Require at least one approving review before merge
- Require all CI checks to pass before merge
- Disallow force-push to `main`
- Enable branch deletion after merge to keep the repo clean

---

## Scaling Strategy

A step-by-step roadmap for scaling this application from a single EC2 instance to a production-grade setup.

### Step 1 — Containerized orchestration (ECS Fargate)

- Move from a single EC2 + Docker to **ECS Fargate** — no instances to manage, pay per task
- Define task definitions for frontend and backend as separate ECS services
- Use ECS Service auto-scaling with target tracking on CPU/memory or request count

### Step 2 — Load balancing & HTTPS

- Add an **Application Load Balancer (ALB)** with TLS termination via an ACM certificate
- ALB routes `/notes` to the backend target group, `/` to the frontend target group
- Health check endpoints: `/health` on backend, `/` on frontend
- This replaces Nginx's reverse proxy role — Nginx only serves static files

### Step 3 — Database scaling

- Aurora Serverless v2 already auto-scales ACUs — add **read replicas** for read-heavy workloads
- Enable **RDS Proxy** for connection pooling if many concurrent ECS tasks connect to the database

### Step 4 — Caching & CDN

- **CloudFront** in front of the ALB for static asset caching and global edge distribution
- Optional: **ElastiCache (Redis)** for API response caching if read volume grows

### Step 5 — Observability

- Structured JSON logging → **CloudWatch Logs**
- **CloudWatch Container Insights** for ECS metrics
- **X-Ray** tracing for request latency visibility
- CloudWatch Alarms on error rates, latency P99, and unhealthy targets

### Step 6 — Multi-AZ & disaster recovery

- ECS tasks spread across **multiple Availability Zones** (default with Fargate)
- Aurora already replicates across AZs — enable **multi-AZ cluster mode**
- S3 for database backups with cross-region replication if needed

---

## Known Limitations and Possible Improvements

| Limitation | Improvement |
|------------|-------------|
| RDS security group allows broad inbound access | Restrict inbound rules to the actual ECS/EC2 security group or private IP so only the application can reach the database |
| ECS/EC2 ports open too broadly | Lock down inbound rules to accept traffic only from the ALB's security group, not `0.0.0.0/0` |
| No Infrastructure as Code | Adopt **Terraform** for reproducibility, version-controlled infrastructure, drift detection, and auditability (skipped here due to time constraints) |
| Single EC2 instance, no load balancer | Add an ALB + Auto Scaling Group for horizontal scaling (see Scaling Strategy above) |
| No HTTPS | Add TLS termination at the ALB level with an ACM certificate, or Let's Encrypt via Certbot on EC2 |
| `latest` Docker tag only | Tag images with the Git SHA for proper rollback capability |
| No request authentication | Add JWT-based auth or API key middleware |
| CORS open in development | Restrict `allow_origins` to the production domain |
| No structured logging | Add a logging middleware that emits JSON logs for CloudWatch ingestion |
| No health check in CI | Add a smoke test step after deploy to verify the container is responding |
| Manual DB migrations on deploy | Wire **Alembic** `upgrade head` into the CI/CD pipeline as a dedicated step that runs before the new backend container starts |