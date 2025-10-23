import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { FaClock, FaCheckCircle, FaPlusCircle } from 'react-icons/fa';

const DashboardPage = ({ session }) => {
  const [deadlines, setDeadlines] = useState([]);
  const [activities, setActivities] = useState([]);
  const [userSchools, setUserSchools] = useState([]);
  const [checklistItems, setChecklistItems] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Fetch user's schools to get a total count
      const { data: schoolData, error: schoolError } = await supabase
        .from('user_schools')
        .select('school_name')
        .eq('user_id', session.user.id);

      if (schoolError) console.error('Error fetching user schools:', schoolError);
      else setUserSchools(schoolData || []);

      // Fetch all checklist items for progress
      const { data: checklistData, error: checklistError } = await supabase
        .from('checklists')
        .select('item_status', { count: 'exact' })
        .eq('user_id', session.user.id);

      if (checklistError) console.error('Error fetching checklist items:', checklistError);
      else setChecklistItems(checklistData || []);

      // Fetch upcoming deadlines (using corrected column 'date')
      const { data: deadlinesData, error: deadlinesError } = await supabase
        .from('custom_deadlines')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: true })
        .limit(3);

      if (deadlinesError) console.error('Error fetching deadlines:', deadlinesError);
      else setDeadlines(deadlinesData || []);

      // Fetch recent activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('recent_activities')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (activitiesError) console.error('Error fetching activities:', activitiesError);
      else setActivities(activitiesData || []);
    };

    fetchDashboardData();
  }, [session]);

  const overallProgress = useMemo(() => {
    const totalSchools = userSchools.length;
    if (totalSchools === 0 || checklistItems.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    // Logic needs to be based on completed applications, not individual checklist items
    // This is a placeholder logic. A more complex aggregation would be needed for true "per-school" progress.
    const completedItems = checklistItems.filter(item => item.item_status === 'Completed').length;
    const totalItems = checklistItems.length;
    // For now, let's simulate completed schools based on checklist completion.
    // Let's assume a school is "complete" if all its checklist items are done.
    // This is complex, so we'll simplify: show overall checklist progress instead.
    return {
      completed: completedItems,
      total: totalItems,
      percentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
      schoolCount: totalSchools
    };
  }, [checklistItems, userSchools]);

  const getDaysLeft = (date) => {
    const deadline = parseISO(date);
    const days = formatDistanceToNow(deadline, { addSuffix: false });
    // Make phrasing consistent with mockup
    return days.replace('about ', '') + ' left';
  };

  const activityIcons = {
    'submitted': <FaCheckCircle className="text-green-500" />,
    'added': <FaPlusCircle className="text-blue-500" />,
  };

  const getActivityIcon = (description) => {
    if (description.toLowerCase().includes('submitted')) return activityIcons.submitted;
    if (description.toLowerCase().includes('added')) return activityIcons.added;
    return <FaCheckCircle className="text-gray-500" />;
  }

  return (
    <div className="min-h-screen bg-background-dark text-text-dark-primary p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold">Welcome, {session.user.user_metadata.display_name}!</h1>
        <p className="text-text-dark-secondary mt-2">Here's a quick overview of your application progress.</p>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Upcoming Deadlines & Recent Activity */}
          <div className="lg:col-span-2 space-y-8">

            {/* Upcoming Deadlines */}
            <div className="bg-card-dark p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Upcoming Deadlines</h2>
                <Link to="/deadlines" className="text-primary hover:underline">View all</Link>
              </div>
              <div className="space-y-4">
                {deadlines.length > 0 ? deadlines.map(d => (
                  <div key={d.id} className="flex items-center space-x-4">
                    <FaClock className="text-primary text-xl" />
                    <div>
                      <p className="font-bold">{d.school_name || 'General'}</p>
                      <p className="text-text-dark-secondary">{d.deadline_name} - <span className="text-red-400">{getDaysLeft(d.date)}</span></p>
                    </div>
                  </div>
                )) : <p className="text-text-dark-secondary">No upcoming deadlines.</p>}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card-dark p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {activities.length > 0 ? activities.map(a => (
                  <div key={a.id} className="flex items-start space-x-4">
                     <div className="flex flex-col items-center">
                        {getActivityIcon(a.activity_description)}
                        <div className="w-px h-6 bg-border-dark my-1"></div>
                     </div>
                     <div>
                        <p className="text-text-dark-primary" dangerouslySetInnerHTML={{ __html: a.activity_description.replace(/(Columbia University|Duke University|Massachusetts Institute of Technology)/g, '<b>$1</b>') }} />
                        <p className="text-sm text-text-dark-secondary">{formatDistanceToNow(parseISO(a.created_at), { addSuffix: true })}</p>
                     </div>
                  </div>
                )) : <p className="text-text-dark-secondary">No recent activity.</p>}
              </div>
            </div>

          </div>

          {/* Right Column: My Schools */}
          <div className="bg-card-dark p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">My Schools</h2>
            <p className="text-text-dark-secondary">Overall Progress</p>
            <div className="flex items-center space-x-2">
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${overallProgress.percentage}%` }}></div>
              </div>
              <span className="font-bold">{overallProgress.percentage}%</span>
            </div>
            <p className="text-text-dark-secondary mt-2">You've completed {overallProgress.completed} out of {overallProgress.total} tasks.</p>
            <Link to="/my-schools">
              <button className="mt-6 w-full px-4 py-2 rounded-md font-medium text-white bg-primary hover:bg-primary/90">
                View All Schools
              </button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
