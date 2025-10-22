import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import schoolData from '../../data.json';
import { FaHourglassHalf, FaCheck, FaTimes, FaChevronDown, FaPhone, FaGlobe } from 'react-icons/fa';

// Placeholder data for sections not covered in data.json
const deadlines = [
    { name: 'QuestBridge National College Match', daysLeft: 21, date: 'November 1, 2024' }
];

const stats = {
    acceptanceRate: '3.9%',
    avgSAT: '1500-1570',
    avgACT: '34-35',
    questbridgeFinalists: '100+'
};

// ... (other placeholder data remains the same)
const financialAid = {
    avgPackage: '$76,951',
    studentsOnAid: '70%',
    tuitionCoverage: 'Covers 100% of tuition for families with income under $100k',
    qsnChapter: 'Yes'
};

const campusLife = {
    population: '17,246',
    popularMajors: 'Computer Science, Economics, Human Biology',
    highlights: 'Cantor Arts Center, Hoover Tower, The Oval, Rodin Sculpture Garden',
    location: 'Stanford, California'
};

const contactInfo = {
    admissions: '(650) 723-2091',
    financialAid: '(866) 246-1828',
    website: 'stanford.edu'
};


export default function SchoolDetailPage() {
    const { schoolName } = useParams();
    const [school, setSchool] = useState(null);
    const [checklist, setChecklist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchSchoolData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            const foundSchool = schoolData.find(s => s.college_name === schoolName);
            setSchool({
                ...foundSchool,
                name: foundSchool.college_name,
                banner: foundSchool.college_banner,
                description: foundSchool.college_description,
            });

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
            await supabase.from('checklists').upsert({
                user_id: user.id,
                college_name: schoolName,
                requirements: updatedChecklist,
            }, { onConflict: ['user_id', 'college_name'] });
        }
    };

    const completedCount = checklist.filter(item => item.completed).length;
    const totalCount = checklist.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    if (loading || !school) {
        return <div className="bg-background-dark min-h-screen text-white flex items-center justify-center">Loading school details...</div>;
    }

    return (
        <div className="bg-background-dark min-h-screen text-white font-sans">
            {/* Header and Banner */}
            <div className="relative h-64">
                <img src={school.banner} alt={`${school.name} Banner`} className="w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8">
                    <div className="flex items-center gap-2 mb-2 text-sm">
                        <Link to="/my-schools" className="text-blue-400 hover:underline">My Schools</Link>
                        <span>&gt;</span>
                        <span>{school.name}</span>
                    </div>
                    <h1 className="text-5xl font-bold">{school.name}</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* ... (Deadlines section remains the same) ... */}
                     <Section title="Upcoming Deadlines">
                    {deadlines.map(d => (
                        <div key={d.name} className="bg-card-dark p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-bold">{d.name}</p>
                                <p className="text-sm text-gray-400">{d.date}</p>
                            </div>
                            <div className="flex items-center gap-2 text-yellow-400">
                                <FaHourglassHalf />
                                <span>{d.daysLeft} days left</span>
                            </div>
                        </div>
                    ))}
                </Section>

                    {/* Progress */}
                    <Section title="Overall Progress">
                        <div className="text-center">
                            <p className="text-3xl font-bold">{completedCount}/{totalCount} Completed</p>
                            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-3">
                                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    </Section>

                    {/* Checklist */}
                    <Section title="Supplements Checklist">
                        <div className="space-y-3">
                            {checklist.map((item) => (
                                <div key={item.name} className="bg-gray-800 p-4 rounded-lg flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={item.completed}
                                        onChange={(e) => handleChecklistChange(item.name, e.target.checked)}
                                        className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600"
                                    />
                                    <label className="ml-3 text-white">{item.name}</label>
                                </div>
                            ))}
                        </div>
                    </Section>
                </div>

                {/* Side Content: At a Glance */}
                <div className="lg:col-span-1 space-y-6">
                <div className="bg-card-dark p-6 rounded-xl">
                    <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
                        {school.name} at a Glance <FaChevronDown />
                    </h2>

                    <InfoSection title="Admissions Stats">
                        <InfoItem label="Acceptance Rate" value={stats.acceptanceRate} />
                        <InfoItem label="Average SAT" value={stats.avgSAT} />
                        <InfoItem label="Average ACT" value={stats.avgACT} />
                        <InfoItem label="QuestBridge Finalists Admitted" value={stats.questbridgeFinalists} />
                    </InfoSection>

                    <InfoSection title="Financial Aid">
                        <InfoItem label="Average Aid Package" value={financialAid.avgPackage} />
                        <InfoItem label="Students on Aid" value={financialAid.studentsOnAid} />
                        <InfoItem label="Tuition Coverage" value={financialAid.tuitionCoverage} />
                        <InfoItem label="QuestBridge Scholars Network Chapter" value={financialAid.qsnChapter} />
                    </InfoSection>

                    <InfoSection title="Campus Life">
                        <InfoItem label="Student Population" value={campusLife.population} />
                        <InfoItem label="Popular Majors" value={campusLife.popularMajors} />
                        <InfoItem label="Campus Highlights" value={campusLife.highlights} />
                        <InfoItem label="Location" value={campusLife.location} />
                    </InfoSection>

                    <InfoSection title="Contact Information">
                        <ContactItem icon={<FaPhone />} label="Admissions Office" value={contactInfo.admissions} />
                        <ContactItem icon={<FaPhone />} label="Financial Aid Office" value={contactInfo.financialAid} />
                        <ContactItem icon={<FaGlobe />} label="Website" value={contactInfo.website} isLink />
                    </InfoSection>

                    <p className="text-sm text-gray-400 mt-6">{school.description}</p>
                </div>
            </div>
            </div>
        </div>
    );
}

// ... (Section, InfoSection, InfoItem, ContactItem components remain the same) ...
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

const ContactItem = ({ icon, label, value, isLink }) => (
     <div className="flex items-start text-sm mt-2">
        <div className="text-gray-400 mr-2">{icon}</div>
        <div>
            <p className="text-gray-400">{label}</p>
            {isLink ? (
                <a href={`https://${value}`} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">{value}</a>
            ) : (
                <p className="font-medium">{value}</p>
            )}
        </div>
    </div>
);
