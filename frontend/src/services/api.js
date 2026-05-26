import axios from 'axios'
const api = axios.create({ baseURL: '/api/v1', timeout: 10000, withCredentials: true })

api.interceptors.request.use(cfg => {
  const t = sessionStorage.getItem('access_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    sessionStorage.removeItem('access_token')
    window.location.href = '/login'
  }
  return Promise.reject(err.response?.data || err)
})
export default api