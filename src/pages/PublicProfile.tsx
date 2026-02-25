import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { rtdb } from '../firebase';
import { ref, get, update, child, increment } from 'firebase/database';
import { UserCard } from '../types';
import { motion } from 'motion/react';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import CardView from '../components/CardView';

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState<UserCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const fetchProfile = async () => {
    if (!username) return;
    setLoading(true);
    setIsOffline(false);
    setError(false);
    try {
      const dbRef = ref(rtdb);
      
      // 1. Get mapping from usernames
      const usernameSnapshot = await get(child(dbRef, `usernames/${username.toLowerCase()}`));
      
      if (usernameSnapshot.exists()) {
        const mapping = usernameSnapshot.val();
        let uid, cardId;
        
        if (typeof mapping === 'string') {
          // Legacy support
          uid = mapping;
          const userSnapshot = await get(child(dbRef, `users/${uid}`));
          if (userSnapshot.exists()) {
            const data = userSnapshot.val();
            setProfile(data as UserCard);
            await update(ref(rtdb, `users/${uid}`), { views: increment(1) });
            setLoading(false);
            return;
          }
        } else {
          uid = mapping.uid;
          cardId = mapping.cardId;
        }

        if (uid && cardId) {
          const cardSnapshot = await get(child(dbRef, `accounts/${uid}/cards/${cardId}`));
          if (cardSnapshot.exists()) {
            const data = cardSnapshot.val();
            // Ensure links is an array
            if (data.links && !Array.isArray(data.links)) {
              data.links = Object.values(data.links);
            } else if (!data.links) {
              data.links = [];
            }
            setProfile(data as UserCard);
            
            // Track view
            await update(ref(rtdb, `accounts/${uid}/cards/${cardId}`), {
              views: increment(1)
            });
          } else {
            setError(true);
          }
        } else {
          setError(true);
        }
      } else {
        setError(true);
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('offline') || err.code === 'unavailable') {
        setIsOffline(true);
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const handleLinkClick = async (linkId: string, url: string) => {
    if (!profile) return;
    
    const linkIndex = profile.links.findIndex(l => l.id === linkId);
    if (linkIndex === -1) return;

    try {
      if (profile.id) {
        // New structure
        await update(ref(rtdb, `accounts/${profile.uid}/cards/${profile.id}/links/${linkIndex}`), {
          clicks: increment(1)
        });
      } else {
        // Old structure
        await update(ref(rtdb, `users/${profile.uid}/links/${linkIndex}`), {
          clicks: increment(1)
        });
      }
    } catch (err) {
      console.error('Failed to track click', err);
    }
    
    window.open(url, '_blank');
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
    </div>
  );

  if (isOffline) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
      <RefreshCw className="w-16 h-16 text-zinc-800 mb-6 animate-pulse" />
      <h1 className="text-3xl font-bold mb-2">Connection Issue</h1>
      <p className="text-zinc-500 mb-8 max-w-md">We're having trouble connecting to the database. This usually happens in restricted networks.</p>
      <button 
        onClick={fetchProfile}
        className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all"
      >
        <RefreshCw className="w-4 h-4" /> Retry Connection
      </button>
    </div>
  );

  if (error || !profile) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
      <AlertCircle className="w-16 h-16 text-zinc-800 mb-6" />
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
      <p className="text-zinc-500 mb-8">The profile you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-8 py-4 rounded-xl font-bold transition-all">
        Go Home
      </Link>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-zinc-950"
    >
      <CardView profile={profile} onLinkClick={handleLinkClick} />
    </motion.div>
  );
}
