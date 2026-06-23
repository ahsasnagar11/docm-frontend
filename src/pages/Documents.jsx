import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [tab, setTab] = useState('pdf')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const navigate = useNavigate()

  useEffect(() => { fetchDocuments() }, [])

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents/')
      setDocuments(res.data)
    } catch (err) { console.error(err) }
  }

  const uploadPDF = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', file.name)
    try {
      await api.post('/documents/upload/pdf', formData)
      fetchDocuments()
    } catch (err) { console.error(err) }
    setUploading(false)
  }

  const uploadURL = async () => {
    if (!url.trim()) return
    setUploading(true)
    try {
      await api.post('/documents/upload/url', { url, title })
      setUrl(''); setTitle(''); fetchDocuments()
    } catch (err) { console.error(err) }
    setUploading(false)
  }

  const uploadText = async () => {
    if (!text.trim() || !title.trim()) return
    setUploading(true)
    try {
      await api.post('/documents/upload/text', { content: text, title })
      setText(''); setTitle(''); fetchDocuments()
    } catch (err) { console.error(err) }
    setUploading(false)
  }

  const statusColor = (status) => {
    if (status === 'ready') return 'var(--text-ready)'
    if (status === 'processing') return '#f59e0b'
    if (status === 'failed') return '#ef4444'
    return 'var(--text-muted)'
  }

  const statusDot = (status) => {
    if (status === 'ready') return '#22c55e'
    if (status === 'processing') return '#f59e0b'
    if (status === 'failed') return '#ef4444'
    return '#5c5078'
  }

  return (
    <div className='min-h-screen text-white' style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-4' style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <div className='flex items-center gap-3'>
          <span className='text-lg font-semibold' style={{ color: 'var(--text-primary)' }}>
            DOC<span style={{ color: 'var(--purple-primary)' }}>m</span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span className='text-sm font-medium' style={{ color: 'var(--text-secondary)' }}>Documents</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className='text-sm px-3 py-1.5 rounded-lg transition-all'
          style={{ color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}
        >
          Dashboard
        </button>
      </div>

      <div className='max-w-3xl mx-auto p-6'>
        {/* Upload Card */}
        <div className='rounded-2xl p-6 mb-6' style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <h2 className='text-base font-semibold mb-4' style={{ color: 'var(--text-primary)' }}>Upload Document</h2>

          {/* Tabs */}
          <div className='flex gap-1 mb-5 p-1 rounded-xl w-fit' style={{ background: 'var(--bg-base)' }}>
            {['pdf', 'url', 'text'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className='px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all'
                style={{
                  background: tab === t ? 'var(--purple-primary)' : 'transparent',
                  color: tab === t ? '#fff' : 'var(--text-secondary)'
                }}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {tab === 'pdf' && (
            <label
              className='flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all'
              style={{
                border: '2px dashed var(--purple-border)',
                padding: '2.5rem',
                background: uploading ? 'var(--purple-glow)' : 'transparent'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--purple-glow)'}
              onMouseLeave={e => e.currentTarget.style.background = uploading ? 'var(--purple-glow)' : 'transparent'}
            >
              {/* Upload Icon */}
              <div className='w-12 h-12 rounded-2xl flex items-center justify-center mb-3' style={{ background: 'var(--purple-glow)' }}>
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: 'var(--purple-primary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className='text-sm font-medium mb-1' style={{ color: 'var(--text-primary)' }}>
                {uploading ? 'Uploading...' : 'Click to upload PDF'}
              </p>
              <p className='text-xs' style={{ color: 'var(--text-muted)' }}>PDF files only</p>
              <input type='file' accept='.pdf' className='hidden' onChange={uploadPDF} disabled={uploading} />
            </label>
          )}

          {tab === 'url' && (
            <div className='flex flex-col gap-3'>
              <input
                className='p-3 rounded-xl text-sm outline-none'
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                placeholder='Title'
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <input
                className='p-3 rounded-xl text-sm outline-none'
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                placeholder='https://...'
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
              <button
                onClick={uploadURL}
                disabled={uploading}
                className='p-3 rounded-xl text-sm font-medium transition-all'
                style={{ background: 'var(--purple-primary)', color: '#fff' }}
              >
                {uploading ? 'Uploading...' : 'Upload URL'}
              </button>
            </div>
          )}

          {tab === 'text' && (
            <div className='flex flex-col gap-3'>
              <input
                className='p-3 rounded-xl text-sm outline-none'
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                placeholder='Title'
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <textarea
                className='p-3 rounded-xl text-sm outline-none resize-none'
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', height: '120px' }}
                placeholder='Paste text here...'
                value={text}
                onChange={e => setText(e.target.value)}
              />
              <button
                onClick={uploadText}
                disabled={uploading}
                className='p-3 rounded-xl text-sm font-medium transition-all'
                style={{ background: 'var(--purple-primary)', color: '#fff' }}
              >
                {uploading ? 'Uploading...' : 'Upload Text'}
              </button>
            </div>
          )}
        </div>

        {/* Documents List */}
        <div className='rounded-2xl p-6' style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <h2 className='text-base font-semibold mb-4' style={{ color: 'var(--text-primary)' }}>Your Documents</h2>
          {documents.length === 0 && (
            <p className='text-sm text-center py-8' style={{ color: 'var(--text-muted)' }}>No documents yet. Upload one above.</p>
          )}
          <div className='flex flex-col gap-2'>
            {documents.map(doc => (
              <div
                key={doc.id}
                className='flex justify-between items-center p-4 rounded-xl'
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              >
                <div className='flex items-center gap-3'>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: 'var(--purple-primary)', flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  <div>
                    <p className='text-sm font-medium' style={{ color: 'var(--text-primary)' }}>{doc.title}</p>
                    <p className='text-xs capitalize' style={{ color: 'var(--text-muted)' }}>{doc.source_type}</p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-1.5 h-1.5 rounded-full' style={{ background: statusDot(doc.status) }} />
                  <span className='text-xs font-medium capitalize' style={{ color: statusColor(doc.status) }}>{doc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
