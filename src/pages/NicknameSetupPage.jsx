import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function NicknameSetupPage() {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      data: { display_name: nickname }
    });

    if (error) {
      alert('Error saving nickname: ' + error.message);
    } else {
      // The onAuthStateChange in App.jsx will handle the session update.
      // We just need to navigate to the dashboard.
      navigate('/dashboard', { replace: true });
      window.location.reload(); // Force reload to ensure App component re-evaluates auth state
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-dark text-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-card-dark rounded-xl shadow-2xl">
        <h2 className="text-center text-3xl font-bold">Choose a Nickname</h2>
        <p className="text-center text-gray-400">Please choose a nickname to continue.</p>
        <form className="space-y-6" onSubmit={handleSave}>
          <input
            type="text"
            placeholder="Your nickname"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-gray-600"
          >
            {loading ? 'Saving...' : 'Save and Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
