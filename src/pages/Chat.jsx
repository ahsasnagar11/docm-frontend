import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [activeConvId, setActiveConvId] = useState(null)
  const activeConvIdRef = useRef(null) // ref se sync value milegi
  useAuth()
  const navigate = useNavigate()
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    fetchConversations()
  }, [])

  // activeConvId change hone pe ref bhi update karo
  useEffect(() => {
    activeConvIdRef.current = activeConvId
  }, [activeConvId])

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations')
      setConversations(res.data)
    } catch (err) { console.error(err) }
  }

  const loadConversation = async (conv) => {
    try {
      const res = await api.get(`/chat/conversations/${conv.id}`)
      setMessages(res.data.messages.map(m => ({ role: m.role, content: m.content })))
      setActiveConvId(conv.id)
      activeConvIdRef.current = conv.id
      setSidebarOpen(false)
    } catch (err) { console.error(err) }
  }

  const newChat = () => {
    setMessages([])
    setActiveConvId(null)
    activeConvIdRef.current = null
    setSidebarOpen(false)
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const question = input
    setInput('')
    setLoading(true)
    setMessages(prev => [...prev, { role: 'user', content: question }])

    try {
      await api.post('/chat/', {
        question,
        conversation_id: activeConvIdRef.current || undefined  // ref se lo — sync value
      }, {
        responseType: 'stream',
        onDownloadProgress: (progressEvent) => {
          const raw = progressEvent.event.target.responseText
          const lines = raw.split('\n')
          let answer = ''

          for (const line of lines) {
            if (!line.trim()) continue
            if (line.startsWith('{')) {
              try {
                const parsed = JSON.parse(line)
                if (parsed.conversation_id && !activeConvIdRef.current) {
                  // Pehli baar conversation bani — ID save karo
                  setActiveConvId(parsed.conversation_id)
                  activeConvIdRef.current = parsed.conversation_id
                  fetchConversations()
                }
              } catch {}
              continue
            }
            answer += line
          }

          if (!answer) return

          setMessages(prev => {
            const updated = [...prev]
            const lastMsg = updated[updated.length - 1]
            if (lastMsg?.role === 'assistant') {
              updated[updated.length - 1] = { role: 'assistant', content: answer }
            } else {
              updated.push({ role: 'assistant', content: answer })
            }
            return updated
          })
        }
      })
    } catch (err) {
      if (err.response?.status !== 401) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
      }
    }

    setLoading(false)
  }

  return (
    <div className='flex h-screen overflow-hidden' style={{ background: 'var(--bg-base)' }}>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-20'
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className='fixed left-0 top-0 h-full z-30 flex flex-col transition-transform duration-300'
        style={{
          width: '280px',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
        <div className='flex items-center justify-between p-4' style={{ borderBottom: '1px solid var(--border)' }}>
          <span className='font-semibold text-sm' style={{ color: 'var(--text-primary)' }}>
            DOC<span style={{ color: 'var(--purple-primary)' }}>m</span>
          </span>
          <button onClick={() => setSidebarOpen(false)} style={{ color: 'var(--text-muted)' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className='p-3'>
          <button
            onClick={newChat}
            className='w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium'
            style={{ background: 'var(--purple-primary)', color: '#fff' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Chat
          </button>
        </div>

        <div className='flex-1 overflow-y-auto px-2 pb-4'>
          {conversations.length === 0 && (
            <p className='text-xs text-center py-6' style={{ color: 'var(--text-muted)' }}>No conversations yet</p>
          )}
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => loadConversation(conv)}
              className='w-full text-left px-3 py-2.5 rounded-xl text-sm mb-1 truncate block'
              style={{
                color: activeConvId === conv.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: activeConvId === conv.id ? 'var(--bg-hover)' : 'transparent'
              }}
              onMouseEnter={e => { if (activeConvId !== conv.id) e.currentTarget.style.background = 'var(--bg-elevated)' }}
              onMouseLeave={e => { if (activeConvId !== conv.id) e.currentTarget.style.background = 'transparent' }}
            >
              {conv.title || 'Untitled'}
            </button>
          ))}
        </div>

        <div className='p-3' style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => navigate('/')}
            className='w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm'
            style={{ color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Dashboard
          </button>
        </div>
      </div>

      {/* Main Chat */}
      <div className='flex flex-col flex-1 min-w-0'>
        <div className='flex items-center gap-3 px-4 py-3' style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className='p-2 rounded-lg'
            style={{ color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <span className='text-sm font-semibold' style={{ color: 'var(--text-primary)' }}>
            DOC<span style={{ color: 'var(--purple-primary)' }}>m</span>
          </span>
          <span className='text-xs px-2 py-0.5 rounded-full' style={{ background: 'var(--purple-glow)', color: 'var(--purple-primary)' }}>Chat</span>
        </div>

        <div className='flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4'>
          {messages.length === 0 && (
            <div className='flex-1 flex flex-col items-center justify-center text-center pb-20'>
              <div className='w-14 h-14 rounded-2xl flex items-center justify-center mb-4' style={{ background: 'var(--purple-glow)' }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: 'var(--purple-primary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
              </div>
              <p className='text-base font-medium mb-1' style={{ color: 'var(--text-primary)' }}>Ask anything about your documents</p>
              <p className='text-sm' style={{ color: 'var(--text-muted)' }}>Upload documents first, then ask questions here</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className='max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed'
                style={{
                  background: msg.role === 'user' ? 'var(--purple-primary)' : 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border)'
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className='flex justify-start'>
              <div className='px-4 py-3 rounded-2xl text-sm flex items-center gap-2' style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <div className='flex gap-1'>
                  {[0,1,2].map(i => (
                    <div key={i} className='w-1.5 h-1.5 rounded-full animate-bounce' style={{ background: 'var(--purple-primary)', animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                Thinking
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className='px-4 py-4' style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
          <div className='flex gap-2 items-end max-w-3xl mx-auto'>
            <input
              className='flex-1 px-4 py-3 rounded-xl text-sm outline-none'
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                opacity: loading ? 0.5 : 1
              }}
              placeholder={loading ? 'Waiting for response...' : 'Ask a question about your documents...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className='p-3 rounded-xl flex-shrink-0'
              style={{
                background: loading || !input.trim() ? 'var(--bg-elevated)' : 'var(--purple-primary)',
                color: loading || !input.trim() ? 'var(--text-muted)' : '#fff',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
