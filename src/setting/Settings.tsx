import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { User, Bell } from 'lucide-react';

const Settings = () => {
  const settingsOptions = [
    {
      name: 'Profile Information',
      description: 'Update your personal details and profile picture.',
      link: '/dashboard', // Or a dedicated profile settings page
      icon: <User className="w-6 h-6 text-sky-400" />
    },
    {
      name: 'Notifications',
      description: 'Choose how you receive notifications.',
      link: '#', // Placeholder for notifications settings page
      icon: <Bell className="w-6 h-6 text-amber-400" />
    }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center pt-20">
        <div className="w-full max-w-2xl p-8">
          <h1 className="text-4xl font-bold text-center text-white mb-10">Settings</h1>
          <div className="space-y-4">
            {settingsOptions.map((option) => (
              <Link to={option.link} key={option.name} className="block p-6 bg-zinc-900 hover:bg-zinc-800/50 rounded-lg shadow-lg transition-all duration-300 border border-zinc-800 hover:border-emerald-500/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-zinc-800 rounded-full">
                    {option.icon}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-white">{option.name}</h2>
                    <p className="text-zinc-400 text-sm">{option.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
