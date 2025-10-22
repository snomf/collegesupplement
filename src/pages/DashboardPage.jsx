import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaBell, FaCheckCircle, FaPlusCircle, FaArrowRight, FaSchool, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [deadlines, setDeadlines] = useState([]);
  const [activities, setActivities] = useState([]);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch Nickname
        const { data: profile } = await supabase.from('profiles').select('nickname').eq('id', user.id).single();
        if (profile) setNickname(profile.nickname);

        // Fetch Upcoming Deadlines
        const { data: deadlinesData } = await supabase.from('custom_deadlines').select('*').eq('user_id', user.id).order('due_date', { ascending: true }).limit(3);
        setDeadlines(deadlinesData || []);

        // Fetch Recent Activities
        const { data: activitiesData } = await supabase.from('recent_activities').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5);
        setActivities(activitiesData || []);

        // Calculate Progress
        const { data: checklistsData } = await supabase.from('checklists').select('requirements').eq('user_id', user.id);
        if (checklistsData) {
            let total = 0;
            let completed = 0;
            checklistsData.forEach(checklist => {
                total += checklist.requirements.length;
                completed += checklist.requirements.filter(r => r.status === 'Completed').length;
            });
            setProgress({ completed, total });
        }
      }
      setLoading(false);
    };
    fetchDashboardData();
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
        case 'school_added': return <FaSchool className="text-blue-500" />;
        case 'school_removed': return <FaTrash className="text-red-500" />;
        case 'task_update': return <FaCheckCircle className="text-green-500" />;
        case 'deadline_added': return <FaPlusCircle className="text-purple-500" />;
        default: return <FaBell className="text-gray-500" />;
    }
  }

  const progressPercentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  return (
    <div className="bg-background-dark min-h-screen text-white font-sans p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold">Welcome, {nickname || 'User'}!</h1>
          <p className="text-gray-400 mt-2">Here's a quick overview of your application progress.</p>
        </header>

        {loading ? <p>Loading dashboard...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-card-dark p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-4">Upcoming Deadlines</h2>
              <div className="space-y-4">
                {deadlines.length > 0 ? deadlines.map(d => (
                  <div key={d.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FaBell className="w-6 h-6 text-yellow-400" />
                      <div>
                        <p className="font-semibold">{d.college_name}</p>
                        <p className="text-sm text-gray-400">{d.task_name}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{formatDistanceToNow(new Date(d.due_date), { addSuffix: true })}</p>
                  </div>
                )) : <p className="text-gray-400">No upcoming deadlines.</p>}
              </div>
            </div>
          </div>

          <div className="md:col-span-1 space-y-8">
            <div className="bg-card-dark p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-4">Overall Progress</h2>
              <div className="text-center">
                <p className="text-5xl font-bold text-blue-400">{progress.completed}/{progress.total}</p>
                <p className="text-gray-400 mt-2">tasks completed</p>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                  <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                 <button onClick={() => navigate('/my-schools')} className="mt-6 w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">View My Schools</button>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 mt-8 bg-card-dark p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            {activities.length > 0 ? (
            <ul role="list" className="-mb-8">
              {activities.map((activity, idx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {idx !== activities.length - 1 ? <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-700" /> : null}
                    <div className="relative flex space-x-3">
                      <span className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center ring-8 ring-card-dark">{getActivityIcon(activity.activity_type)}</span>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <p className="text-sm text-gray-300">{activity.details}</p>
                        <time className="text-right text-sm whitespace-nowrap text-gray-500">{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</time>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            ) : <p className="text-gray-400">No recent activity.</p>}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
