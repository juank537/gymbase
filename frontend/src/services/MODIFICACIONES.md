# MODIFICACIONES - Carpeta `services/`

## Archivo: `api.js`

### Cambio 1 — El interceptor ya no aplana `err.response?.data` en el reject
**Objetivo:** El código original hacía `Promise.reject(err.response?.data || err)`, lo que eliminaba el objeto `err` completo de Axios. Los componentes que recibían este error solo tenían acceso a `data` (ej: `{detail: "..."}`) y perdían `err.response.status`, `err.code`, etc. Esto hacía imposible distinguir errores de red de errores HTTP. Ahora se rechaza con `err` completo, y `extractApiError()` se encarga de parsear internamente usando `axios.isAxiosError()`.

### Cambio 2 — `processQueue` ahora recibe el token como segundo parámetro
**Objetivo:** La función original `processQueue(error)` solo pasaba `null` al resolver las promesas encoladas, sin pasar el nuevo access_token. Las peticiones en cola se reintentaban sin el header `Authorization` actualizado. Ahora `processQueue(null, newToken)` pasa el token para que cada petición en cola lo use.

### Cambio 3 — Protección contra redirect duplicado a `/login`
**Objetivo:** Cuando el refresh falla, se ejecutaba `window.location.href = '/login'` sin verificar si ya estábamos en `/login`, causando un reload innecesario. Ahora se verifica `!window.location.pathname.includes('/login')` antes de redirigir.

### Cambio 4 — La petición en cola usa el token recibido
**Objetivo:** Antes, la promesa en cola se resolvía sin token y la petición reintentada no tenía header `Authorization`. Ahora `.then((token) => { originalRequest.headers['Authorization'] = 'Bearer ' + token'; return api(originalRequest) })` establece el header antes de reintentar.

---

## Archivo: `auth.js`

### Nota: Sin cambios funcionales
**Objetivo:** Se mantiene la estructura existente (`useLogin`, `useRegister`). Los hooks exportados NO se usan directamente en las páginas (que tienen mutations inline), pero quedan disponibles como capa de abstracción. Los componentes ahora usan `extractApiError` importado desde `utils/errorHandler` directamente, desacoplando la lógica de error del servicio API.
