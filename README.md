# SkillFlow360 (Microservices) — Full Project

## Services & ports
- eureka-service : 8761
- gateway-service : 8888
- auth-service : 8087
- competence-service : 8080
- activites-service : 8082
- evaluation-service : 8083
- graphe-service : 8084

## Eureka (Service Discovery)
All services are configured to register to Eureka.
- Eureka UI: http://localhost:8761

## Gateway
Gateway routes are configured with `lb://` (Eureka).
- Gateway base: http://localhost:8888

## Graphe-service (Admin analytics)
Endpoint:
- `GET /api/v1/graphes/dashboard`

It returns:
- totalStudents (from auth-service internal endpoint, fallback = distinct students in submissions)
- KPIs (evaluations, submissions, submitted vs in-progress)
- atRiskStudentsCount (avg score < 50)
- scoreDistribution
- topActivities
- studentsPerformance (avg score / submissions count / lastScore for each student)

### Required endpoint added in auth-service
- `GET /internal/users/students/count` -> `{ "count": N }`

### Required endpoint added in evaluation-service
- `GET /api/v1/submissions` (optionally `?evaluationId=...` or `?studentId=...`)

## Run
### Option A — Docker
```bash
docker compose up --build
```

### Option B — Local (Maven)
Start in this order:
1) eureka-service
2) auth-service, competence-service, activites-service, evaluation-service, graphe-service
3) gateway-service

## Notes
- Databases are still configured as in your original services (MySQL URLs, etc.).
  If you want, I can also provide a ready docker-compose for MySQL + environment variables.
"# SkillFlow" 
