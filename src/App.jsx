import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SchoolSelectionPage from './pages/SchoolSelectionPage'
import SchoolDetailPage from './pages/SchoolDetailPage'
import DeadlinesPage from './pages/DeadlinesPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  const [session, setSession] = useState(null)
  const [userSchools, setUserSchools] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchUserSchools(session.user.id)
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session && session.user) {
        // Create a profile if one doesn't exist
        const createProfile = async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single()

          if (!data && !error) {
            await supabase.from('profiles').insert([
              {
                id: session.user.id,
                username: session.user.email,
                last_active: new Date(),
              },
            ])
          }
        }
        createProfile()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserSchools = async (userId) => {
    const { data } = await supabase
      .from('user_schools')
      .select('college_name')
      .eq('user_id', userId)
    setUserSchools(data.map(s => s.college_name))
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={!session ? <LoginPage /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={
            session ? (
              userSchools.length > 0 ? (
                <DashboardPage />
              ) : (
                <SchoolSelectionPage />
              )
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="/school/:schoolName" element={session ? <SchoolDetailPage /> : <Navigate to="/" />} />
        <Route path="/deadlines" element={session ? <DeadlinesPage /> : <Navigate to="/" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App
