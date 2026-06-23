import { createContext, useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import api from '../api'

const AuthContext = createContext(null)

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const [token, setToken] = useState(localStorage.getItem('access_token'))

  // api.js se auth:logout event aata hai jab refresh bhi fail ho jaaye
  useEffect(() => {
    const handleForceLogout = () => {
      setToken(null)
      setUser(null)
    }
    window.addEventListener('auth:logout', handleForceLogout)
    return () => window.removeEventListener('auth:logout', handleForceLogout)
  }, [])

  const login = (data) => {
    // Sirf access_token aur user — refresh_token httpOnly cookie mein hai
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setToken(data.access_token)
    setUser(data.user)
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout') // cookie backend se clear hogi
    } catch (e) {
      console.error('Logout error:', e)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      setToken(null)
      setUser(null)
    }
  }

  const updateToken = (newToken) => {
    localStorage.setItem('access_token', newToken)
    setToken(newToken)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateToken }}>
      {children}
    </AuthContext.Provider>
  )
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

// ─── Hook — same file mein export (Vite Fast Refresh happy) ──────────────────
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
