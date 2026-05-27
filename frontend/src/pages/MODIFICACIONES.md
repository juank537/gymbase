# MODIFICACIONES - Carpeta `pages/`

## Archivo: `Register.jsx`

### Cambio 1 — Reemplazo de `err.detail` por `extractApiError(err)`
**Objetivo:** Corregir el bug principal: el interceptor axios devuelve `err.response?.data` (objeto completo), no `err.response`, por lo que `err.detail` era siempre `undefined` y el usuario solo veía el mensaje genérico "Error al registrar. Verifica los campos." sin importar el error real. Ahora se usa `extractApiError()` que parsea correctamente errores Pydantic (422), HTTPException (409, 401), errores de red y timeouts.

### Cambio 2 — Validación frontend previa con `validateRegistrationForm()`
**Objetivo:** Evitar enviar datos inválidos al backend. Antes, el usuario solo veía errores después de esperar la respuesta del servidor. Ahora se validan todos los campos antes del envío: nombre (2-50 chars), email (formato), contraseña (policy completa). Los errores se muestran por campo con `input-error` de DaisyUI.

### Cambio 3 — Feedback visual de contraseña en tiempo real con `PASSWORD_POLICY.rules`
**Objetivo:** El placeholder "8+ chars, 1 mayúscula, 1 número, 1 símbolo" era insuficiente. Ahora se muestra una lista de reglas con check/cross verde/rojo que se actualiza mientras el usuario escribe, indicando qué reglas faltan.

### Cambio 4 — Estado `touched` y errores por campo (`errors` + `touched`)
**Objetivo:** Separar errores por campo individual y solo mostrarlos después de que el usuario interactúe con cada campo (`onBlur`). Antes solo había un `error` global, ahora hay errores por campo + error de API, mejorando la UX y la accesibilidad.

### Cambio 5 — Import de `useRegister` desde `services/auth.js` eliminado (no se usaba)
**Objetivo:** El archivo ya tenía su propia `useMutation` inline y no usaba el hook exportado. Se mantiene la mutation inline por simplicidad, pero ahora usa `extractApiError`.

---

## Archivo: `Login.jsx`

### Cambio 1 — Reemplazo de `err.detail` por `extractApiError(err)`
**Objetivo:** Mismo bug que Register: `err.detail` era `undefined` cuando el backend devolvía errores estructurados. Ahora traduce correctamente errores 401, 403, 429, etc.

### Cambio 2 — Validación frontend previa con `validateLoginForm()`
**Objetivo:** Validar que email y password no estén vacíos antes de enviar al backend, evitando peticiones innecesarias.

### Cambio 3 — Estado `touched` y errores por campo
**Objetivo:** Mostrar errores por campo individual solo después de `onBlur`, con indicador visual `input-error`.

---

## Archivo: `Dashboard.jsx`

### Cambio 1 — Reemplazo de `err.response?.data?.detail` por `extractApiError(err)`
**Objetivo:** El acceso manual `err.response?.data?.detail` no manejaba errores Pydantic (422), errores de red, ni timeouts. Ahora usa el handler centralizado.

### Cambio 2 — Renderizado del estado `error` en la UI
**Objetivo:** El `error` se seteaba pero NUNCA se renderizaba en el JSX original. Ahora se muestra una `alert alert-error` con botón de cierre cuando hay error cargando métricas.

### Cambio 3 — `setLoading(false)` para usuarios no-admin
**Objetivo:** Si el usuario no era admin, `fetchMetrics` nunca se ejecutaba y `loading` permanecía `true` para siempre, mostrando un spinner infinito. Ahora se llama `setLoading(false)` en el `else`.
