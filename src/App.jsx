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
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session) {
          // Ensure profile exists on login
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = 'Not Found'
            throw profileError;
          }

          if (!profile) {
            const { error: insertError } = await supabase.from('profiles').insert([{ id: session.user.id }]);
            if (insertError) throw insertError;
          }
        }
        setSession(session);
      } catch (error) {
        console.error('Error during auth state change:', error);
        // Handle error, maybe show a notification to the user
      } finally {
        setLoading(false);
      }
    });

    // Initial session fetch
    const fetchInitialSession = async () => {
        await supabase.auth.getSession();
        // The onAuthStateChange listener will handle setting session and loading state
    };
    fetchInitialSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

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
