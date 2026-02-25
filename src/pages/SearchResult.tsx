import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Search, 
  Loader2, 
  MapPin, 
  Smartphone, 
  BarChart2, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { rtdb } from '../firebase';
import { ref, get } from 'firebase/database';
import { UserCard, UserAccount } from '../types';
import { SearchEngine } from '../lib/searchengine';

export default function SearchResult() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndSearch = async () => {
      setLoading(true);
      try {
        const snapshot = await get(ref(rtdb, 'accounts'));
        if (snapshot.exists()) {
          const accounts = snapshot.val() as Record<string, UserAccount>;
          const allCards: UserCard[] = [];
          
          Object.values(accounts).forEach(account => {
            if (account.cards) {
              Object.values(account.cards).forEach(card => {
                allCards.push(card);
              });
            }
          });

          const engine = new SearchEngine(allCards);
          setResults(engine.search(query));
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSearch();
  }, [query]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-emerald-500/50 transition-all">
              <img src="/assets/logo.png" alt="ExposeID" className="w-7 h-7 object-contain" />
            </div>
          </Link>
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <form action="/searchresult" method="GET">
              <input 
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            {query ? `Results for "${query}"` : 'All Cards'}
          </h1>
          <p className="text-zinc-500 text-sm">{results.length} cards found</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
            <p className="text-zinc-500">Searching the network...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((profile) => (
              <a 
                key={`${profile.uid}-${profile.id}`}
                href={`/${profile.username}`}
                className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/5"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-800 shrink-0">
                    {profile.photoURL ? (
                      <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500">
                        <Smartphone className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate group-hover:text-emerald-500 transition-colors">{profile.displayName}</h3>
                    <p className="text-emerald-500 text-xs font-bold uppercase tracking-wider truncate">{profile.title || 'Professional'}</p>
                    <div className="flex items-center gap-2 mt-1 text-zinc-500 text-xs">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{profile.contact?.address || 'Remote'}</span>
                    </div>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm line-clamp-2 mb-4 h-10">{profile.bio}</p>
                
                {profile.business?.skills && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {profile.business.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="text-[10px] bg-zinc-950 border border-zinc-800 px-2 py-1 rounded-md text-zinc-500">
                        {skill}
                      </span>
                    ))}
                    {profile.business.skills.length > 3 && (
                      <span className="text-[10px] text-zinc-600">+{profile.business.skills.length - 3} more</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-zinc-500 text-xs">
                      <BarChart2 className="w-3 h-3" />
                      {profile.views || 0} views
                    </div>
                  </div>
                  <div className="text-emerald-500 font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Card <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </a>
            ))}

            {results.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-zinc-700" />
                </div>
                <h3 className="text-xl font-bold mb-2">No results found</h3>
                <p className="text-zinc-500">Try searching for something else or check out our trending keywords.</p>
                <Link to="/" className="inline-block mt-6 text-emerald-500 font-bold hover:underline">
                  Back to home
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
