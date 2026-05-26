# 🏋️ GymBase - Contexto del Proyecto
> Última actualización: 2026-05-26 | Estado: **Fase 1 funcional — lista para ejecutar**

## 🛠️ Stack & Versiones
- Backend: FastAPI + SQLAlchemy 2.0 (async) + Alembic + Pydantic v2
- Frontend: React 19 + Vite 8 + Tailwind CSS v4 + DaisyUI 5 + @tanstack/react-query + Zustand
- DB: PostgreSQL 16 (asyncpg)
- Python: 3.12+ | Node: 20+

## 📁 Estructura Base
```
gymbase/
├── backend/app/{core,api/v1,models,schemas,services,repositories}
├── frontend/src/{components,pages,hooks,services,store,utils}
├── alembic/ | .env
```

## ✅ Estado Actual (Fase 1 — Completa)

### Backend — 13 rutas registradas
- [x] FastAPI lifespan + CORS + Security Headers + Rate Limit (slowapi)
- [x] `Settings` vía Pydantic v2 con `.env`
- [x] Modelos `User` + `Member` (SQLAlchemy 2.0 async, `from __future__ import annotations`)
- [x] Esquemas Pydantic v2 con validación (email, password policy, teléfono)
- [x] Repositorios async con paginación
- [x] Auth: `/register`, `/login` (JWT) + `get_current_user` + RBAC (`require_role`)
- [x] `/users/me` protegido + listado + cambio de rol (admin)
- [x] `/members` CRUD: listar (paginado + filtro status), crear, dar de baja
- [x] Migración Alembic `001` lista (`users` + `members` con enum types)

### Frontend — 5 rutas con ProtectedRoute
- [x] Tailwind v4 CSS-first (`@import "tailwindcss"`) + DaisyUI 5 (`@plugin`)
- [x] Vite proxy a `localhost:8000`
- [x] Axios interceptors con Bearer token + 401 → redirect `/login`
- [x] Zustand store (`authStore`) con `setAuth` / `logout`
- [x] `ProtectedRoute` wrapper (redirige a `/login` si no autenticado)
- [x] `/login` — formulario con validación + carga de perfil
- [x] `/register` — formulario con validación + redirección a login
- [x] `/` — Dashboard con info del usuario + enlace a socios
- [x] `/members` — cards con estado, paginación, confirmación de baja

### Seguridad Aplicada
- [x] JWT con `HTTPBearer` + validación asíncrona + `is_active` check
- [x] CORS estricto + `allow_credentials=True`
- [x] Headers: CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy
- [x] Rate limiting: slowapi en endpoints críticos (auth 5-10/min, CRUD 10-50/min)
- [x] Hash: bcrypt via passlib | Validación: Pydantic v2 (`EmailStr`, `model_validator`)
- [x] RBAC: `UserRole` enum + `require_role()` dependency
- [x] Password Policy: Regex 8+ chars, upper/lower/digit/symbol
- [x] Audit logging: middleware para logs estructurados de errores 4xx/5xx

## ⚙️ Cómo Ejecutar

### Backend
```bash
cd backend
.venv\Scripts\activate   # o source .venv/bin/activate
pip install -r requirements.txt
# Asegurar PostgreSQL corriendo en localhost:5432
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

## 🔐 Notas de Producción (pendiente)
- Migrar `sessionStorage` → `httpOnly` + `Secure` cookies antes de deploy
- Configurar pool de conexiones SSL en `DATABASE_URL` para prod
- Añadir refresh token silencioso

## 🚧 Próximos Pasos (Fase 2)
1. Refresh Token + cookies `httpOnly` + renovación silenciosa
2. Testing: pytest + httpx (backend) + Playwright (frontend)
3. Docker Compose + Dockerfile multi-stage
4. Nginx reverse proxy + healthchecks
5. CI/CD con GitHub Actions (lint, test, build, deploy)
6. Módulo de planes/membresías + pagos
7. Dashboard con métricas (gráficos, miembros activos, ingresos)
