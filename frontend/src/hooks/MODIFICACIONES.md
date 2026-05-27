# MODIFICACIONES - Carpeta hooks/

## Archivo: usePayment.js

### Cambio 1 - Reemplazo de etch nativo por instancia pi de Axios
**Objetivo:** El codigo original usaba etch() directamente para los endpoints de pago, lo que significa: (a) no enviaba cookies httpOnly (sin withCredentials), (b) no pasaba por el interceptor de refresh token, (c) no tenia timeout, (d) no manejaba errores de red. Ahora usa pi.post() que hereda toda la configuracion del interceptor (refresh automatico, cookies, timeout).

### Cambio 2 - Uso de extractApiError() para mensajes de error
**Objetivo:** Antes se hacia data.detail || 'Error al crear pago' manualmente, sin manejar errores Pydantic, de red o timeouts. Ahora extractApiError() centraliza toda la logica de extraccion de errores.

### Cambio 3 - Estructura de respuesta consistente
**Objetivo:** Antes se usaba esponse.json() con verificacion manual de esponse.ok. Ahora Axios rechaza automaticamente respuestas 4xx/5xx, simplificando el codigo y garantizando que todos los errores pasen por el interceptor.
