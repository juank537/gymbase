# 🏋️ GymBase - Contexto del Proyecto
> Última actualización: 2026-XX-XX | Estado: Fase 1 (Auth) completada

## 🛠️ Stack & Versiones
- Backend: FastAPI + SQLAlchemy 2.0 (async) + Alembic + Pydantic v2
- Frontend: React 19 + Vite 6 + Tailwind CSS v4 + DaisyUI + @tanstack/react-query + Zustand
- DB: PostgreSQL 16 (asyncpg)
- Entorno: GitHub Codespaces + Docker Compose
- Python: 3.12+ | Node: 20+

## 📁 Estructura Base
gym-project/
├── backend/app/{core,api/v1,models,schemas,services,repositories}
├── frontend/src/{components,pages,hooks,services,store,utils}
├── alembic/ | docker-compose.yml | .devcontainer/ | .github/dependabot.yml

## 🔐 Seguridad Aplicada
- JWT con `HTTPBearer` + validación asíncrona + `is_active` check
- CORS estricto + `allow_credentials=True`
- Headers: CSP, HSTS, X-Content-Type-Options, X-Frame-Options
- Rate limiting: `slowapi` en endpoints críticos
- Hash: `passlib[bcrypt]` | Validación: Pydantic v2 (`EmailStr`, `min_length`)
- Frontend: Axios interceptors + Zustand + `ProtectedRoute` (React Router v6)

## 📐 Convenciones 2026
- Siempre usar `async/await` en DB y servicios
- Tailwind v4: configuración CSS-first (`@import "tailwindcss"`, `@theme {}`)
- DaisyUI: temas en `@plugin "daisyui" { themes: ... }`
- Rutas: `/api/v1/<modulo>` | Swagger integrado
- Estado frontend: `@tanstack/react-query` para server state, `zustand` para UI/auth
- Migraciones: Alembic con `target_metadata = Base.metadata` (importar modelos explícitamente)

## ✅ Estado Actual
- [x] Estructura modular + Codespace + Docker PostgreSQL
- [x] FastAPI lifespan + CORS + Security Headers + Rate Limit
- [x] Modelo `User` + Alembic migrado
- [x] Auth: `/register`, `/login` (JWT) + `get_current_user`
- [x] `/users/me` protegido + Swagger con 🔒
- [x] Frontend: Login/Register/Dashboard + Tailwind v4 + DaisyUI + Zustand + React Query
- [x] Interceptores Axios + `ProtectedRoute` + redirección 401

## 🚧 Próximos Pasos
1. Módulo Members (CRUD + paginación + filtros)
2. Refresh Token + cookies `httpOnly` + silenciosa renovación
3. Testing: pytest + httpx + Playwright
4. Docker prod + Nginx reverse proxy + healthchecks
5. CI/CD con GitHub Actions (lint, test, build, deploy)

## 📝 Notas de Producción
- Migrar `sessionStorage` → `httpOnly` + `Secure` cookies antes de deploy
- Añadir `argon2` o `bcrypt` con salt configurado si se requiere compliance
- Configurar pool de conexiones SSL en `DATABASE_URL` para prod


## 🔐 Seguridad Implementada (Hardening 2026)
- RBAC: `UserRole` enum + `require_role()` dependency
- Rate Limiting: `slowapi` aplicado a auth, CRUD y health
- Password Policy: Regex 8+ chars, upper/lower/digit/symbol + Pydantic `model_validator`
- Headers: CSP, HSTS, X-Frame, X-Content-Type, Referrer-Policy, Cache-Control
- Audit Logging: Middleware para logs estructurados de errores 4xx/5xx en `/api/`
- Token: Bearer + `sessionStorage` (dev), path de migración a `httpOnly` cookies listo

## 👥 CRUD Miembros
- Modelo `Member` con FK a `User`, status enum, joined_at
- Schema Pydantic v2 con validación de teléfono
- Repo async con paginación offset/limit + count total
- API protegida con `require_role(ADMIN, TRAINER)` + rate limit
- Frontend: `@tanstack/react-query` + paginación UI + cards DaisyUI

## 👥 CRUD Miembros (v2)
- Campos: `joined_at` (auto UTC), `ended_at` (nullable), `status` enum (`active`, `trial`, `cancelled`, `suspended`)
- Lógica de baja: `PATCH /members/{id}/terminate` → fuerza status `cancelled` + registra fecha
- Repo: `terminate_member()` con validación de existencia + `refresh()` asíncrono
- UI: Cards con borde lateral por estado, fechas formateadas (`Intl.DateTimeFormat`), botón de baja con confirmación
- Paginación: offset/limit + UI inteligente (desactiva "Siguiente" si items < limit)