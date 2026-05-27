# MODIFICACIONES - Carpeta `components/`

## Archivo: `ProtectedRoute.jsx`

### Cambio 1 — Uso de `useRef` para evitar llamadas duplicadas a `checkAuth()`
**Objetivo:** El código original tenía una dependencia vacía `[]` en el `useEffect`, pero en React 19 StrictMode, `useEffect` se ejecuta dos veces en desarrollo. Sin protección, `checkAuth()` se llamaba dos veces, generando dos peticiones a `/users/me`. Con `hasChecked.current`, se garantiza que `checkAuth` se ejecuta exactamente una vez.

### Cambio 2 — Inclusión de `checkAuth` en el array de dependencias del useEffect
**Objetivo:** El `useEffect` original tenía `[]` como dependencias pero usaba `checkAuth`, `isAuthenticated` e `isLoading`, violando las reglas de React hooks (missing deps). Ahora incluye `[isAuthenticated, isLoading, checkAuth]`, y el guard `hasChecked.current` previene ejecuciones múltiples.
