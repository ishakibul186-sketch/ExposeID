import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { rtdb } from '../firebase';
import { ref, get } from 'firebase/database';
import { UserCard } from '../types';
import Fuse from 'fuse.js';
import { Loader2, Frown } from 'lucide-react';

export default function SearchResult() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const [results, setResults] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [allCards, setAllCards] = useState<UserCard[]>([]);

  useEffect(() => {
    const fetchAllCards = async () => {
      setLoading(true);
      try {
        const accountsRef = ref(rtdb, 'accounts');
        const snapshot = await get(accountsRef);
        if (snapshot.exists()) {
          const accountsData = snapshot.val();
          const cards: UserCard[] = [];
          for (const uid in accountsData) {
            if (accountsData[uid].cards) {
              for (const cardId in accountsData[uid].cards) {
                cards.push(accountsData[uid].cards[cardId]);
              }
            }
          }
          setAllCards(cards);
        }
      } catch (error) {
        console.error("Error fetching all cards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCards();
  }, []);

  useEffect(() => {
    if (allCards.length > 0 && query) {
      const fuse = new Fuse(allCards, {
        keys: [
          'username',
          'displayName',
          'business.companyName',
          'business.portfolio.title'
        ],
        includeScore: true,
        threshold: 0.4,
      });

      const searchResults = fuse.search(query).map(result => result.item);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query, allCards]);

  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-zinc-400 mb-8">
          Showing results for: <span className="text-emerald-500 font-bold">"{query}"</span>
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-6" />
            <h2 className="text-xl font-bold mb-2">Searching...</h2>
            <p className="text-zinc-500">Please wait while we search for matching profiles.</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map(card => (
              <Link to={`/${card.username}`} key={card.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 group hover:border-emerald-500 transition-all">
                <div className="w-16 h-16 bg-zinc-800 rounded-xl overflow-hidden shrink-0">
                  {card.photoURL && <img src={card.photoURL} alt={card.displayName} className="w-full h-full object-cover" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg group-hover:text-emerald-500 transition-colors">{card.displayName}</h3>
                  <p className="text-sm text-zinc-500">@{card.username}</p>
                  {card.title && <p className="text-sm text-zinc-400 mt-1">{card.title}</p>}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <Frown className="w-12 h-12 text-zinc-500 mb-6" />
            <h2 className="text-xl font-bold mb-2">No Results Found</h2>
            <p className="text-zinc-500 max-w-md">We couldn't find any profiles matching your search. Please try a different name, username, or company.</p>
          </div>
        )}
      </div>
    </div>
  );
}
