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
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ nickname: nickname })
        .eq('id', user.id);

      if (error) {
        alert('Error saving nickname: ' + error.message);
      } else {
        // Force a session refresh to get the latest user data with the nickname
        // A simple way is to navigate, but a better way might be to refresh state.
        // For now, navigation will work to trigger the check in App.jsx again.
        navigate('/dashboard', { replace: true });
        window.location.reload(); // Ensure App.jsx refetches profile
      }
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
