import { useState, useEffect, useMemo } from 'react';
import * as localStore from '../lib/localStorage';
import { Link } from 'react-router-dom';
import allSchoolsData from '../data.json';
import { FaTrash } from 'react-icons/fa';

const MySchoolsPage = () => {
  const [userSchools, setUserSchools] = useState([]);
  const [allSchools] = useState(allSchoolsData);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setUserSchools(localStore.getUserSchools());
  }, []);

  const handleAddSchool = () => {
    if (userSchools.length >= 15) {
      alert('You can only select a maximum of 15 schools.');
      return;
    }

    if (selectedSchool) {
        localStore.addUserSchool(selectedSchool);
        setUserSchools(localStore.getUserSchools());
        localStore.addRecentActivity({
            activity_description: `Added <b>${selectedSchool}</b> to your list.`,
            created_at: new Date().toISOString()
        });
        setShowAddSchoolModal(false);
        setSearchTerm('');
        setSelectedSchool('');
    }
  };

  const handleRemoveSchool = (schoolName) => {
    localStore.removeUserSchool(schoolName);
    setUserSchools(localStore.getUserSchools());
  };

  const filteredSchools = useMemo(() => {
    let userSchoolNames = userSchools.map(s => s.name);
    let availableSchools = allSchools.filter(school => !userSchoolNames.includes(school.name));

    if (searchTerm) {
      availableSchools = availableSchools.filter(school =>
        school.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return availableSchools;
  }, [searchTerm, allSchools, userSchools]);

  return (
    <div className="min-h-screen bg-background-dark text-text-dark-primary">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">My Schools</h1>
            <button
              onClick={() => setShowAddSchoolModal(true)}
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90"
            >
              Add School
            </button>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userSchools.map(school => {
              if (!school) {
                return null;
              }
              return (
                <div key={school.name} className="bg-card-dark rounded-lg shadow-lg flex flex-col overflow-hidden">
                    <img src={school.banner} alt={`${school.name} Banner`} className="w-full h-32 object-cover"/>
                    <div className="p-6 flex-grow">
                        <Link to={`/school/${school.name}`}>
                          <h2 className="text-xl font-bold hover:underline">{school.name}</h2>
                        </Link>
                    </div>
                    <div className="p-4 border-t border-border-dark mt-auto">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if(window.confirm(`Are you sure you want to remove ${school.name}?`)) {
                                    handleRemoveSchool(school.name);
                                }
                            }}
                            className="w-full flex justify-center items-center space-x-2 text-red-500 hover:bg-red-500/10 p-2 rounded"
                        >
                            <FaTrash />
                            <span>Remove</span>
                        </button>
                    </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showAddSchoolModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-card-dark p-8 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add a School</h2>
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                placeholder="Search..."
                className="flex-grow p-2 rounded bg-background-dark text-white border border-border-dark"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="max-h-60 overflow-y-auto border border-border-dark rounded">
              {filteredSchools.map(school => (
                <div
                  key={school.name}
                  className={`p-2 cursor-pointer hover:bg-primary/20 ${selectedSchool === school.name ? 'bg-primary' : ''}`}
                  onClick={() => setSelectedSchool(school.name)}
                >
                  {school.name}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowAddSchoolModal(false);
                  setSearchTerm('');
                  setSelectedSchool('');
                }}
                className="mr-2 px-4 py-2 rounded text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSchool}
                disabled={!selectedSchool}
                className="px-4 py-2 rounded text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySchoolsPage;
