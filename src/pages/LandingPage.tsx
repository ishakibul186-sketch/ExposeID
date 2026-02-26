import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Smartphone, 
  BarChart2, 
  Palette, 
  Globe, 
  Search, 
  Loader2
} from 'lucide-react';
import { rtdb } from '../firebase';
import { ref, get } from 'firebase/database';
import { UserCard, UserAccount } from '../types';
import { SearchEngine } from '../lib/searchengine';

export default function LandingPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchEngine, setSearchEngine] = useState<SearchEngine | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchAllCards = async () => {
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
          setSearchEngine(new SearchEngine(allCards));
        }
      } catch (err) {
        console.error('Failed to initialize search engine', err);
      }
    };
    fetchAllCards();
  }, []);

  const handleSearchChange = (val: string) => {
    setQuery(val);
    if (searchEngine) {
      setSuggestions(searchEngine.getSuggestions(val));
    }
  };

  const onSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/searchresult?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[128px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[128px]"></div>
        </div>

        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
              Your Digital Presence,<br />Simplified.
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
              The only link you'll ever need. Create a beautiful, professional digital card in minutes and track your growth with real-time analytics.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12 relative group">
              <form onSubmit={onSearchSubmit} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  type="text"
                  value={query}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by name, title, skills or company..."
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-lg"
                />
              </form>
              
              {/* Suggestions */}
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden z-50 shadow-2xl"
                  >
                    {suggestions.map((s, i) => (
                      <button 
                        key={i}
                        onClick={() => {
                          setQuery(s);
                          navigate(`/searchresult?q=${encodeURIComponent(s)}`);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors text-zinc-300 flex items-center gap-3"
                      >
                        <Search className="w-4 h-4 text-zinc-500" />
                        {s}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
              >
                Create Your Card <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-zinc-900/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Smartphone, title: "Mobile Optimized", desc: "Your card looks stunning on every device, from mobile to desktop." },
              { icon: BarChart2, title: "Real-time Analytics", desc: "Track views and clicks to understand your audience better." },
              { icon: Palette, title: "Custom Themes", desc: "Express your brand with custom colors, fonts, and styles." },
              { icon: Globe, title: "SEO Friendly", desc: "Optimized for search engines to help people find you easily." }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950 hover:border-emerald-500/50 transition-all group">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-800 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img src="/assets/logo.png" alt="ExposeID" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg tracking-tight">ExposeID</span>
          </div>
          <p className="text-zinc-500 text-sm">© 2026 ExposeID. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-zinc-400 text-sm">
            <a href="/docs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Docs</a>
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}