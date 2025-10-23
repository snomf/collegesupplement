import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NicknameSetupPage from './pages/NicknameSetupPage';
import MySchoolsPage from './pages/MySchoolsPage';
import SchoolDetailPage from './pages/SchoolDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import Navbar from './components/Navbar';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="bg-background-dark min-h-screen" />;
  }

  const requiresNicknameSetup = session && !session.user?.user_metadata?.display_name;

  return (
    <Router>
      {session && !requiresNicknameSetup && <Navbar session={session} />}
      <Routes>
        <Route path="/" element={!session ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/setup-nickname" element={requiresNicknameSetup ? <NicknameSetupPage /> : <Navigate to="/dashboard" />} />
        <Route
          path="/dashboard"
          element={
            requiresNicknameSetup ? <Navigate to="/setup-nickname" /> :
            session ? <DashboardPage session={session} /> : <Navigate to="/" />
          }
        />
        <Route
          path="/my-schools"
          element={
            requiresNicknameSetup ? <Navigate to="/setup-nickname" /> :
            session ? <MySchoolsPage session={session} /> : <Navigate to="/" />
          }
        />
        <Route
            path="/school/:schoolName"
            element={requiresNicknameSetup ? <Navigate to="/setup-nickname" /> : session ? <SchoolDetailPage session={session} /> : <Navigate to="/" />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
