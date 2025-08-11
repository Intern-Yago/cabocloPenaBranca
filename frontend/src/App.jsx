import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Financeiro } from './pages/Financeiro'
import { Materiais } from './pages/Materiais'
import { Membros } from './pages/Membros'
import './App.css'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/materiais" element={<Materiais />} />
          <Route path="/membros" element={<Membros />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
