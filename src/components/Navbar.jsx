import { supabase } from '../supabaseClient';
import { useNavigate, NavLink } from 'react-router-dom';

const Navbar = ({ session }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? 'bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium'
      : 'text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium';

  return (
    <nav className="bg-card-dark shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/dashboard" className="text-white font-bold">Questrack</NavLink>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink to="/my-schools" className={linkClass}>My Schools</NavLink>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-text-dark-secondary mr-4">
              Welcome, {session.user.user_metadata.display_name}!
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
