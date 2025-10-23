import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const NicknameSetupPage = () => {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleNicknameSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to set a nickname.");

      const { error } = await supabase.auth.updateUser({
        data: { display_name: nickname },
      });

      if (error) throw error;

      // Manually refresh the session to get the latest user metadata
      await supabase.auth.refreshSession();

      navigate('/dashboard');
    } catch (error) {
      setMessage(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-card-dark rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-dark-primary">Welcome!</h1>
          <p className="text-text-dark-secondary">Let's set up your nickname.</p>
        </div>
        <form className="space-y-6" onSubmit={handleNicknameSetup}>
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-text-dark-secondary">
              Nickname
            </label>
            <div className="mt-1">
              <input
                id="nickname"
                name="nickname"
                type="text"
                required
                className="appearance-none block w-full px-3 py-2 border border-border-dark rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background-dark text-text-dark-primary"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save and Continue'}
            </button>
          </div>
        </form>
        {message && <p className="mt-4 text-center text-sm text-text-dark-secondary">{message}</p>}
      </div>
    </div>
  );
};

export default NicknameSetupPage;
