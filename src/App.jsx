import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import MySchoolsPage from './pages/MySchoolsPage'
import SchoolDetailPage from './pages/SchoolDetailPage'
import NotFoundPage from './pages/NotFoundPage'
import Navbar from './components/Navbar'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/my-schools" element={<MySchoolsPage />} />
        <Route path="/school/:schoolName" element={<SchoolDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App
