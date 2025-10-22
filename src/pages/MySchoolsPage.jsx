import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import schoolData from '../../data.json';
import SchoolCard from '../components/SchoolCard';
import { FaPlus, FaTrash } from 'react-icons/fa';

export default function MySchoolsPage() {
  const [user, setUser] = useState(null);
  const [userSchools, setUserSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
          const matchedSchools = data.map(s => {
            const school = schoolData.find(d => d.college_name === s.college_name);
            return {
              ...s,
              ...school,
              // Ensure consistent naming for the SchoolCard component
              name: school.college_name,
              location: school.college_location,
              id: school.college_name // Use name as a unique id for deletion
            };
          });
          setUserSchools(matchedSchools);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleDeleteSchool = async (schoolName) => {
    if (!user) {
      alert("You must be logged in to delete schools.");
      return;
    }

    const { error } = await supabase
      .from('user_schools')
      .delete()
      .match({ user_id: user.id, college_name: schoolName });

    if (error) {
      alert(`Error deleting school: ${error.message}`);
    } else {
      setUserSchools(prevSchools => prevSchools.filter(school => school.name !== schoolName));
      alert(`${schoolName} removed successfully!`);
    }
  };

  const handleCardClick = (schoolName) => {
    navigate(`/school/${encodeURIComponent(schoolName)}`);
  };

  return (
    <div className="bg-background-dark min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">My Schools</h1>
            <p className="text-gray-400 mt-2">Here are the schools on your list. Click on any school to view details.</p>
          </div>
          <button
            onClick={() => navigate('/add-schools')}
            className="flex items-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            Add School
          </button>
        </div>

        {loading ? (
          <p className="text-center">Loading your schools...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userSchools.map((school) => (
              <div key={school.id} className="relative group">
                <SchoolCard
                  school={school}
                  isSelected={false} // Static, as there's no selection action here
                  onSelect={() => handleCardClick(school.name)}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click navigation
                    handleDeleteSchool(school.name);
                  }}
                  className="absolute top-2 right-2 bg-red-600 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Delete ${school.name}`}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
