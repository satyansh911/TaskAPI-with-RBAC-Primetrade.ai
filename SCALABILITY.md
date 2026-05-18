# Scalability Note — TaskAPI

## Current Architecture

The current implementation follows a **modular monolith** pattern with clear separation of concerns (config → middleware → modules → utils), making it straightforward to split into microservices later.

## Scaling Strategies

### 1. Horizontal Scaling (Immediate)

- The API is **stateless** (JWT-based auth, no server-side sessions) — it can be deployed behind a **load balancer** (AWS ALB, Nginx) with multiple instances immediately.
- **Neon's serverless PostgreSQL** auto-scales compute and handles connection pooling at the infrastructure level.

### 2. Database Layer

- **Read replicas** for read-heavy endpoints (`GET /tasks`, `GET /admin/users`)
- **Connection pooling** via PgBouncer or Neon's built-in pooler (already configured)
- **Indexes** on `tasks.user_id` and `users.email` for fast lookups
- Future: partition `tasks` by `user_id` for multi-tenant scale

### 3. Caching (Redis)

Candidate endpoints for caching:
```
GET /admin/users     → cache for 60s (low write frequency)
GET /tasks           → user-scoped cache with TTL=30s
```
Implementation: `node-redis` with cache middleware pattern.

### 4. Rate Limiting

Currently implemented with `express-rate-limit` (in-memory).  
For multi-instance deployments: switch to **Redis-backed rate limiting** (`rate-limit-redis`).

### 5. Microservices Evolution Path

```
Current Monolith:
  /auth, /tasks, /admin  →  Single Express app

Future Split:
  Auth Service      (handles JWT issuance + validation)
  Tasks Service     (CRUD, owned data)
  Admin Service     (reporting, user management)
  API Gateway       (Nginx / Kong — routing, auth, rate limiting)
```
Inter-service communication: REST (short-term) → gRPC or message queues (RabbitMQ/Kafka) for async ops.

### 6. Deployment

- **Containerization**: Dockerfile ready (add `docker build -t taskapi .`)
- **Orchestration**: Kubernetes for auto-scaling, rolling deployments
- **CI/CD**: GitHub Actions pipeline (test → build → deploy)
- **Cloud**: AWS ECS / Railway / Render for quick deployment

### 7. Observability

- **Logging**: Winston (structured JSON logs in production)
- **Metrics**: Prometheus + Grafana
- **Tracing**: OpenTelemetry for distributed tracing across services
- **Health checks**: `/health` endpoint ready for load balancer probes

## Estimated Capacity (Single Instance)

| Scenario | Throughput |
|---|---|
| Current (single Node.js + Neon) | ~1,000–2,000 req/min |
| With load balancer (3 instances) | ~5,000–6,000 req/min |
| With Redis cache + 5 instances | ~20,000+ req/min |
