import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import schoolData from '../../data.json';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function SchoolDetailPage() {
  const { schoolName } = useParams();
  const [school, setSchool] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchSchoolData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const foundSchool = schoolData.find(s => s.college_name === schoolName);
      setSchool(foundSchool);

      if (user && foundSchool) {
        const { data, error } = await supabase
          .from('checklists')
          .select('requirements')
          .eq('user_id', user.id)
          .eq('college_name', schoolName)
          .single();

        if (data) {
          setChecklist(data.requirements);
        } else {
          // Initialize checklist if not found
          const initialChecklist = foundSchool.supplements_data.supplements.map(s => ({ name: s.name, completed: false }));
          setChecklist(initialChecklist);
        }
      }
      setLoading(false);
    };

    fetchSchoolData();
  }, [schoolName]);

  const handleChecklistChange = async (itemName, completed) => {
    const updatedChecklist = checklist.map(item =>
      item.name === itemName ? { ...item, completed } : item
    );
    setChecklist(updatedChecklist);

    if (user) {
      const { error } = await supabase.from('checklists').upsert({
        user_id: user.id,
        college_name: schoolName,
        requirements: updatedChecklist,
      }, { onConflict: ['user_id', 'college_name'] });

      if (error) {
        console.error('Error updating checklist:', error);
      }
    }
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="flex min-h-screen bg-background-dark text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 lg:p-10">
          {loading ? (
            <p>Loading...</p>
          ) : school ? (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Link to="/dashboard" className="text-primary hover:underline text-sm font-medium">My Schools</Link>
                <span className="material-symbols-outlined text-gray-500">chevron_right</span>
                <span className="text-sm font-medium">{school.college_name}</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight mb-8">{school.college_name}</h1>

              <div className="mb-12">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Overall Progress</h2>
                  <span className="font-medium">{completedCount}/{totalCount} Completed</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div className="bg-primary h-4 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
              </div>

              <h2 className="text-xl font-bold mb-4">Supplements Checklist</h2>
              <div className="space-y-4">
                {checklist.map((item) => (
                  <div key={item.name} className="bg-card-dark p-4 rounded-xl border border-border-dark flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) => handleChecklistChange(item.name, e.target.checked)}
                        className="form-checkbox h-5 w-5 text-primary rounded border-gray-600 bg-card-dark focus:ring-primary"
                      />
                      <span className={`font-medium ${item.completed ? 'text-gray-400 line-through' : ''}`}>
                        {item.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>School not found.</p>
          )}
        </main>
      </div>
    </div>
  );
}
