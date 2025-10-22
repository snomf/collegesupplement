import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import schoolData from '../../data.json';
import SchoolCard from '../components/SchoolCard';
import { FaPlus, FaTrash, FaSearch } from 'react-icons/fa';

const ivyLeagueSchools = [
  "Brown University", "Columbia University", "Cornell University",
  "Dartmouth College", "Harvard College", "Princeton University",
  "University of Pennsylvania", "Yale University"
];

export default function MySchoolsPage() {
  const [user, setUser] = useState(null);
  const [userSchools, setUserSchools] = useState([]);
  const [allSchools, setAllSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false); // To toggle between views
  const [selectedSchools, setSelectedSchools] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase.from('user_schools').select('college_name').eq('user_id', user.id);
        if (!error) {
          const matchedSchools = data.map(s => {
            const school = schoolData.find(d => d.college_name === s.college_name);
            return { ...s, ...school, name: school.college_name, location: school.college_location, id: school.college_name };
          });
          setUserSchools(matchedSchools);
        }
      }

      const schoolsWithIds = schoolData.map((school, index) => ({
        ...school, id: index, name: school.college_name, location: school.college_location,
      }));
      setAllSchools(schoolsWithIds);

      setLoading(false);
    };
    fetchUserData();
  }, [isAdding]); // Refetch when we exit the 'add' mode

  // Delete a school from the user's list
  const handleDeleteSchool = async (schoolName) => {
    if (!user) return;
    const { error } = await supabase.from('user_schools').delete().match({ user_id: user.id, college_name: schoolName });
    if (!error) {
      setUserSchools(prev => prev.filter(school => school.name !== schoolName));
      // Log activity
      await supabase.from('recent_activities').insert({ user_id: user.id, activity_type: 'school_removed', details: `You removed ${schoolName}.` });
    }
  };

  // Navigate to school detail page
  const handleCardClick = (schoolName) => {
    navigate(`/school/${encodeURIComponent(schoolName)}`);
  };

  // --- Add Schools Logic ---
  const handleSelectSchool = (schoolId) => {
    setSelectedSchools(prev => {
      if (prev.includes(schoolId)) {
        return prev.filter(id => id !== schoolId);
      } else if (prev.length < 15) {
        return [...prev, schoolId];
      }
      alert('You can select a maximum of 15 schools.');
      return prev;
    });
  };

  const handleAddSchools = async () => {
    if (!user || selectedSchools.length === 0) return;

    setLoading(true);
    const schoolsToInsert = selectedSchools.map(id => {
      const school = allSchools.find(s => s.id === id);
      return { user_id: user.id, college_name: school.name };
    });

    const { error } = await supabase.from('user_schools').insert(schoolsToInsert);
    if (error) {
      alert(error.message);
    } else {
      // Log activity for each added school
      const activityInserts = schoolsToInsert.map(school => ({
          user_id: user.id,
          activity_type: 'school_added',
          details: `You added ${school.college_name}.`
      }));
      await supabase.from('recent_activities').insert(activityInserts);

      setIsAdding(false); // Go back to 'My Schools' view
    }
    setLoading(false);
  };

  const filteredAllSchools = allSchools
    .filter(school => filter === 'All' || (filter === 'Ivy League' && ivyLeagueSchools.includes(school.name)))
    .filter(school => school.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // --- Render Logic ---
  if (loading) {
    return <div className="bg-background-dark min-h-screen text-white flex items-center justify-center">Loading...</div>;
  }

  if (isAdding) {
    // RENDER "ADD SCHOOLS" VIEW
    return (
      <div className="bg-background-dark min-h-screen text-white font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Add Schools to Your List</h1>
              <p className="text-gray-400 mt-2">Select up to 15 partner schools.</p>
            </div>
            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-white">Cancel</button>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
              <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search for a school..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <FilterButton active={filter === 'All'} onClick={() => setFilter('All')}>All</FilterButton>
              <FilterButton active={filter === 'Ivy League'} onClick={() => setFilter('Ivy League')}>Ivy League</FilterButton>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAllSchools.map(school => (
              <SchoolCard key={school.id} school={school} isSelected={selectedSchools.includes(school.id)} onSelect={handleSelectSchool} />
            ))}
          </div>
        </div>
        <div className="sticky bottom-0 bg-gray-900/80 backdrop-blur-sm mt-8 py-4 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-300"><span className="font-bold">{selectedSchools.length}</span> / 15 selected</p>
            <button onClick={handleAddSchools} disabled={loading || selectedSchools.length === 0}
              className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-gray-600">
              {loading ? 'Adding...' : 'Add School(s)'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER "MY SCHOOLS" VIEW
  return (
    <div className="bg-background-dark min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">My Schools</h1>
            <p className="text-gray-400 mt-2">Here are the schools on your list.</p>
          </div>
          <button onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700">
            <FaPlus /> Add School
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userSchools.map((school) => (
            <div key={school.id} className="relative group">
              <SchoolCard school={school} isSelected={false} onSelect={() => handleCardClick(school.name)} />
              <button onClick={(e) => { e.stopPropagation(); handleDeleteSchool(school.name); }}
                className="absolute top-2 right-2 bg-red-600 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const FilterButton = ({ active, onClick, children }) => (
  <button onClick={onClick}
    className={`px-4 py-2 rounded-md text-sm font-medium ${active ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
    {children}
  </button>
);
