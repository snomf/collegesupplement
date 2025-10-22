import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MySchoolsPage from './pages/MySchoolsPage'
import SchoolDetailPage from './pages/SchoolDetailPage'
import NotFoundPage from './pages/NotFoundPage'
import Navbar from './components/Navbar'
import NicknameSetupPage from './pages/NicknameSetupPage'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    fetchData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        // Ensure profile exists on login
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', session.user.id).single();
        if (!profile) {
            await supabase.from('profiles').insert([{ id: session.user.id, username: session.user.email }]);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // This function is no longer needed as we get profile from session
  // const fetchUserProfile = async (userId) => { ... }


  if (loading) {
    return <div className="bg-background-dark min-h-screen" />;
  }

  const requiresNicknameSetup = session && !session.user?.user_metadata?.display_name;

  return (
    <Router>
      {session && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={!session ? <LoginPage /> : <Navigate to="/dashboard" />}
        />
        <Route path="/setup-nickname" element={requiresNicknameSetup ? <NicknameSetupPage /> : <Navigate to="/dashboard" />} />
        <Route
          path="/dashboard"
          element={
            requiresNicknameSetup ? <Navigate to="/setup-nickname" /> :
            session ? <DashboardPage /> : <Navigate to="/" />
          }
        />
        <Route
          path="/my-schools"
          element={
            requiresNicknameSetup ? <Navigate to="/setup-nickname" /> :
            session ? <MySchoolsPage /> : <Navigate to="/" />
          }
        />
        <Route
            path="/school/:schoolName"
            element={requiresNicknameSetup ? <Navigate to="/setup-nickname" /> : session ? <SchoolDetailPage /> : <Navigate to="/" />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App
