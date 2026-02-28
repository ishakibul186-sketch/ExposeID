/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, createContext, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import PublicProfile from './pages/PublicProfile';
import Analytics from './pages/Analytics';
import SearchResult from './pages/SearchResult';
import NotFound from './pages/NotFound';
import Settings from './setting/Settings';
import Teams from './pages/Teams';
import Navbar from './components/Navbar';
import GoToTop from './components/GoToTop';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

// ExposeID - Digital Business Card Application
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <BrowserRouter>
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
          <Routes>
            <Route path="/" element={<><Navbar /><LandingPage /></>} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={user ? <><Navbar /><Dashboard /></> : <Navigate to="/login" />} 
            />
            <Route 
              path="/analytics" 
              element={user ? <><Navbar /><Analytics /></> : <Navigate to="/login" />} 
            />
            <Route path="/searchresult" element={<SearchResult />} />
            <Route 
              path="/settings" 
              element={user ? <Settings /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/teams" 
              element={user ? <><Navbar /><Teams /></> : <Navigate to="/login" />} 
            />
            <Route path="/:username" element={<PublicProfile />} />
          </Routes>
          <GoToTop />
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

