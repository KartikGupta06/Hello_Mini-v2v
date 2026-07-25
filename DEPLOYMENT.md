# SafeRoute AI - Render Deployment Checklist

This document outlines the deployment configuration and verification steps for the SafeRoute AI FastAPI backend on Render.

## 1. Required Render Environment Variables
Add the following variables to your Render web service environment configuration:

### Database (PostgreSQL)
- `DATABASE_URL` (or provide `POSTGRES_SERVER`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` individually)

### Authentication / Security
- `JWT_SECRET`
- `JWT_ALGORITHM` (e.g., `HS256`)
- `ACCESS_TOKEN_EXPIRE_MINUTES` (e.g., `60`)

### External Services
- `ORS_API_KEY` (OpenRouteService)

### Notification Provider (Twilio SOS Integration)
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER` (Must be an E.164 formatted number, e.g., `+1234567890`)

## 2. Deployment Order
1. Ensure the Render PostgreSQL database is provisioned and running.
2. Link the PostgreSQL database to the FastAPI web service via the `DATABASE_URL` environment variable.
3. Add all remaining environment variables (JWT, ORS, Twilio).
4. Trigger a manual deploy on the Web Service.

## 3. Start Command
Configure the **Start Command** in the Render settings to:
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## 4. Alembic Migration Command
Once the deployment finishes and the web service is running, you must apply the database migrations to build the tables. Run this from the Render Web Shell (or via a release script):
```bash
alembic upgrade head
```

## 5. Post-Deployment Verification Checklist
- [ ] **Check Logs:** Ensure `uvicorn` starts successfully without `ImportError` or `ModuleNotFoundError`.
- [ ] **Check Migrations:** Ensure `alembic upgrade head` successfully applied the `SOSEvent` migration (and preceding ones) to the production database.
- [ ] **Health Check:** Ping the health route (`/api/v1/health`) and verify a 200 OK response.
- [ ] **Twilio Setup:** Perform a test SOS from the application and verify that the backend attempts SMS delivery without crashing.
