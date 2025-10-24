import { useState, useEffect, useMemo } from 'react';
import * as localStore from '../lib/localStorage';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { FaClock, FaCheckCircle, FaPlusCircle } from 'react-icons/fa';

const DashboardPage = () => {
  const [deadlines, setDeadlines] = useState([]);
  const [activities, setActivities] = useState([]);
  const [userSchools, setUserSchools] = useState([]);
  const [checklistItems, setChecklistItems] = useState([]);

  useEffect(() => {
    const fetchDashboardData = () => {
      const data = localStore.getAllData();
      setUserSchools(data.userSchools || []);

      const allChecklistItems = Object.values(data.checklists || {}).flat();
      setChecklistItems(allChecklistItems);

      setDeadlines(data.customDeadlines.slice(0, 3) || []);
      setActivities(data.recentActivities.slice(-3).reverse() || []);
    };

    fetchDashboardData();
  }, []);

  const overallProgress = useMemo(() => {
    const totalSchools = userSchools.length;
    if (totalSchools === 0 || checklistItems.length === 0) {
      return { completed: 0, total: 0, percentage: 0, schoolCount: 0 };
    }
    const completedItems = checklistItems.filter(item => item.status === 'Completed').length;
    const totalItems = checklistItems.length;
    return {
      completed: completedItems,
      total: totalItems,
      percentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
      schoolCount: totalSchools
    };
  }, [checklistItems, userSchools]);

  const getDaysLeft = (date) => {
    try {
        const deadline = parseISO(date);
        const days = formatDistanceToNow(deadline, { addSuffix: false });
        return days.replace('about ', '') + ' left';
    } catch (error) {
        return "Invalid date";
    }
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
        <h1 className="text-4xl font-bold">Welcome to Questrack!</h1>
        <p className="text-text-dark-secondary mt-2">Here's a quick overview of your application progress.</p>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-8">

            <div className="bg-card-dark p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Upcoming Deadlines</h2>
                <Link to="/my-schools" className="text-primary hover:underline">View all</Link>
              </div>
              <div className="space-y-4">
                {deadlines.length > 0 ? deadlines.map((d, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <FaClock className="text-primary text-xl" />
                    <div>
                      <p className="font-bold">{d.school_name || 'General'}</p>
                      <p className="text-text-dark-secondary">{d.deadline_name} - <span className="text-red-400">{getDaysLeft(d.date)}</span></p>
                    </div>
                  </div>
                )) : <p className="text-text-dark-secondary">No upcoming deadlines.</p>}
              </div>
            </div>

            <div className="bg-card-dark p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {activities.length > 0 ? activities.map((a, i) => (
                   <div key={i} className="flex items-start space-x-4">
                     <div className="flex flex-col items-center">
                        {getActivityIcon(a.activity_description)}
                        <div className="w-px h-6 bg-border-dark my-1"></div>
                     </div>
                     <div>
                        <p className="text-text-dark-primary" dangerouslySetInnerHTML={{ __html: a.activity_description.replace(/(Columbia University|Duke University|Massachusetts Institute of Technology)/g, '<b>$1</b>') }} />
                        <p className="text-sm text-text-dark-secondary">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</p>
                     </div>
                  </div>
                )) : <p className="text-text-dark-secondary">No recent activity.</p>}
              </div>
            </div>

          </div>

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
