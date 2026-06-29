import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  withCredentials: true,
  timeout: 120000, // 2 min timeout — Render free tier can take that long
})

// ─── Warmup Banner ────────────────────────────────────────────────────────
let warmupTimer = null

const showWarmupBanner = () => {
  if (document.getElementById('render-warmup-banner')) return
  const banner = document.createElement('div')
  banner.id = 'render-warmup-banner'
  banner.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
    background: #1a1a1a; color: #fff; text-align: center;
    padding: 12px 16px; font-size: 14px; font-family: sans-serif;
  `
  banner.textContent = 'Sorry, the backend is hosted on Render free tier and is currently sleeping. It will take up to 2 minutes to restart. Please wait...'
  document.body.prepend(banner)
}

const hideWarmupBanner = () => {
  clearTimeout(warmupTimer)
  const banner = document.getElementById('render-warmup-banner')
  if (banner) banner.remove()
}

// ─── Request Interceptor ──────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  // If request takes more than 8 seconds, show warmup banner
  warmupTimer = setTimeout(showWarmupBanner, 8000)

  return config
})

// ─── Response Interceptor ─────────────────────────────────────────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => {
    hideWarmupBanner() // request succeeded — hide banner
    return response
  },

  async (error) => {
    hideWarmupBanner() // request failed — hide banner either way
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {

      if (originalRequest.url === '/auth/refresh') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        window.dispatchEvent(new Event('auth:logout'))
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await api.post('/auth/refresh')
        const newToken = data.access_token

        localStorage.setItem('access_token', newToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

        processQueue(null, newToken)

        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)

      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        window.dispatchEvent(new Event('auth:logout'))
        return Promise.reject(refreshError)

      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api