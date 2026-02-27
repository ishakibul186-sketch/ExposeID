import { useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from '../App';
import { auth, rtdb } from '../firebase';
import { ref, get, child } from 'firebase/database';
import { UserCard, UserAccount } from '../types';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Eye, MousePointer2, TrendingUp, Loader2, Calendar, RefreshCw, LayoutDashboard, ChevronDown, ArrowUpRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import VisitorLocationMap from '../components/VisitorLocationMap';

export default function Analytics() {
  const { user } = useAuth();
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [activeCard, setActiveCard] = useState<UserCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const fetchAccount = async () => {
    if (!user) return;
    setLoading(true);
    setIsOffline(false);
    try {
      const dbRef = ref(rtdb);
      const snapshot = await get(child(dbRef, `accounts/${user.uid}`));
      if (snapshot.exists()) {
        const data = snapshot.val() as UserAccount;
        setAccount(data);
        
        // Simplified and robust card loading logic
        const cardCollection = data.cards || {};
        const cardIds = Object.keys(cardCollection);

        if (cardIds.length > 0) {
          const cardToLoadId = data.activeCardId && cardCollection[data.activeCardId] 
            ? data.activeCardId 
            : cardIds[0];
          
          const cardToLoad = cardCollection[cardToLoadId];

          if (cardToLoad.links && !Array.isArray(cardToLoad.links)) {
            cardToLoad.links = Object.values(cardToLoad.links);
          } else if (!cardToLoad.links) {
            cardToLoad.links = [];
          }
          setActiveCard(cardToLoad);
        } else {
          setActiveCard(null); // No cards found
        }
      } else {
        // Fallback to legacy
        const legacySnapshot = await get(child(dbRef, `users/${user.uid}`));
        if (legacySnapshot.exists()) {
          const data = legacySnapshot.val();
          if (data.links && !Array.isArray(data.links)) {
            data.links = Object.values(data.links);
          } else if (!data.links) {
            data.links = [];
          }
          setActiveCard(data as UserCard);
        }
      }
    } catch (err: any) {
      console.error("Error fetching analytics account:", err);
      if (err.message?.includes('offline') || err.code === 'unavailable') {
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, [user]);

  const handleCardSwitch = (cardId: string) => {
    if (!account) return;
    const card = account.cards[cardId];
    if (card) {
      if (card.links && !Array.isArray(card.links)) {
        card.links = Object.values(card.links);
      } else if (!card.links) {
        card.links = [];
      }
      setActiveCard(card);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[calc(100vh-64px)]">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
    </div>
  );

  if (isOffline) return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-4 text-center">
      <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6">
        <RefreshCw className="w-8 h-8 text-zinc-500" />
      </div>
      <h2 className="text-xl font-bold mb-2">Connection Issue</h2>
      <p className="text-zinc-500 mb-8 max-w-md">
        We're having trouble connecting to the analytics database.
      </p>
      <button 
        onClick={fetchAccount}
        className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
      >
        <RefreshCw className="w-4 h-4" /> Retry Connection
      </button>
    </div>
  );

  if (!activeCard) return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-4 text-center">
      <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6">
        <TrendingUp className="w-8 h-8 text-zinc-500" />
      </div>
      <h2 className="text-xl font-bold mb-2">No Analytics Data</h2>
      <p className="text-zinc-500 mb-8 max-w-md">
        We couldn't load your analytics profile. Please make sure your profile is set up in the dashboard.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={fetchAccount}
          className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Retry Loading
        </button>
        <Link 
          to="/dashboard"
          className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
        >
          <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
        </Link>
      </div>
    </div>
  );

  const totalClicks = Object.values(activeCard.clickHistory || {}).reduce((acc, curr) => acc + curr, 0);
  const ctr = activeCard.views > 0 ? ((totalClicks / activeCard.views) * 100).toFixed(1) : '0.0';

  const [chartData, setChartData] = useState<{name: string; views: number; clicks: number;}[]>([]);

  useEffect(() => {
    const generateChartData = () => {
      if (!activeCard) return;
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        data.push({ name: day, views: 0, clicks: 0 });
      }
      setChartData(data);
    };
    generateChartData();
  }, [activeCard]);

  const linkData = Object.entries(activeCard.clickHistory || {}).map(([key, value]) => {
    let name = key;
    if (activeCard.links.find(l => l.id === key)) {
      name = activeCard.links.find(l => l.id === key)?.title || key;
    } else if (key === 'mobile' || key === 'whatsapp' || key === 'email' || key === 'website') {
      name = key.charAt(0).toUpperCase() + key.slice(1);
    } else {
      name = key.charAt(0).toUpperCase() + key.slice(1);
    }
    return { name, value };
  }).filter(l => l.value > 0);

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>
          <p className="text-zinc-500 mt-2 text-lg">Real-time performance metrics for your digital card</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {account && Object.keys(account.cards).length > 1 && (
            <div className="relative">
              <select
                value={activeCard.id}
                onChange={(e) => handleCardSwitch(e.target.value)}
                className="appearance-none bg-zinc-900 border border-zinc-800 text-white px-6 py-3 pr-12 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer transition-all font-bold"
              >
                {(Object.values(account.cards) as UserCard[]).map(card => (
                  <option key={card.id} value={card.id}>
                    {card.displayName} (@{card.username})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
            </div>
          )}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-2xl text-sm font-bold text-zinc-400">
            <Calendar className="w-5 h-5" /> Last 7 Days
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-emerald-500" />
            </div>
            <span className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Total Views</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold">{activeCard.views}</span>
            <div className="flex items-center gap-1 text-emerald-500 text-sm font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">
              <ArrowUpRight className="w-4 h-4" /> 12%
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <MousePointer2 className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Total Clicks</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold">{totalClicks}</span>
            <div className="flex items-center gap-1 text-emerald-500 text-sm font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">
              <ArrowUpRight className="w-4 h-4" /> 8%
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] relative overflow-hidden group sm:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <span className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Click Rate (CTR)</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold">{ctr}%</span>
            <span className="text-zinc-500 text-sm font-bold">Conversion</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Traffic Overview</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-zinc-500 font-bold">Views</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-zinc-500 font-bold">Clicks</span>
              </div>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#71717a" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', padding: '12px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="views" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem]">
          <h3 className="text-xl font-bold mb-8">Link Distribution</h3>
          {linkData.length > 0 ? (
            <div className="flex flex-col h-full">
              <div className="h-[250px] w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={linkData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {linkData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
                {linkData.map((link, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="text-zinc-400 font-bold text-sm truncate max-w-[140px]">{link.name}</span>
                    </div>
                    <span className="font-bold text-white">{link.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center py-12">
              <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center mb-4">
                <MousePointer2 className="w-8 h-8 opacity-20" />
              </div>
              <p className="font-bold">No click data available yet.</p>
              <p className="text-sm mt-1">Share your card to start tracking!</p>
            </div>
          )}
        </div>
        <VisitorLocationMap />
      </div>
    </div>
  );
}