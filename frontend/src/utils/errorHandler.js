import axios from 'axios'

const ERROR_MESSAGES = {
  400: 'Solicitud incorrecta. Verifica los datos enviados.',
  401: 'No autenticado. Inicia sesión nuevamente.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'Recurso no encontrado.',
  409: 'El recurso ya existe.',
  422: 'Los datos enviados no son válidos.',
  429: 'Demasiadas peticiones. Espera un momento e intenta de nuevo.',
  500: 'Error interno del servidor. Intenta más tarde.',
  502: 'Servidor no disponible. Intenta más tarde.',
  503: 'Servicio no disponible. Intenta más tarde.',
}

const PASSWORD_POLICY = {
  minLength: 8,
  pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/,
  rules: [
    { key: 'uppercase', label: 'Una letra mayúscula', test: (p) => /[A-Z]/.test(p) },
    { key: 'lowercase', label: 'Una letra minúscula', test: (p) => /[a-z]/.test(p) },
    { key: 'digit', label: 'Un número', test: (p) => /\d/.test(p) },
    { key: 'symbol', label: 'Un símbolo especial (@$!%*?&)', test: (p) => /[@$!%*?&]/.test(p) },
    { key: 'length', label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
  ],
}

export function extractApiError(err) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data
    if (data?.detail) {
      if (typeof data.detail === 'string') return data.detail
      if (Array.isArray(data.detail)) return formatPydanticErrors(data.detail)
      if (typeof data.detail === 'object') return data.detail.message || data.detail.msg || JSON.stringify(data.detail)
    }
    if (data?.message) return data.message
    const status = err.response?.status
    if (status && ERROR_MESSAGES[status]) return ERROR_MESSAGES[status]
    if (err.code === 'ECONNABORTED' || err.code === 'TIMEOUT') return 'La petición tardó demasiado. Verifica tu conexión e intenta de nuevo.'
    if (err.code === 'ERR_NETWORK') return 'Error de conexión. Verifica que el servidor esté disponible.'
    return `Error inesperado (${status || 'sin código'})`
  }

  if (err instanceof Error) {
    if (err.message) return err.message
  }

  if (typeof err === 'string') return err

  return 'Ha ocurrido un error inesperado.'
}

export function formatPydanticErrors(errors) {
  if (!Array.isArray(errors)) return 'Datos inválidos.'

  const fieldMap = {
    email: 'Email',
    password: 'Contraseña',
    full_name: 'Nombre completo',
  }

  return errors
    .map((e) => {
      const field = e.loc?.slice(-1)[0]
      const label = fieldMap[field] || field || 'Campo'
      const msg = e.msg || 'valor inválido'
      return `${label}: ${msg}`
    })
    .join(' | ')
}

export function validateRegistrationForm({ full_name, email, password }) {
  const errors = {}

  if (!full_name?.trim()) {
    errors.full_name = 'El nombre es obligatorio.'
  } else if (full_name.trim().length < 2) {
    errors.full_name = 'El nombre debe tener al menos 2 caracteres.'
  } else if (full_name.trim().length > 50) {
    errors.full_name = 'El nombre no puede superar los 50 caracteres.'
  }

  if (!email?.trim()) {
    errors.email = 'El email es obligatorio.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Ingresa un email válido.'
  }

  if (!password) {
    errors.password = 'La contraseña es obligatoria.'
  } else {
    const failedRules = PASSWORD_POLICY.rules.filter((r) => !r.test(password))
    if (failedRules.length > 0) {
      errors.password = failedRules.map((r) => r.label).join(', ') + '.'
    }
  }

  return errors
}

export function validateLoginForm({ email, password }) {
  const errors = {}

  if (!email?.trim()) {
    errors.email = 'El email es obligatorio.'
  }

  if (!password) {
    errors.password = 'La contraseña es obligatoria.'
  }

  return errors
}

export { PASSWORD_POLICY }
