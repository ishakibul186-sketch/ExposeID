import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth, rtdb } from '../firebase';
import { ref, set, get, child } from 'firebase/database';
import { motion } from 'motion/react';
import { Smartphone, Mail, Lock, Chrome, Loader2 } from 'lucide-react';
import { UserAccount, UserCard } from '../types';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if account exists
      const dbRef = ref(rtdb);
      const snapshot = await get(child(dbRef, `accounts/${user.uid}`));
      
      if (!snapshot.exists()) {
        const defaultUsername = user.email?.split('@')[0].replace(/[^a-z0-9]/g, '') || `user${Date.now()}`;
        const cardId = Math.random().toString(36).substr(2, 9);
        
        const firstCard: UserCard = {
          id: cardId,
          uid: user.uid,
          username: defaultUsername,
          displayName: user.displayName || 'New User',
          bio: 'Welcome to my digital card!',
          photoURL: user.photoURL || '',
          theme: 'classic',
          links: [],
          socialLinks: { facebook: '', instagram: '', linkedin: '', youtube: '', twitter: '' },
          contact: { mobile: '', whatsapp: '', email: user.email || '', website: '', address: '' },
          business: { companyName: '', companyLogo: '', services: [], experience: 0, skills: [], portfolio: [] },
          views: 0,
          createdAt: Date.now()
        };

        const account: UserAccount = {
          uid: user.uid,
          email: user.email || '',
          cards: { [cardId]: firstCard },
          activeCardId: cardId
        };

        await set(ref(rtdb, `accounts/${user.uid}`), account);
        await set(ref(rtdb, `usernames/${defaultUsername.toLowerCase()}`), { uid: user.uid, cardId });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      } else {
        if (!username) throw new Error('Username is required');
        const cleanUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Check if username is taken
        const usernameSnapshot = await get(ref(rtdb, `usernames/${cleanUsername}`));
        if (usernameSnapshot.exists()) {
          throw new Error('Username is already taken');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const cardId = Math.random().toString(36).substr(2, 9);
        
        const firstCard: UserCard = {
          id: cardId,
          uid: user.uid,
          username: cleanUsername,
          displayName: username,
          bio: 'Welcome to my digital card!',
          photoURL: '',
          theme: 'classic',
          links: [],
          socialLinks: { facebook: '', instagram: '', linkedin: '', youtube: '', twitter: '' },
          contact: { mobile: '', whatsapp: '', email: email, website: '', address: '' },
          business: { companyName: '', companyLogo: '', services: [], experience: 0, skills: [], portfolio: [] },
          views: 0,
          createdAt: Date.now()
        };

        const account: UserAccount = {
          uid: user.uid,
          email: email,
          cards: { [cardId]: firstCard },
          activeCardId: cardId
        };

        await set(ref(rtdb, `accounts/${user.uid}`), account);
        await set(ref(rtdb, `usernames/${cleanUsername}`), { uid: user.uid, cardId });
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-6 h-6 text-zinc-950" />
          </div>
          <h2 className="text-2xl font-bold">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-zinc-400 mt-2">
            {isLogin ? 'Sign in to manage your digital card' : 'Join LinkFlow and build your presence'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Username</label>
              <div className="relative">
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="johndoe"
                  required
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <Chrome className="w-5 h-5" /> Google
        </button>

        <p className="text-center mt-8 text-zinc-400 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-500 font-semibold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
