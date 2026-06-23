import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true, // ← ZAROORI: cookie (refresh_token) har request ke saath jaaye
})

// ─── Request Interceptor ───────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Response Interceptor ─────────────────────────────────────────────────
let isRefreshing = false
let failedQueue = [] // 401 ke dauran aane wali requests yahan wait karengi

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
  (response) => response, // success — kuch mat karo

  async (error) => {
    const originalRequest = error.config

    // Sirf 401 handle karo, aur infinite loop rokne ke liye _retry flag
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Agar refresh endpoint khud 401 de — matlab refresh token bhi expired
      // seedha logout kar do
      if (originalRequest.url === '/auth/refresh') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        window.dispatchEvent(new Event('auth:logout')) // AuthContext sun raha hai
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Pehle se refresh chal raha hai — is request ko queue mein daalo
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
        // Cookie automatically jaayegi (withCredentials: true)
        const { data } = await api.post('/auth/refresh')
        const newToken = data.access_token

        localStorage.setItem('access_token', newToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

        processQueue(null, newToken) // queue mein waiting requests ko token do

        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest) // original request retry karo

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