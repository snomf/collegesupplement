import { useState } from 'react';
import { supabase } from '../supabaseClient';
import logo from '../assets/supplogo.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });
      if (error) throw error;
      setMessage('Check your email for the login link!');
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
          <div className="flex justify-center items-center space-x-4">
            <img src={logo} alt="Questrack Logo" className="h-10 w-10" />
            <h1 className="text-3xl font-bold text-text-dark-primary">Questrack</h1>
          </div>
          <p className="text-text-dark-secondary mt-2">Sign in to keep track of QB supplements</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-dark-secondary">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-3 py-2 border border-border-dark rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background-dark text-text-dark-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </div>
        </form>
        {message && <p className="mt-4 text-center text-sm text-text-dark-secondary">{message}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
