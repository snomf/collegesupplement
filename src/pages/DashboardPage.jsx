import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import schoolData from '../../data.json';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [userSchools, setUserSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data, error } = await supabase
          .from('user_schools')
          .select('college_name')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user schools:', error);
        } else {
          setUserSchools(data.map(s => {
            const school = schoolData.find(d => d.college_name === s.college_name);
            return {
              ...s,
              ...school,
            };
          }));
        }
      }
      setLoading(false);
    };

    fetchUserData();

    const channel = supabase.channel('public:checklists');
    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checklists' }, (payload) => {
        console.log('Change received!', payload);
        alert('Your checklist has been updated!');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeleteInactiveUsers = async () => {
    const { data, error } = await supabase.functions.invoke('delete-inactive-users');
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-background-dark text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 lg:p-10">
          <h1 className="text-3xl font-black tracking-tight mb-6">My Schools</h1>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userSchools.map((school) => (
                <Link to={`/school/${school.college_name}`} key={school.college_name} className="bg-card-dark rounded-xl shadow-sm p-6 block hover:bg-gray-800">
                  <h2 className="text-lg font-bold mb-2">{school.college_name}</h2>
                  <p className="text-sm text-gray-400">{school.college_description || "No description."}</p>
                  {/* Progress bar and other details will go here */}
                </Link>
              ))}
            </div>
          )}
          <div className="mt-8">
            <button
              onClick={handleDeleteInactiveUsers}
              className="bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700"
            >
              Delete Inactive Users
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
