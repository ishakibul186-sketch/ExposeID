import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { auth } from '../firebase';
import { LogOut, User as UserIcon, BarChart3, Layout, Settings, Users, Search, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/searchresult?query=${searchQuery.trim()}`);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-emerald-500/50 transition-all shadow-lg overflow-hidden">
            <img 
              src="/assets/logo.png" 
              alt="ExposeID" 
              className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-300" 
            />
          </div>
          <span className="font-bold text-xl tracking-tighter bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">ExposeID</span>
        </Link>

        <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
          <div className="max-w-lg w-full lg:max-w-xs">
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a profile..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-zinc-500" />
              </div>
            </form>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Layout className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link 
                  to="/analytics" 
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </Link>
                <Link 
                  to="/teams" 
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Teams</span>
                </Link>
                <Link 
                  to="/settings" 
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95"
              >
                Get Started
              </Link>
            )}
          </div>
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800">Dashboard</Link>
                <Link to="/analytics" className="block px-3 py-2 rounded-md text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800">Analytics</Link>
                <Link to="/teams" className="block px-3 py-2 rounded-md text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800">Teams</Link>
                <Link to="/settings" className="block px-3 py-2 rounded-md text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800">Settings</Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-zinc-400 hover:text-white hover:bg-zinc-800">Logout</button>
              </>
            ) : (
              <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-emerald-500 hover:bg-emerald-600">Get Started</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
