import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { format, parseISO } from 'date-fns';

const DashboardPage = ({ session }) => {
  const [deadlines, setDeadlines] = useState([]);
  const [activities, setActivities] = useState([]);
  const [checklistItems, setChecklistItems] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Fetch upcoming deadlines
      const { data: deadlinesData, error: deadlinesError } = await supabase
        .from('custom_deadlines')
        .select('*')
        .eq('user_id', session.user.id)
        .order('deadline_date', { ascending: true })
        .limit(5);

      if (deadlinesError) console.error('Error fetching deadlines:', deadlinesError);
      else setDeadlines(deadlinesData);

      // Fetch recent activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('recent_activities')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (activitiesError) console.error('Error fetching activities:', activitiesError);
      else setActivities(activitiesData);

      // Fetch all checklist items for progress calculation
      const { data: checklistData, error: checklistError } = await supabase
        .from('checklists')
        .select('status')
        .eq('user_id', session.user.id);

      if(checklistError) console.error('Error fetching checklist items:', checklistError);
      else setChecklistItems(checklistData);
    };

    fetchDashboardData();
  }, [session]);

  const overallProgress = useMemo(() => {
    if (checklistItems.length === 0) return { completed: 0, total: 0, percentage: 0 };
    const completed = checklistItems.filter(item => item.status === 'Completed').length;
    const total = checklistItems.length;
    const percentage = Math.round((completed / total) * 100);
    return { completed, total, percentage };
  }, [checklistItems]);

  return (
    <div className="min-h-screen bg-background-dark text-text-dark-primary">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-4 text-lg">
          Welcome back, {session.user.user_metadata.display_name}!
        </p>

        {/* Overall Progress */}
        <div className="mt-8 bg-card-dark p-6 rounded-lg">
          <h2 className="text-2xl font-bold">Overall Progress</h2>
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div className="bg-primary h-4 rounded-full" style={{ width: `${overallProgress.percentage}%` }}></div>
            </div>
            <p className="text-right text-sm text-text-dark-secondary mt-1">
              {overallProgress.completed} / {overallProgress.total} tasks completed
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upcoming Deadlines */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Upcoming Deadlines</h2>
            <div className="space-y-4">
              {deadlines.length > 0 ? deadlines.map(d => (
                <div key={d.id} className="bg-card-dark p-4 rounded-lg">
                  <p className="font-semibold">{d.deadline_name}</p>
                  <p className="text-text-dark-secondary">{format(parseISO(d.deadline_date), 'MMMM d, yyyy')}</p>
                </div>
              )) : <p className="text-text-dark-secondary">No upcoming deadlines.</p>}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {activities.length > 0 ? activities.map(a => (
                <div key={a.id} className="bg-card-dark p-4 rounded-lg">
                  <p>{a.activity_description}</p>
                  <p className="text-sm text-text-dark-secondary">{format(parseISO(a.created_at), 'Pp')}</p>
                </div>
              )) : <p className="text-text-dark-secondary">No recent activity.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
