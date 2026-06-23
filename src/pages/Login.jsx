import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/auth/login', { email, password })
      login(res.data)
      navigate('/')
    } catch (err) {
      setError('Invalid credentials')
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center' style={{ background: 'var(--bg-base)' }}>
      <div className='w-full max-w-md p-8 rounded-2xl' style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        
        <div className='mb-8'>
          <h1 className='text-2xl font-bold mb-1' style={{ color: 'var(--text-primary)' }}>
            DOC<span style={{ color: 'var(--purple-primary)' }}>m</span>
          </h1>
          <p className='text-sm' style={{ color: 'var(--text-muted)' }}>Sign in to your account</p>
        </div>

        {error && (
          <div className='mb-4 px-4 py-3 rounded-xl text-sm' style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
            {error}
          </div>
        )}

        <div className='flex flex-col gap-3'>
          <input
            className='px-4 py-3 rounded-xl text-sm outline-none'
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            placeholder='Email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
          />
          <input
            className='px-4 py-3 rounded-xl text-sm outline-none'
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            type='password'
            placeholder='Password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
          />
          <button
            onClick={handleSubmit}
            className='py-3 rounded-xl text-sm font-semibold transition-all mt-1'
            style={{ background: 'var(--purple-primary)', color: '#fff' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--purple-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--purple-primary)'}
          >
            Sign in
          </button>
        </div>

        <p className='text-sm text-center mt-6' style={{ color: 'var(--text-muted)' }}>
          No account?{' '}
          <Link to='/register' style={{ color: 'var(--purple-primary)' }}>Create one</Link>
        </p>
      </div>
    </div>
  )
}
