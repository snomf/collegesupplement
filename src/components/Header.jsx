import { supabase } from '../supabaseClient';

export default function Header() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-700 px-10 py-3 bg-card-dark">
      <div></div>
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 cursor-pointer" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/a/ACg8ocJ_6Z8_4kY3E3j_2e_1c_4a3b_8b_9c_1d_3e_5f_7g_9h_0i=s96-c')" }}></div>
          <div className="absolute right-0 mt-2 w-48 bg-card-dark rounded-md shadow-lg py-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <a onClick={handleLogout} className="block px-4 py-2 text-sm text-text-dark-secondary hover:bg-background-dark cursor-pointer">Logout</a>
          </div>
        </div>
      </div>
    </header>
  );
}
