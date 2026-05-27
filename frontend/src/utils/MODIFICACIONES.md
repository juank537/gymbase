# MODIFICACIONES - Carpeta `utils/`

## Archivo: `errorHandler.js` (NUEVO)

### Cambio 1 — Creación del módulo centralizado de manejo de errores
**Objetivo:** Centralizar toda la lógica de extracción, traducción y validación de errores del frontend en un único módulo reutilizable, eliminando la dispersión de lógica de errores dispersa en cada componente.

**Problema identificado:**
- El `Register.jsx` intentaba leer `err.detail` directamente, pero el interceptor axios ya devolvía `err.response?.data`, lo que hacía que `err.detail` fuera `undefined` cuando el backend respondía con errores de validación Pydantic (422) o con `HTTPException` (409, 401, etc.).
- Los errores de validación Pydantic v2 del backend llegan como un array `[{loc, msg, type}]` que no se estaba procesando ni traduciendo al español en el frontend.
- No existía validación frontend previa al envío del formulario de registro, forzando al usuario a enviar datos inválidos al backend para ver errores.
- No había manejo de errores de red (timeout, server down, CORS).

**Qué se implementó:**

1. **`extractApiError(err)`** — Función que recibe cualquier error (Axios, Error genérico, string) y retorna un mensaje legible en español:
   - Si es `AxiosError`: extrae `response.data.detail` (string, array Pydantic u objeto), luego `response.data.message`, luego cae al mapa de códigos HTTP, y finalmente maneja errores de red (`ECONNABORTED`, `ERR_NETWORK`).
   - Si es `Error` genérico: retorna `err.message`.
   - Fallback: mensaje genérico.

2. **`formatPydanticErrors(errors)`** — Traduce el array de errores de validación de Pydantic v2 (`[{loc: ["body","password"], msg: "..."}]`) a mensajes legibles en español, mapeando nombres de campos técnicos (`email`, `password`, `full_name`) a etiquetas en español.

3. **`validateRegistrationForm({full_name, email, password})`** — Validación frontend completa antes de enviar al backend:
   - Nombre: obligatorio, 2-50 caracteres.
   - Email: obligatorio, formato válido.
   - Contraseña: valida cada regla de la policy (mayúscula, minúscula, dígito, símbolo, longitud mínima) y retorna solo las reglas fallidas.

4. **`validateLoginForm({email, password})`** — Validación frontend para login (campos obligatorios).

5. **`PASSWORD_POLICY`** — Exportación de la política de contraseñas y sus reglas individuales, para que los componentes puedan mostrar feedback visual en tiempo real.

6. **`ERROR_MESSAGES`** — Mapa de códigos HTTP → mensajes en español, usado como fallback en `extractApiError`.
