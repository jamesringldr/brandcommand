import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './routes/Login'
import AuthCallback from './routes/AuthCallback'
import Shell from './routes/Shell'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={<Shell />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
