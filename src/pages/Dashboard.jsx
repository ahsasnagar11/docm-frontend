import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className='min-h-screen text-white p-8' style={{ background: 'var(--bg-base)' }}>
      <div className='max-w-4xl mx-auto'>

        {/* Header */}
        <div className='flex justify-between items-center mb-12'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight' style={{ color: 'var(--text-primary)' }}>
              DOC<span style={{ color: 'var(--purple-primary)' }}>m</span>
            </h1>
            <p className='text-sm mt-1' style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className='px-4 py-2 rounded-lg text-sm font-medium transition-all'
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
          >
            Sign out
          </button>
        </div>

        {/* Welcome */}
        <div className='mb-10'>
          <h2 className='text-2xl font-semibold mb-1' style={{ color: 'var(--text-primary)' }}>
            What would you like to do?
          </h2>
          <p className='text-sm' style={{ color: 'var(--text-muted)' }}>
            Upload documents and chat with them using AI
          </p>
        </div>

        {/* Cards */}
        <div className='grid grid-cols-2 gap-4'>
          <div
            onClick={() => navigate('/documents')}
            className='p-6 rounded-2xl cursor-pointer transition-all group'
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            onMouseEnter={e => e.currentTarget.style.border = '1px solid var(--purple-border)'}
            onMouseLeave={e => e.currentTarget.style.border = '1px solid var(--border)'}
          >
            <div className='w-10 h-10 rounded-xl flex items-center justify-center mb-4' style={{ background: 'var(--purple-glow)' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: 'var(--purple-primary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <h2 className='text-lg font-semibold mb-1' style={{ color: 'var(--text-primary)' }}>Documents</h2>
            <p className='text-sm' style={{ color: 'var(--text-secondary)' }}>Upload and manage your documents</p>
          </div>

          <div
            onClick={() => navigate('/chat')}
            className='p-6 rounded-2xl cursor-pointer transition-all'
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            onMouseEnter={e => e.currentTarget.style.border = '1px solid var(--purple-border)'}
            onMouseLeave={e => e.currentTarget.style.border = '1px solid var(--border)'}
          >
            <div className='w-10 h-10 rounded-xl flex items-center justify-center mb-4' style={{ background: 'var(--purple-glow)' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: 'var(--purple-primary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
            </div>
            <h2 className='text-lg font-semibold mb-1' style={{ color: 'var(--text-primary)' }}>Chat</h2>
            <p className='text-sm' style={{ color: 'var(--text-secondary)' }}>Ask questions about your documents</p>
          </div>
        </div>
      </div>
    </div>
  )
}
