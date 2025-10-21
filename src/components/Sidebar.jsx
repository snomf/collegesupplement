import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="flex flex-col w-64 bg-card-dark shadow-md">
      <div className="flex items-center gap-3 p-4 border-b border-gray-700">
        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCVcIcsskCv012j5z6jntSz93VdX7e-w17mBjY32OCMe0T0tRsAqJR-s6YDRAVRnnQysOSt8f0dqn24S6EPpp8KIVhpPfsYrQLWnso6aXEBG_K85EU2aCdHKgi9y2bhUNf5SvWxT1Yq-cpjnLEFvUPlX7RbKw-n9YeYaR1kKTDCRbmkiRw_hVziLTZ-6Pkg3UcH3hmaLZZ-xv8VJ5N3qH3ocpRNiNAHGQcKPBoDZssKrdabA-BfM4bG9Sp_-oBIlYIT1SZpF_HuSDo')" }}></div>
        <h1 className="text-lg font-bold text-white">QuestBridge</h1>
      </div>
      <nav className="flex flex-col gap-2 p-4">
        <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg ${isActive ? 'bg-primary/20 text-white' : 'hover:bg-gray-800 text-gray-300'}`}>
          <span className="material-symbols-outlined">school</span>
          <p className="text-sm font-medium">My Schools</p>
        </NavLink>
        <NavLink to="/checklists" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg ${isActive ? 'bg-primary/20 text-white' : 'hover:bg-gray-800 text-gray-300'}`}>
          <span className="material-symbols-outlined">checklist</span>
          <p className="text-sm font-medium">Checklists</p>
        </NavLink>
        <NavLink to="/deadlines" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg ${isActive ? 'bg-primary/20 text-white' : 'hover:bg-gray-800 text-gray-300'}`}>
          <span className="material-symbols-outlined">calendar_today</span>
          <p className="text-sm font-medium">Deadlines</p>
        </NavLink>
      </nav>
    </aside>
  );
}
