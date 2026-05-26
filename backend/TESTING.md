# Backend Testing

## Ejecutar tests
```bash
cd backend
.venv\Scripts\activate
pytest tests/ -v
pytest tests/ -v --tb=short
pytest tests/test_auth.py -v  # Tests específicos
```

## Cobertura de tests
- **test_auth.py**: 9 tests (registro, login, logout, refresh, autenticación)
- **test_members.py**: 4 tests (CRUD miembros, paginación, baja)
- **test_plans.py**: 6 tests (CRUD planes, listado público)
- **test_memberships.py**: 6 tests (CRUD membresías, cancelación)

**Total: 24 tests pasando**

---

# Frontend Testing (Playwright)

## Instalar dependencias
```bash
cd frontend
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

## Ejecutar tests
```bash
cd frontend
npm run test           # Headless
npm run test:ui        # UI mode
npm run test:report    # Ver reporte HTML
```

## Configuración
- **Base URL**: http://localhost:5173
- **Browser**: Chromium
- **Test dir**: ./e2e
- **Reporter**: HTML

## Tests E2E creados
- **auth.spec.js**: Flujos de autenticación, registro, routes protegidas, dashboard, gestión de miembros

**Total: 15 tests E2E configurados**