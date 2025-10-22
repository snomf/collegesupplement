import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import schoolData from '../../data.json';
import { FaHourglassHalf, FaChevronDown, FaPlus } from 'react-icons/fa';
import Modal from '../components/Modal';

// ... (Placeholder data)
const stats = {
    acceptanceRate: '3.9%',
    avgSAT: '1500-1570',
    avgACT: '34-35',
    questbridgeFinalists: '100+'
};

export default function SchoolDetailPage() {
    const { schoolName } = useParams();
    const [school, setSchool] = useState(null);
    const [supplementsChecklist, setSupplementsChecklist] = useState([]);
    const [otherChecklist, setOtherChecklist] = useState([]);
    const [customDeadlines, setCustomDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDeadlineName, setNewDeadlineName] = useState('');
    const [newDeadlineDate, setNewDeadlineDate] = useState('');

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            const foundSchool = schoolData.find(s => s.college_name === schoolName);
            setSchool({ ...foundSchool, name: foundSchool.college_name, banner: foundSchool.college_banner, description: foundSchool.college_description });

            if (user && foundSchool) {
                // Fetch Checklists
                const { data: checklistData } = await supabase.from('checklists').select('requirements').eq('user_id', user.id).eq('college_name', schoolName).single();

                const initialSupplements = foundSchool.supplements_data.supplements.map(s => ({ name: s.name, status: 'Not Started' }));
                const initialOther = [];
                if (foundSchool.financial_aid.css_required) initialOther.push({ name: 'CSS Profile', status: 'Not Started' });
                if (foundSchool.financial_aid.idoc_or_equivalent) initialOther.push({ name: 'IDOC', status: 'Not Started' });
                initialOther.push({ name: 'FAFSA', status: 'Not Started' });
                initialOther.push({ name: 'Test Score Submitting', status: 'Not Started' });

                if (checklistData) {
                    setSupplementsChecklist(initialSupplements.map(item => checklistData.requirements.find(saved => saved.name === item.name) || item));
                    setOtherChecklist(initialOther.map(item => checklistData.requirements.find(saved => saved.name === item.name) || item));
                } else {
                    setSupplementsChecklist(initialSupplements);
                    setOtherChecklist(initialOther);
                }

                // Fetch Custom Deadlines
                const { data: deadlinesData } = await supabase.from('custom_deadlines').select('*').eq('user_id', user.id).eq('college_name', schoolName);
                setCustomDeadlines(deadlinesData || []);
            }
            setLoading(false);
        };
        fetchAllData();
    }, [schoolName]);

    const handleStatusChange = async (itemName, newStatus, listType) => {
        const updateList = (list) => list.map(item => item.name === itemName ? { ...item, status: newStatus } : item);
        const updatedSupplements = listType === 'supplements' ? updateList(supplementsChecklist) : [...supplementsChecklist];
        const updatedOther = listType === 'other' ? updateList(otherChecklist) : [...otherChecklist];
        setSupplementsChecklist(updatedSupplements);
        setOtherChecklist(updatedOther);

        if (user) {
            await supabase.from('checklists').upsert({ user_id: user.id, college_name: schoolName, requirements: [...updatedSupplements, ...updatedOther] }, { onConflict: ['user_id', 'college_name'] });

            // Log activity
            await supabase.from('recent_activities').insert({
                user_id: user.id,
                activity_type: 'task_update',
                details: `You updated '${itemName}' for ${schoolName} to ${newStatus}.`
            });
        }
    };

    const handleAddDeadline = async (e) => {
        e.preventDefault();
        if (!user || !newDeadlineName || !newDeadlineDate) return;

        const newDeadline = { user_id: user.id, college_name: schoolName, task_name: newDeadlineName, due_date: newDeadlineDate };
        const { data, error } = await supabase.from('custom_deadlines').insert(newDeadline).select();

        if (!error && data) {
            setCustomDeadlines(prev => [...prev, data[0]]);
            setNewDeadlineName('');
            setNewDeadlineDate('');
            setIsModalOpen(false);

            // Log activity
            await supabase.from('recent_activities').insert({
                user_id: user.id,
                activity_type: 'deadline_added',
                details: `You added a deadline for '${newDeadlineName}' at ${schoolName}.`
            });
        }
    };

    const allItems = [...supplementsChecklist, ...otherChecklist];
    const completedCount = allItems.filter(item => item.status === 'Completed').length;
    const totalCount = allItems.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    if (loading || !school) {
        return <div className="bg-background-dark min-h-screen text-white flex items-center justify-center">Loading...</div>;
    }

    return (
        <>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Custom Deadline">
                <form onSubmit={handleAddDeadline} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Task Name</label>
                        <input type="text" value={newDeadlineName} onChange={e => setNewDeadlineName(e.target.value)} required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg mt-1 px-4 py-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Due Date</label>
                        <input type="date" value={newDeadlineDate} onChange={e => setNewDeadlineDate(e.target.value)} required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg mt-1 px-4 py-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Add Deadline</button>
                </form>
            </Modal>

            <div className="bg-background-dark min-h-screen text-white font-sans">
                {/* ... (Header/Banner) ... */}
                 <div className="relative h-64">
                <img src={school.banner} alt={`${school.name} Banner`} className="w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8">
                    <Link to="/my-schools" className="text-blue-400 hover:underline text-sm">&lt; My Schools</Link>
                    <h1 className="text-5xl font-bold mt-2">{school.name}</h1>
                </div>
            </div>


                <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Section title="Upcoming Deadlines">
                           <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-gray-800 text-gray-300 font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors mb-4">
                                <FaPlus /> Add Custom Deadline
                            </button>
                            {customDeadlines.map(d => (
                                <div key={d.id} className="bg-card-dark p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold">{d.task_name}</p>
                                        <p className="text-sm text-gray-400">{new Date(d.due_date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-yellow-400">
                                        <FaHourglassHalf />
                                        <span>{Math.ceil((new Date(d.due_date) - new Date()) / (1000 * 60 * 60 * 24))} days left</span>
                                    </div>
                                </div>
                            ))}
                        </Section>

                        {/* ... (Other sections) ... */}
                        <Section title="Overall Progress">
                        <div className="text-center">
                            <p className="text-3xl font-bold">{completedCount}/{totalCount} Completed</p>
                            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-3"><div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div>
                        </div>
                    </Section>
                     <Section title="Supplements Checklist">
                        <div className="space-y-3">
                            {supplementsChecklist.map(item => <ChecklistItem key={item.name} item={item} onStatusChange={(status) => handleStatusChange(item.name, status, 'supplements')} />)}
                        </div>
                    </Section>

                    <Section title="Other Checklist">
                        <div className="space-y-3">
                            {otherChecklist.map(item => <ChecklistItem key={item.name} item={item} onStatusChange={(status) => handleStatusChange(item.name, status, 'other')} />)}
                        </div>
                    </Section>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                       {/* ... (At a Glance section) ... */}
                        <div className="bg-card-dark p-6 rounded-xl">
                        <h2 className="text-xl font-bold mb-4 flex justify-between items-center">{school.name} at a Glance <FaChevronDown /></h2>
                        <InfoSection title="Admissions Stats">
                           <InfoItem label="Acceptance Rate" value={stats.acceptanceRate} />
                        <InfoItem label="Average SAT" value={stats.avgSAT} />
                        <InfoItem label="Average ACT" value={stats.avgACT} />
                        <InfoItem label="QuestBridge Finalists Admitted" value={stats.questbridgeFinalists} />
                        </InfoSection>
                        <p className="text-sm text-gray-400 mt-6">{school.description}</p>
                    </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ... (Supporting components)
const ChecklistItem = ({ item, onStatusChange }) => {
    const statusStyles = {
        'Not Started': 'border-red-500/50 text-red-400',
        'In Progress': 'border-yellow-500/50 text-yellow-400',
        'Completed': 'border-green-500/50 text-green-400 line-through',
    };
    return (
        <div className={`bg-gray-800 p-4 rounded-lg flex justify-between items-center border-l-4 ${statusStyles[item.status]}`}>
            <p className="flex-grow">{item.name}</p>
            <select
                value={item.status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="bg-gray-700 border-none rounded-md text-white focus:ring-2 focus:ring-blue-500"
            >
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
            </select>
        </div>
    );
};
const Section = ({ title, children }) => (
    <div className="bg-card-dark p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {children}
    </div>
);
const InfoSection = ({ title, children }) => (
    <div className="border-b border-gray-700 py-4 last:border-b-0">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <div className="space-y-2">{children}</div>
    </div>
);
const InfoItem = ({ label, value }) => (
    <div className="flex justify-between text-sm">
        <p className="text-gray-400">{label}:</p>
        <p className="font-medium text-right">{value}</p>
    </div>
);
