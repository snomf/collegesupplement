import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import schoolData from '../../data.json'; // Adjust the path as needed

export default function SchoolSelectionPage() {
  const [schools, setSchools] = useState([]);
  const [selectedSchools, setSelectedSchools] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // In a real app, you might fetch this from a user session
    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };
    checkUser();
    setSchools(schoolData);
  }, []);

  const handleSelectSchool = (collegeName) => {
    setSelectedSchools((prev) =>
      prev.includes(collegeName)
        ? prev.filter((name) => name !== collegeName)
        : [...prev, collegeName]
    );
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
    if (selectedSchools.length > 15) {
      alert('You can select a maximum of 15 schools.');
      return;
    }

    setLoading(true);
    const schoolsToInsert = selectedSchools.map(schoolName => ({
        user_id: user.id,
        college_name: schoolName,
    }));

    const { error } = await supabase.from('user_schools').insert(schoolsToInsert);

    if (error) {
      alert(error.message);
    } else {
      alert('Schools added successfully!');
      // redirect to dashboard
      window.location.href = '/dashboard';
    }
    setLoading(false);
  };

  const filteredSchools = schools.filter((school) =>
    school.college_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-background-dark min-h-screen text-text-dark font-display">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-black tracking-tight mb-4">
          Add Schools to Your List
        </h1>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search for a school..."
            className="w-full bg-input-dark border-none rounded-lg px-4 py-3 focus:ring-primary focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map((school) => (
            <div
              key={school.college_name}
              className={`relative bg-card-dark rounded-xl shadow-sm border cursor-pointer transition-all ${
                selectedSchools.includes(school.college_name)
                  ? 'border-primary ring-2 ring-primary/50'
                  : 'border-transparent hover:border-primary-dark'
              }`}
              onClick={() => handleSelectSchool(school.college_name)}
            >
              <div className="absolute top-3 right-3">
                <input
                  type="checkbox"
                  checked={selectedSchools.includes(school.college_name)}
                  onChange={() => handleSelectSchool(school.college_name)}
                  className="form-checkbox h-5 w-5 rounded text-primary-dark focus:ring-primary-dark/50 border-gray-600 bg-gray-700"
                />
              </div>
              <div className="p-4">
                <p className="text-base font-bold">{school.college_name}</p>
                <p className="text-sm text-subtext-dark">{school.college_description || 'No description available.'}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="sticky bottom-0 bg-background-dark/80 backdrop-blur-sm mt-8 py-4 border-t border-gray-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-sm font-medium text-subtext-dark">
              {selectedSchools.length} school(s) selected
            </p>
            <button
              onClick={handleAddSchools}
              disabled={loading}
              className="bg-primary-dark text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-800 disabled:bg-gray-600"
            >
              {loading ? 'Adding...' : 'Add School(s)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
