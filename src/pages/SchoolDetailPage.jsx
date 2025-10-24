import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import * as localStore from '../lib/localStorage';
import allSchoolsData from '../data.json';
import { format, parseISO } from 'date-fns';

const SchoolDetailPage = () => {
  const { schoolName } = useParams();
  const [school, setSchool] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [customDeadlines, setCustomDeadlines] = useState([]);
  const [showAddDeadlineModal, setShowAddDeadlineModal] = useState(false);
  const [newDeadlineName, setNewDeadlineName] = useState('');
  const [newDeadlineDate, setNewDeadlineDate] = useState('');

  useEffect(() => {
    const currentSchool = allSchoolsData.find(s => s.name === schoolName);
    setSchool(currentSchool);
    setChecklist(localStore.getChecklist(schoolName));
    setCustomDeadlines(localStore.getCustomDeadlines().filter(d => d.school_name === schoolName));
  }, [schoolName]);

  const handleStatusChange = (itemId, newStatus) => {
    localStore.updateChecklistItem(schoolName, itemId, newStatus);
    setChecklist(localStore.getChecklist(schoolName));
    if(newStatus === 'Completed') {
        const item = checklist.find(i => i.id === itemId);
        localStore.addRecentActivity({
            activity_description: `Submitted <b>${item.item}</b> for ${schoolName}.`,
            created_at: new Date().toISOString()
        });
    }
  };

  const handleAddDeadline = () => {
    if (newDeadlineName && newDeadlineDate) {
      const newDeadline = {
        school_name: schoolName,
        deadline_name: newDeadlineName,
        date: newDeadlineDate
      };
      localStore.addCustomDeadline(newDeadline);
      setCustomDeadlines(localStore.getCustomDeadlines().filter(d => d.school_name === schoolName));
      setShowAddDeadlineModal(false);
      setNewDeadlineName('');
      setNewDeadlineDate('');
    }
  };

  const progress = useMemo(() => {
    if (!checklist || checklist.length === 0) return 0;
    const completed = checklist.filter(item => item.status === 'Completed').length;
    return Math.round((completed / checklist.length) * 100);
  }, [checklist]);

  if (!school) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-background-dark text-text-dark-primary">
      <img src={school.banner} alt={`${school.name} banner`} className="w-full h-64 object-cover" />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold">{school.name}</h1>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card-dark p-6 rounded-lg">
              <h2 className="text-2xl font-bold">Supplement Checklist</h2>
              <div className="mt-4">
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-right text-sm text-text-dark-secondary mt-1">{progress}% Complete</p>
              </div>
              <div className="mt-4 space-y-4">
                  {checklist.map(item => (
                      <div key={item.id} className="bg-background-dark p-4 rounded-lg flex justify-between items-center">
                          <p>{item.item}</p>
                          <select value={item.status} onChange={(e) => handleStatusChange(item.id, e.target.value)} className="bg-border-dark text-white p-2 rounded">
                              <option>Not Started</option><option>In Progress</option><option>Completed</option>
                          </select>
                      </div>
                  ))}
              </div>
            </div>
            <div className="bg-card-dark p-6 rounded-lg mt-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Custom Deadlines</h2>
                <button onClick={() => setShowAddDeadlineModal(true)} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90">Add Deadline</button>
              </div>
              <div className="mt-4 space-y-4">
                {customDeadlines.map((d,i) => (<div key={i} className="bg-background-dark p-4 rounded-lg"><p className="font-semibold">{d.deadline_name}</p><p className="text-text-dark-secondary">{format(parseISO(d.date), 'MMMM d, yyyy')}</p></div>))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showAddDeadlineModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"><div className="bg-card-dark p-8 rounded-lg w-full max-w-md"><h2 className="text-2xl font-bold mb-4">Add Custom Deadline</h2><input type="text" placeholder="Deadline Name" value={newDeadlineName} onChange={(e) => setNewDeadlineName(e.target.value)} className="w-full p-2 mb-4 rounded bg-background-dark text-white border border-border-dark" /><input type="date" value={newDeadlineDate} onChange={(e) => setNewDeadlineDate(e.target.value)} className="w-full p-2 mb-4 rounded bg-background-dark text-white border border-border-dark" /><div className="mt-4 flex justify-end"><button onClick={() => setShowAddDeadlineModal(false)} className="mr-2 px-4 py-2 rounded text-sm font-medium">Cancel</button><button onClick={handleAddDeadline} className="px-4 py-2 rounded text-sm font-medium text-white bg-primary hover:bg-primary/90">Add</button></div></div></div>)}
    </div>
  );
};

export default SchoolDetailPage;
