# MODIFICACIONES - Carpeta store/

## Archivo: uthStore.js

### Cambio 1 - Eliminacion de window.location.href = '/login' en checkAuth()
**Objetivo:** El codigo original hacia un hard redirect cuando checkAuth recibia un 401. Esto causaba un doble redirect: el interceptor de axios ya redirigia a /login en caso de fallo del refresh, y luego checkAuth tambien lo hacia, causando recargas duplicadas. Ahora checkAuth simplemente actualiza el estado (isAuthenticated: false), y el ProtectedRoute se encarga de redirigir mediante Navigate de forma declarativa.

### Cambio 2 - Eliminacion del import no usado de extractApiError
**Objetivo:** Se importo inicialmente para logging, pero ESLint reporto no-unused-vars. Se elimino ya que checkAuth no necesita mostrar errores al usuario (el redirect a login es suficiente).
