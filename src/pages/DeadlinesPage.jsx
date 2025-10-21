import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import schoolData from '../../data.json';

function DeadlinesPage() {
    const [deadlines, setDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeadlines = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: userSchools, error } = await supabase
                    .from('user_schools')
                    .select('college_name')
                    .eq('user_id', user.id);

                if (error) {
                    console.error('Error fetching user schools', error);
                    return;
                }

                const schoolNames = userSchools.map(s => s.college_name);
                const allDeadlines = schoolData
                    .filter(s => schoolNames.includes(s.college_name))
                    .flatMap(s => (
                        s.supplements_data.supplements.map(sup => ({
                            college: s.college_name,
                            name: sup.name,
                            // Placeholder date, will be editable
                            date: new Date(new Date().getFullYear(), 10, 1),
                        }))
                    ));

                // Add financial aid deadlines
                schoolData
                    .filter(s => schoolNames.includes(s.college_name) && s.financial_aid.css_required)
                    .forEach(s => {
                        allDeadlines.push({
                            college: s.college_name,
                            name: 'CSS Profile',
                            date: new Date(new Date().getFullYear(), 10, 15),
                        });
                    });

                setDeadlines(allDeadlines.sort((a, b) => a.date - b.date));
            }
            setLoading(false);
        };
        fetchDeadlines();
    }, []);

    const calculateDaysLeft = (date) => {
        const diff = date.getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="flex min-h-screen bg-background-dark text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 p-6 lg:p-10">
                    <h1 className="text-3xl font-black tracking-tight mb-6">Upcoming Deadlines</h1>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="space-y-4">
                            {deadlines.map((deadline, index) => (
                                <div key={index} className="bg-card-dark p-4 rounded-xl border border-border-dark">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-lg">{deadline.college}</p>
                                            <p className="text-sm text-gray-400">{deadline.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-lg">{deadline.date.toLocaleDateString()}</p>
                                            <p className="text-sm text-yellow-500">{calculateDaysLeft(deadline.date)} days left</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default DeadlinesPage;
