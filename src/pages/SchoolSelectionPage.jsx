import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import schoolData from '../../data.json';
import SchoolCard from '../components/SchoolCard';
import { FaSearch } from 'react-icons/fa';

const ivyLeagueSchools = [
  "Brown University", "Columbia University", "Cornell University",
  "Dartmouth College", "Harvard College", "Princeton University",
  "University of Pennsylvania", "Yale University"
];

export default function SchoolSelectionPage() {
  const [schools, setSchools] = useState([]);
  const [selectedSchools, setSelectedSchools] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    // Add a unique id to each school object
    const schoolsWithIds = schoolData.map((school, index) => ({
      ...school,
      id: index, // or a more robust unique id
      name: school.college_name,
      location: school.college_location,
    }));
    setSchools(schoolsWithIds);
  }, []);

  const handleSelectSchool = (schoolId) => {
    setSelectedSchools((prev) => {
      if (prev.includes(schoolId)) {
        return prev.filter((id) => id !== schoolId);
      } else {
        if (prev.length >= 15) {
          alert('You can select a maximum of 15 schools.');
          return prev;
        }
        return [...prev, schoolId];
      }
    });
  };

  const handleAddSchools = async () => {
    if (!user) {
      alert("You must be logged in to add schools.");
      return;
    }
    if (selectedSchools.length === 0) {
      alert('Please select at least one school.');
      return;
    }

    setLoading(true);
    const schoolsToInsert = selectedSchools.map(id => {
        const school = schools.find(s => s.id === id);
        return {
            user_id: user.id,
            college_name: school.name,
        };
    });

    const { error } = await supabase.from('user_schools').insert(schoolsToInsert);

    if (error) {
      alert(error.message);
    } else {
      alert('Schools added successfully!');
      window.location.href = '/dashboard';
    }
    setLoading(false);
  };

  const filteredSchools = schools
    .filter(school => {
      if (filter === 'All') return true;
      if (filter === 'Ivy League') return ivyLeagueSchools.includes(school.name);
      // Add more filter logic here for Public/Liberal Arts if data becomes available
      return true;
    })
    .filter(school =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="bg-background-dark min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Add Schools to Your List
        </h1>
        <p className="text-gray-400 mb-8">Select up to 15 partner schools to track your application progress.</p>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for a school..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <FilterButton active={filter === 'All'} onClick={() => setFilter('All')}>All</FilterButton>
            <FilterButton active={filter === 'Ivy League'} onClick={() => setFilter('Ivy League')}>Ivy League</FilterButton>
            <FilterButton active={filter === 'Public'} onClick={() => setFilter('Public')}>Public</FilterButton>
            <FilterButton active={filter === 'Liberal Arts'} onClick={() => setFilter('Liberal Arts')}>Liberal Arts</FilterButton>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map((school) => (
            <SchoolCard
              key={school.id}
              school={school}
              isSelected={selectedSchools.includes(school.id)}
              onSelect={handleSelectSchool}
            />
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 bg-gray-900/80 backdrop-blur-sm mt-8 py-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-300">
            <span className="font-bold">{selectedSchools.length}</span> / 15 school(s) selected
          </p>
          <button
            onClick={handleAddSchools}
            disabled={loading || selectedSchools.length === 0}
            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Adding...' : 'Add School(s)'}
          </button>
        </div>
      </div>
    </div>
  );
}

const FilterButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      active ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
    }`}
  >
    {children}
  </button>
);
