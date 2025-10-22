import React from 'react';
import { FaBell, FaCheckCircle, FaPlusCircle, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const upcomingDeadlines = [
  { id: 1, school: 'Princeton University', task: 'Financial Aid Application', timeLeft: '2 days left', iconColor: 'text-yellow-400' },
  { id: 2, school: 'Yale University', task: 'Writing Supplement', timeLeft: '5 days left', iconColor: 'text-orange-400' },
  { id: 3, school: 'Stanford University', task: 'Portfolio Submission', timeLeft: '1 week left', iconColor: 'text-red-400' },
];

const recentActivity = [
  { id: 1, type: 'submission', text: 'You submitted the Writing Supplement for Columbia University.', time: '2d ago', icon: <FaCheckCircle className="text-green-500" /> },
  { id: 2, type: 'submission', text: 'You submitted the Financial Aid Application for Duke University.', time: '3d ago', icon: <FaCheckCircle className="text-green-500" /> },
  { id: 3, type: 'addition', text: 'You added Massachusetts Institute of Technology to your school list.', time: '5d ago', icon: <FaPlusCircle className="text-blue-500" /> },
];

export default function DashboardPage() {
    const navigate = useNavigate();

  return (
    <div className="bg-background-dark min-h-screen text-white font-sans p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold">Welcome, Alex!</h1>
          <p className="text-gray-400 mt-2">Here's a quick overview of your application progress.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Upcoming Deadlines */}
          <div className="md:col-span-2">
            <div className="bg-card-dark p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Upcoming Deadlines</h2>
                <button className="text-blue-400 hover:underline flex items-center gap-1">
                  View all <FaArrowRight />
                </button>
              </div>
              <div className="space-y-4">
                {upcomingDeadlines.map(deadline => (
                  <div key={deadline.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <FaBell className={`w-6 h-6 ${deadline.iconColor}`} />
                      <div>
                        <p className="font-semibold">{deadline.school}</p>
                        <p className="text-sm text-gray-400">{deadline.task}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{deadline.timeLeft}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: My Schools & Progress */}
          <div className="md:col-span-1 space-y-8">
            <div className="bg-card-dark p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-4">My Schools</h2>
              <div className="text-center">
                <p className="text-5xl font-bold text-blue-400">9/12</p>
                <p className="text-gray-400 mt-2">applications completed</p>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                  <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
                 <button
                    onClick={() => navigate('/my-schools')}
                    className="mt-6 w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    View My Schools
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Activity */}
        <div className="mt-8 bg-card-dark p-6 rounded-xl">
           <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Recent Activity</h2>
                <button className="text-blue-400 hover:underline flex items-center gap-1">
                  View all <FaArrowRight />
                </button>
              </div>
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {recentActivity.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== recentActivity.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-700" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center ring-8 ring-card-dark">
                          {activity.icon}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-300">{activity.text}</p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time>{activity.time}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
