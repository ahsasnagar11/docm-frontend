import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Documents from './pages/Documents'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path='/chat' element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path='/documents' element={<ProtectedRoute><Documents /></ProtectedRoute>} />
      <Route path='*' element={<Navigate to='/' />} />
    </Routes>
  )
}

export default App
