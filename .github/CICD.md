# GymBase - CI/CD Pipeline

## Workflows

### Backend CI/CD (backend-ci.yml)
Se ejecuta en cada push/PR a `backend/`:

1. **Lint**: Ruff check + format
2. **Test**: pytest con PostgreSQL service
3. **Build**: Docker build & push (solo main branch)

### Frontend CI/CD (frontend-ci.yml)
Se ejecuta en cada push/PR a `frontend/`:

1. **Lint**: ESLint + TypeScript check
2. **Build**: Vite build + artifact upload
3. **E2E Test**: Playwright con Chromium
4. **Build Docker**: Docker build & push (solo main branch)

### Deploy (deploy.yml)
Workflow manual para deploy a producción:
- Trigger: `workflow_dispatch`
- Select environment: production/staging
- Pull latest images
- Deploy commands (configurar según infraestructura)

## Secrets necesarios

Configurar en GitHub Repository Settings → Secrets:

```
DOCKER_USERNAME=tu_usuario_dockerhub
DOCKER_PASSWORD=tu_token_dockerhub
```

## Ejecutar workflows

### Automáticamente
```bash
# Push a main o develop
git push origin main
```

### Manual (Deploy)
1. Ir a Actions → Deploy to Production
2. Click "Run workflow"
3. Seleccionar environment
4. Click "Run workflow"

## Artifacts

- **coverage-report**: coverage.xml de pytest
- **frontend-dist**: Build de Vite
- **playwright-report**: Reporte HTML de E2E tests

## Badges (opcional)

Agregar a README.md:

```markdown
[![Backend CI/CD](https://github.com/usuario/gymbase/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/usuario/gymbase/actions/workflows/backend-ci.yml)
[![Frontend CI/CD](https://github.com/usuario/gymbase/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/usuario/gymbase/actions/workflows/frontend-ci.yml)
```