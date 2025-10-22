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
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    };
    fetchData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        await fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', userId)
      .single();
    setProfile(data);
  };


  if (loading) {
    return <div className="bg-background-dark min-h-screen" />;
  }

  const requiresNicknameSetup = session && !profile?.nickname;

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
