import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useAuth } from '../App';
import { auth, rtdb } from '../firebase';
import { ref, get, update, child, set, remove } from 'firebase/database';
import { UserAccount, UserCard, LinkItem, PortfolioProject } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  ExternalLink, 
  Save, 
  Image as ImageIcon,
  Palette,
  Eye,
  CheckCircle2,
  Loader2,
  Smartphone,
  RefreshCw,
  Globe,
  TrendingUp,
  Briefcase,
  ChevronDown,
  Copy,
  LogOut,
  Camera,
  X,
  PlusCircle,
  AlertTriangle,
  Check,
  ArrowLeft,
  QrCode,
  Link as LinkIcon,
  MessageSquare
} from 'lucide-react';
import { cn } from '../lib/utils';
import ImageCropper from '../components/ImageCropper';
import confetti from 'canvas-confetti';
import { QRCodeCanvas } from 'qrcode.react';

export default function Dashboard() {
  const { user } = useAuth();
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [activeCard, setActiveCard] = useState<UserCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [cardToDelete, setCardToDelete] = useState<UserCard | null>(null);
  const [justSavedCardId, setJustSavedCardId] = useState<string | null>(null);
  
  // Cropper State
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImage, setCropperImage] = useState<string>('');
  const [cropperTarget, setCropperTarget] = useState<{ type: 'profile' | 'portfolio' | 'logo' | 'thumbnail' | 'testimonial', index?: number }>({ type: 'profile' });
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const testimonialAvatarInputRef = useRef<HTMLInputElement>(null);

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
          // To ensure stability, we'll try to load the active card, but fall back to the first card.
          const cardToLoadId = data.activeCardId && cardCollection[data.activeCardId] 
            ? data.activeCardId 
            : cardIds[0];
          
          const cardToLoad = cardCollection[cardToLoadId];

          // Ensure links is an array before setting state
          if (cardToLoad.links && !Array.isArray(cardToLoad.links)) {
            cardToLoad.links = Object.values(cardToLoad.links);
          } else if (!cardToLoad.links) {
            cardToLoad.links = [];
          }
          setActiveCard(cardToLoad);
        } else {
          setActiveCard(null); // Explicitly set to null if no cards exist
        }
      } else {
        // Migration or new user fallback
        // Try to fetch from old 'users' node
        const oldSnapshot = await get(child(dbRef, `users/${user.uid}`));
        if (oldSnapshot.exists()) {
          const oldData = oldSnapshot.val();
          const cardId = Math.random().toString(36).substr(2, 9);
          const firstCard: UserCard = {
            ...oldData,
            id: cardId
          };
          const newAccount: UserAccount = {
            uid: user.uid,
            email: user.email || '',
            cards: { [cardId]: firstCard },
            activeCardId: cardId
          };
          await set(ref(rtdb, `accounts/${user.uid}`), newAccount);
          setAccount(newAccount);
          setActiveCard(firstCard);
        }
      }
    } catch (err: any) {
      console.error("Error fetching account:", err);
      if (err.message?.includes('offline') || err.code === 'unavailable') {
        setIsOffline(true);
      } else {
        setMessage('Error connecting to database.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, [user]);

  useEffect(() => {
    if (justSavedCardId) {
      setView('list');
      setJustSavedCardId(null); // Reset trigger
    }
  }, [justSavedCardId]);

  const handleRetry = async () => {
    fetchAccount();
  };

  const handleSave = async () => {
    if (!user || !activeCard || !account) return;

    // Validation
    const errors = [];
    if (!activeCard.displayName.trim()) errors.push('Full Name is required.');
    if (!activeCard.username.trim()) errors.push('Username is required.');

    // If it's a new card, check for username uniqueness
    if (!activeCard.createdAt) {
      const usernameSnapshot = await get(ref(rtdb, `usernames/${activeCard.username.toLowerCase()}`));
      if (usernameSnapshot.exists()) {
        errors.push('Username is already taken. Please choose another.');
      }
    }

    if (!activeCard.title?.trim()) errors.push('Professional Title is required.');
    if (!activeCard.bio.trim()) errors.push('Short Bio is required.');
    if (!activeCard.theme) errors.push('A theme must be selected.');
    const hasSocialLink = Object.values(activeCard.socialLinks || {}).some(link => typeof link === 'string' && link.trim() !== '');
    if (!hasSocialLink) errors.push('At least one social media link is required.');

    if (errors.length > 0) {
      setMessage(errors.join(' | '));
      return;
    }

    setSaving(true);
    try {
      const cardToSave = { ...activeCard };
      if (!cardToSave.createdAt) {
        cardToSave.createdAt = Date.now();
      }

      const isNewCard = !cardToSave.createdAt;
      if (isNewCard) {
        cardToSave.createdAt = Date.now();
      }

      // Use a multi-path update for atomicity
      const updates: { [key: string]: any } = {};
      updates[`/accounts/${user.uid}/cards/${cardToSave.id}`] = cardToSave;
      updates[`/accounts/${user.uid}/activeCardId`] = cardToSave.id; // Set this card as active
      updates[`/usernames/${cardToSave.username.toLowerCase()}`] = {
        uid: user.uid,
        cardId: cardToSave.id
      };

      await update(ref(rtdb), updates);

      if (!activeCard.createdAt) { // A more reliable check for a new card
        // For new cards, a full reload is the most reliable way to ensure all state is fresh
        window.location.reload();
      } else {
        // For existing cards, a soft refresh is fine
        await fetchAccount();
        setMessage('Changes saved successfully!');
      }
      
      setMessage('Changes saved successfully!');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const createNewCard = async () => {
    if (!user) return;
    
    const currentCards = account?.cards || {};
    const cardCount = Object.keys(currentCards).length;
    
    if (cardCount >= 5) {
      setMessage('Card limit (5) reached.');
      return;
    }

    const cardId = Math.random().toString(36).substr(2, 9);
    const newCard: UserCard = {
      id: cardId,
      uid: user.uid,
      username: '',
      displayName: 'New Card',
      bio: 'Welcome to my digital card!',
      photoURL: '',
      theme: 'classic',
      links: [],
      socialLinks: { facebook: '', instagram: '', linkedin: '', youtube: '', twitter: '' },
      contact: { mobile: '', whatsapp: '', email: user.email || '', website: '', address: '' },
      business: { companyName: '', companyLogo: '', services: [], experience: 0, skills: [], portfolio: [] },
      views: 0,
      createdAt: 0
    };

    // Use functional update to ensure we're working with the latest state
    setAccount(prevAccount => {
      const baseAccount = prevAccount || { uid: user.uid, email: user.email || '', cards: {} };
      return {
        ...baseAccount,
        cards: {
          ...(baseAccount.cards || {}),
          [cardId]: newCard
        },
        activeCardId: cardId
      };
    });
    setActiveCard(newCard);
    setView('edit');
  };

  const switchCard = (cardId: string) => {
    if (!account) return;
    const card = account.cards[cardId];
    if (card) {
      setActiveCard(card);
      setAccount({ ...account, activeCardId: cardId });
      setView('edit');
    }
  };

  const updateSocial = (key: keyof UserCard['socialLinks'], value: string) => {
    if (!activeCard) return;
    setActiveCard({
      ...activeCard,
      socialLinks: { ...(activeCard.socialLinks || {}), [key]: value }
    });
  };

  const updateContact = (key: keyof UserCard['contact'], value: string) => {
    if (!activeCard) return;
    setActiveCard({
      ...activeCard,
      contact: { ...(activeCard.contact || {}), [key]: value }
    });
  };

  const updateBusiness = (key: keyof NonNullable<UserCard['business']>, value: any) => {
    if (!activeCard) return;
    setActiveCard({
      ...activeCard,
      business: { ...(activeCard.business || {}), [key]: value }
    });
  };

  const updateIntegration = (key: keyof NonNullable<UserCard['integrations']>, value: string) => {
    if (!activeCard) return;
    setActiveCard({
      ...activeCard,
      integrations: { ...(activeCard.integrations || {}), [key]: value }
    });
  };

  const addLink = () => {
    if (!activeCard) return;
    const newLink: LinkItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Link',
      url: 'https://',
      clicks: 0,
      active: true
    };
    setActiveCard({ ...activeCard, links: [...activeCard.links, newLink] });
  };

  const updateLink = (id: string, updates: Partial<LinkItem>) => {
    if (!activeCard) return;
    const newLinks = activeCard.links.map(l => l.id === id ? { ...l, ...updates } : l);
    setActiveCard({ ...activeCard, links: newLinks });
  };

  const deleteLink = (id: string) => {
    if (!activeCard) return;
    setActiveCard({ ...activeCard, links: activeCard.links.filter(l => l.id !== id) });
  };

  // Image Cropping Logic
  const onFileChange = (e: ChangeEvent<HTMLInputElement>, target: 'profile' | 'portfolio' | 'logo' | 'thumbnail' | 'testimonial', index?: number) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setCropperImage(reader.result as string);
        setCropperTarget({ type: target, index });
        setCropperOpen(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    if (!activeCard) return;
    
    if (cropperTarget.type === 'profile') {
      setActiveCard({ ...activeCard, photoURL: croppedImage });
    } else if (cropperTarget.type === 'thumbnail') {
      setActiveCard({ ...activeCard, thumbnail: croppedImage });
    } else if (cropperTarget.type === 'logo') {
      setActiveCard({
        ...activeCard,
        business: { ...(activeCard.business || {}), companyLogo: croppedImage }
      });
    } else if (cropperTarget.type === 'portfolio' && cropperTarget.index !== undefined) {
      const newPortfolio = [...(activeCard.business?.portfolio || [])];
      newPortfolio[cropperTarget.index].imageUrl = croppedImage;
      updateBusiness('portfolio', newPortfolio);
    } else if (cropperTarget.type === 'testimonial' && cropperTarget.index !== undefined) {
      const newTestimonials = [...(activeCard.testimonials || [])];
      newTestimonials[cropperTarget.index].avatar = croppedImage;
      setActiveCard({ ...activeCard, testimonials: newTestimonials });
    }
    
    setCropperOpen(false);
    setCropperImage('');
  };

  const deleteCard = async () => {
    if (!user || !cardToDelete || !account) return;

    const newCards = { ...account.cards };
    delete newCards[cardToDelete.id];

    const updatedAccount = {
      ...account,
      cards: newCards,
      activeCardId: Object.keys(newCards)[0] || ''
    };

    try {
      await set(ref(rtdb, `accounts/${user.uid}`), updatedAccount);
      await remove(ref(rtdb, `usernames/${cardToDelete.username.toLowerCase()}`));
      
      setAccount(updatedAccount);
      if (Object.keys(newCards).length > 0) {
        setActiveCard(newCards[updatedAccount.activeCardId]);
      } else {
        setActiveCard(null);
      }
      setCardToDelete(null);
      setView('list');
      setMessage('Card deleted successfully.');
    } catch (error) {
      console.error('Failed to delete card:', error);
      setMessage('Error deleting card.');
    }
  };

  const calculateProfileCompletion = () => {
    if (!activeCard) return { score: 0, checklist: [] };

    const checks = {
      basicInfo: activeCard.displayName?.trim() && activeCard.username?.trim() && activeCard.title?.trim() && activeCard.bio?.trim() && !!activeCard.photoURL,
      contactInfo: Object.values(activeCard.contact || {}).some(val => typeof val === 'string' && val.trim() !== ''),
      socialMedia: Object.values(activeCard.socialLinks || {}).some(val => typeof val === 'string' && val.trim() !== ''),
      businessInfo: !!activeCard.business?.companyName?.trim(),
      portfolio: (activeCard.business?.portfolio?.length || 0) > 0,
      links: (activeCard.links?.length || 0) > 0,
      theme: !!activeCard.theme
    };

    const total = Object.keys(checks).length;
    const completed = Object.values(checks).filter(Boolean).length;
    const score = Math.round((completed / total) * 100);

    const checklist = [
      { name: 'Basic Information', completed: checks.basicInfo },
      { name: 'Contact Details', completed: checks.contactInfo },
      { name: 'Social Media', completed: checks.socialMedia },
      { name: 'Business Info', completed: checks.businessInfo },
      { name: 'Portfolio', completed: checks.portfolio },
      { name: 'Custom Links', completed: checks.links },
      { name: 'Theme Selection', completed: checks.theme },
    ];

    return { score, checklist };
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      let downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${activeCard?.username}-qrcode.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const { score, checklist } = calculateProfileCompletion();

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-4 text-center">
      <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-6" />
      <h2 className="text-xl font-bold mb-2">Loading Your Dashboard</h2>
      <p className="text-zinc-500">Please wait while we fetch your data...</p>
    </div>
  );

  if (!activeCard) return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-4 text-center">
      <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6">
        <Smartphone className="w-8 h-8 text-zinc-500" />
      </div>
      <h2 className="text-xl font-bold mb-2">No Active Card</h2>
      <p className="text-zinc-500 mb-8 max-w-md">
        You don't have any cards yet. Create your first digital card to get started!
      </p>
      <button 
        onClick={createNewCard}
        className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
      >
        <Plus className="w-4 h-4" /> Create First Card
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          {view === 'list' ? (
            <h1 className="text-2xl font-bold">My Cards</h1>
          ) : (
            <h1 className="text-2xl font-bold">Editing: <span className='text-emerald-500'>{activeCard.displayName}</span></h1>
          )}
        </div>

        {view === 'edit' && (
          <div className="flex items-center gap-3">
            <button onClick={() => setView('list')} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all">
              <ArrowLeft className="w-4 h-4" /> Back to List
            </button>
            {message && (
            <motion.span 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-emerald-500 text-xs font-bold flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3" /> {message}
            </motion.span>
          )}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
          </div>
        )}
      </div>

      {view === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {account && account.cards && (Object.values(account.cards) as UserCard[]).map(card => (
            <div key={card.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col group">
              <div className="flex-1 mb-4">
                <div className="w-full aspect-video bg-zinc-800 rounded-lg mb-3 overflow-hidden">
                  {card.thumbnail && <img src={card.thumbnail} className="w-full h-full object-cover" />}
                </div>
                <h3 className="font-bold text-lg">{card.displayName}</h3>
                <p className="text-sm text-zinc-500">@{card.username}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={`/${card.username}`} target="_blank" className="flex-1 text-center bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" /> View
                </a>
                <button onClick={() => switchCard(card.id)} className="flex-1 text-center bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-4 py-2 rounded-lg text-sm font-bold transition-all">
                  Edit
                </button>
                <button onClick={() => setCardToDelete(card)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
           <button 
              onClick={createNewCard}
              className="w-full min-h-[280px] border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500 hover:border-emerald-500 hover:text-emerald-500 transition-all flex flex-col items-center justify-center gap-2 font-bold"
            >
              <PlusCircle className="w-8 h-8" /> Create New Card
            </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
        {/* Editor Side */}
        <div className="flex-1 space-y-8">
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-500" /> Basic Information
            </h2>
            <div className="space-y-6">
              <div className="relative group w-full aspect-[3/1] bg-zinc-800 rounded-2xl overflow-hidden border-2 border-zinc-800">
                {activeCard.thumbnail ? (
                  <img src={activeCard.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500">
                    <ImageIcon className="w-10 h-10" />
                    <span className="ml-2 text-sm font-bold">Add Banner Image</span>
                  </div>
                )}
                <button 
                  onClick={() => {
                    setCropperTarget({ type: 'thumbnail' });
                    thumbnailInputRef.current?.click();
                  }}
                  className="absolute bottom-4 right-4 p-3 bg-emerald-500 text-zinc-950 rounded-xl shadow-lg hover:scale-110 transition-transform"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input 
                  type="file"
                  ref={thumbnailInputRef}
                  onChange={(e) => onFileChange(e, 'thumbnail')}
                  className="hidden"
                  accept="image/*"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 bg-zinc-800 rounded-2xl overflow-hidden border-2 border-zinc-800">
                    {activeCard.photoURL ? (
                      <img src={activeCard.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      setCropperTarget({ type: 'profile' });
                      profilePhotoInputRef.current?.click();
                    }}
                    className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 text-zinc-950 rounded-xl shadow-lg hover:scale-110 transition-transform"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input 
                    type="file"
                    ref={profilePhotoInputRef}
                    onChange={(e) => onFileChange(e, 'profile')}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Full Name</label>
                      <input 
                        type="text"
                        value={activeCard.displayName}
                        onChange={(e) => setActiveCard({ ...activeCard, displayName: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Username</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">@</span>
                        <input 
                          type="text"
                          value={activeCard.username}
                          onChange={(e) => setActiveCard({ ...activeCard, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-8 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
                          placeholder="username"
                          disabled={!!activeCard.createdAt}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Professional Title</label>
                    <input 
                      type="text"
                      value={activeCard.title || ''}
                      onChange={(e) => setActiveCard({ ...activeCard, title: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. Web Developer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Short Bio</label>
                    <textarea 
                      value={activeCard.bio}
                      onChange={(e) => setActiveCard({ ...activeCard, bio: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 h-20 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                      placeholder="Tell the world about yourself..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-500" /> Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Mobile Number</label>
                <input 
                  type="tel"
                  value={activeCard.contact?.mobile || ''}
                  onChange={(e) => updateContact('mobile', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="+1 234 567 890"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">WhatsApp Number</label>
                <input 
                  type="tel"
                  value={activeCard.contact?.whatsapp || ''}
                  onChange={(e) => updateContact('whatsapp', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="+1 234 567 890"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Email Address</label>
                <input 
                  type="email"
                  value={activeCard.contact?.email || ''}
                  onChange={(e) => updateContact('email', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Website</label>
                <input 
                  type="url"
                  value={activeCard.contact?.website || ''}
                  onChange={(e) => updateContact('website', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="https://johndoe.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Office Address</label>
                <input 
                  type="text"
                  value={activeCard.contact?.address || ''}
                  onChange={(e) => updateContact('address', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="123 Street, City, Country"
                />
              </div>
            </div>
          </section>

          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-500" /> Social Media Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Facebook</label>
                <input 
                  type="url"
                  value={activeCard.socialLinks?.facebook || ''}
                  onChange={(e) => updateSocial('facebook', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="https://facebook.com/username"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Instagram</label>
                <input 
                  type="url"
                  value={activeCard.socialLinks?.instagram || ''}
                  onChange={(e) => updateSocial('instagram', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="https://instagram.com/username"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">LinkedIn</label>
                <input 
                  type="url"
                  value={activeCard.socialLinks?.linkedin || ''}
                  onChange={(e) => updateSocial('linkedin', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">YouTube</label>
                <input 
                  type="url"
                  value={activeCard.socialLinks?.youtube || ''}
                  onChange={(e) => updateSocial('youtube', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="https://youtube.com/@channel"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Twitter / X</label>
                <input 
                  type="url"
                  value={activeCard.socialLinks?.twitter || ''}
                  onChange={(e) => updateSocial('twitter', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="https://twitter.com/username"
                />
              </div>
            </div>
          </section>

          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> Business & Professional
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Company Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center">
                    {activeCard.business?.companyLogo ? (
                      <img src={activeCard.business.companyLogo} className="w-full h-full object-contain" />
                    ) : (
                      <Briefcase className="w-6 h-6 text-zinc-700" />
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      setCropperTarget({ type: 'logo' });
                      logoInputRef.current?.click();
                    }}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
                  >
                    Upload Logo
                  </button>
                  <input 
                    type="file"
                    ref={logoInputRef}
                    onChange={(e) => onFileChange(e, 'logo')}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Company Name</label>
                <input 
                  type="text"
                  value={activeCard.business?.companyName || ''}
                  onChange={(e) => updateBusiness('companyName', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Tech Solutions Inc."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Experience (Years)</label>
                <input 
                  type="number"
                  value={activeCard.business?.experience || 0}
                  onChange={(e) => updateBusiness('experience', parseInt(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Skills (comma separated)</label>
                <input 
                  type="text"
                  value={activeCard.business?.skills?.join(', ') || ''}
                  onChange={(e) => updateBusiness('skills', e.target.value.split(',').map(s => s.trim()))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="React, TypeScript, Node.js"
                />
              </div>
            </div>
          </section>

          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-500" /> Portfolio & Projects
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCard.business?.portfolio?.map((project, index) => (
                  <div key={project.id || index} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 relative group">
                    <button 
                      onClick={() => {
                        const newPortfolio = [...(activeCard.business?.portfolio || [])];
                        newPortfolio.splice(index, 1);
                        updateBusiness('portfolio', newPortfolio);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="aspect-video bg-zinc-900 rounded-lg mb-3 overflow-hidden relative group/img">
                      {project.imageUrl ? (
                        <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                      <button 
                        onClick={() => {
                          setCropperTarget({ type: 'portfolio', index });
                          portfolioInputRef.current?.click();
                        }}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Camera className="w-6 h-6" />
                      </button>
                      <input 
                        type="file"
                        ref={portfolioInputRef}
                        onChange={(e) => onFileChange(e, 'portfolio', index)}
                        className="hidden"
                        accept="image/*"
                      />
                    </div>
                    <input 
                      type="text"
                      value={project.title}
                      onChange={(e) => {
                        const newPortfolio = [...(activeCard.business?.portfolio || [])];
                        newPortfolio[index].title = e.target.value;
                        updateBusiness('portfolio', newPortfolio);
                      }}
                      className="w-full bg-transparent border-none p-0 font-bold text-sm focus:ring-0 mb-1"
                      placeholder="Project Title"
                    />
                    <input 
                      type="url"
                      value={project.url || ''}
                      onChange={(e) => {
                        const newPortfolio = [...(activeCard.business?.portfolio || [])];
                        newPortfolio[index].url = e.target.value;
                        updateBusiness('portfolio', newPortfolio);
                      }}
                      className="w-full bg-transparent border-none p-0 text-xs text-zinc-500 focus:ring-0"
                      placeholder="Project URL (optional)"
                    />
                  </div>
                ))}
              </div>
              <button 
                onClick={() => {
                  const newPortfolio = [...(activeCard.business?.portfolio || [])];
                  newPortfolio.push({ id: Math.random().toString(36).substr(2, 9), title: 'New Project', imageUrl: '', description: '' });
                  updateBusiness('portfolio', newPortfolio);
                }}
                className="w-full py-4 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 hover:border-emerald-500 hover:text-emerald-500 transition-all flex items-center justify-center gap-2 font-bold"
              >
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </div>
          </section>

          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-emerald-500" /> Integrations
            </h2>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">YouTube Video URL</label>
              <input 
                type="url"
                value={activeCard.integrations?.youtubeVideoUrl || ''}
                onChange={(e) => updateIntegration('youtubeVideoUrl', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          </section>

          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-500" /> Testimonials
            </h2>
            <div className="space-y-4">
              {activeCard.testimonials?.map((testimonial, index) => (
                <div key={testimonial.id || index} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex gap-4 items-start">
                  <div className="relative group shrink-0">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full overflow-hidden border-2 border-zinc-800">
                      {testimonial.avatar ? (
                        <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        setCropperTarget({ type: 'testimonial', index });
                        testimonialAvatarInputRef.current?.click();
                      }}
                      className="absolute -bottom-1 -right-1 p-2 bg-emerald-500 text-zinc-950 rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text"
                      value={testimonial.name}
                      onChange={(e) => {
                        const newTestimonials = [...(activeCard.testimonials || [])];
                        newTestimonials[index].name = e.target.value;
                        setActiveCard({ ...activeCard, testimonials: newTestimonials });
                      }}
                      className="w-full bg-transparent font-bold mb-1 focus:ring-0 border-none p-0"
                      placeholder="Client Name"
                    />
                    <input 
                      type="text"
                      value={testimonial.company || ''}
                      onChange={(e) => {
                        const newTestimonials = [...(activeCard.testimonials || [])];
                        newTestimonials[index].company = e.target.value;
                        setActiveCard({ ...activeCard, testimonials: newTestimonials });
                      }}
                      className="w-full bg-transparent text-xs text-zinc-500 mb-2 focus:ring-0 border-none p-0"
                      placeholder="Company (optional)"
                    />
                    <textarea 
                      value={testimonial.feedback}
                      onChange={(e) => {
                        const newTestimonials = [...(activeCard.testimonials || [])];
                        newTestimonials[index].feedback = e.target.value;
                        setActiveCard({ ...activeCard, testimonials: newTestimonials });
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2 px-3 text-sm h-24 resize-none focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Client feedback..."
                    />
                  </div>
                  <button 
                    onClick={() => {
                      const newTestimonials = [...(activeCard.testimonials || [])];
                      newTestimonials.splice(index, 1);
                      setActiveCard({ ...activeCard, testimonials: newTestimonials });
                    }}
                    className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => {
                  const newTestimonials = [...(activeCard.testimonials || [])];
                  newTestimonials.push({ id: Math.random().toString(36).substr(2, 9), name: '', feedback: '' });
                  setActiveCard({ ...activeCard, testimonials: newTestimonials });
                }}
                className="w-full py-4 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 hover:border-emerald-500 hover:text-emerald-500 transition-all flex items-center justify-center gap-2 font-bold"
              >
                <Plus className="w-4 h-4" /> Add Testimonial
              </button>
            </div>
            <input 
              type="file"
              ref={testimonialAvatarInputRef}
              onChange={(e) => onFileChange(e, 'testimonial', activeCard.testimonials?.length || 0)}
              className="hidden"
              accept="image/*"
            />
          </section>

          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Palette className="w-5 h-5 text-emerald-500" /> Themes
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {['classic', 'modern', 'glass', 'neon', 'minimal'].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveCard({ ...activeCard, theme: t })}
                  className={cn(
                    "py-2 px-4 rounded-lg border text-sm font-medium capitalize transition-all",
                    activeCard.theme === t 
                      ? "bg-emerald-500 border-emerald-500 text-zinc-950" 
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-emerald-500" /> Links
              </h2>
              <button 
                onClick={addLink}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Link
              </button>
            </div>
            
            <div className="space-y-4">
              <AnimatePresence>
                {activeCard.links.map((link) => (
                  <motion.div 
                    key={link.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex items-start gap-4"
                  >
                    <div className="pt-2 cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-5 h-5 text-zinc-700" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <input 
                        type="text"
                        value={link.title}
                        onChange={(e) => updateLink(link.id, { title: e.target.value })}
                        className="w-full bg-transparent border-none p-0 text-lg font-bold focus:ring-0 outline-none placeholder:text-zinc-700"
                        placeholder="Link Title"
                      />
                      <input 
                        type="text"
                        value={link.url}
                        onChange={(e) => updateLink(link.id, { url: e.target.value })}
                        className="w-full bg-transparent border-none p-0 text-sm text-zinc-500 focus:ring-0 outline-none placeholder:text-zinc-800"
                        placeholder="https://yourlink.com"
                      />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button 
                        onClick={() => deleteLink(link.id)}
                        className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] uppercase font-bold text-zinc-600">{link.clicks} clicks</span>
                         <input 
                          type="checkbox"
                          checked={link.active}
                          onChange={(e) => updateLink(link.id, { active: e.target.checked })}
                          className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {activeCard.links.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl">
                  <p className="text-zinc-500">No links added yet. Click "Add Link" to get started.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Preview Side */}
        <div className="lg:w-96 space-y-6">
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Profile Completion</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    className="stroke-current text-zinc-800"
                    strokeWidth="3"
                    fill="none"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    className="stroke-current text-emerald-500 transition-all duration-500"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${score}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{score}%</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold">You're almost there!</h3>
                <p className="text-sm text-zinc-500">Complete your profile to stand out.</p>
              </div>
            </div>
            <div className="space-y-2">
              {checklist.map(item => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <span className={cn(item.completed ? 'text-white' : 'text-zinc-500')}>{item.name}</span>
                  {item.completed ? 
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : 
                    <X className="w-4 h-4 text-zinc-700" />
                  }
                </div>
              ))}
            </div>
          </section>

          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-500" /> Share QR Code
            </h2>
            <div className="flex flex-col items-center">
              <div className="p-4 bg-white rounded-lg">
                <QRCodeCanvas
                  id="qr-code-canvas"
                  value={`${window.location.origin}/${activeCard.username}`}
                  size={160}
                  level={"H"}
                  includeMargin={true}
                />
              </div>
              <button 
                onClick={downloadQRCode}
                className="mt-4 w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                Download PNG
              </button>
            </div>
          </section>

          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Live Preview</h3>
            </div>

            {/* Phone Mockup */}
            <div className="w-full aspect-[9/19] bg-zinc-950 rounded-[3rem] border-8 border-zinc-900 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-10"></div>
              
              {/* Preview Content */}
              <div className={cn(
                "h-full w-full overflow-y-auto p-6 pt-12 scrollbar-hide",
                activeCard.theme === 'neon' && "bg-zinc-950",
                activeCard.theme === 'glass' && "bg-gradient-to-br from-zinc-900 to-zinc-950",
                activeCard.theme === 'modern' && "bg-zinc-900",
                activeCard.theme === 'minimal' && "bg-white text-zinc-950",
                activeCard.theme === 'classic' && "bg-zinc-950"
              )}>
                <div className="text-center mb-8">
                  <div className={cn(
                    "w-20 h-20 rounded-full mx-auto mb-4 border-2",
                    activeCard.theme === 'neon' ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "border-zinc-800"
                  )}>
                    {activeCard.photoURL ? (
                      <img src={activeCard.photoURL} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 rounded-full" />
                    )}
                  </div>
                  <h4 className="font-bold text-lg">{activeCard.displayName || 'Your Name'}</h4>
                  <p className="text-xs opacity-60 mt-1">{activeCard.bio || 'Your bio goes here...'}</p>
                </div>

                <div className="space-y-3">
                  {activeCard.links.filter(l => l.active).map(link => (
                    <div 
                      key={link.id}
                      className={cn(
                        "w-full py-3 px-4 rounded-xl text-center text-sm font-bold transition-all",
                        activeCard.theme === 'neon' && "bg-transparent border border-emerald-500 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
                        activeCard.theme === 'glass' && "bg-white/10 backdrop-blur-md border border-white/20",
                        activeCard.theme === 'modern' && "bg-emerald-500 text-zinc-950",
                        activeCard.theme === 'minimal' && "bg-zinc-100 border border-zinc-200 text-zinc-950",
                        activeCard.theme === 'classic' && "bg-zinc-900 border border-zinc-800"
                      )}
                    >
                      {link.title || 'Untitled Link'}
                    </div>
                  ))}
                </div>

                <div className="mt-12 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/50 text-[10px] font-bold uppercase tracking-widest opacity-60">
                    <img src="/assets/logo.png" alt="ExposeID" className="w-4 h-4 object-contain" /> ExposeID
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              <a 
                href={`/${activeCard.username}`} 
                target="_blank" 
                className="text-xs font-bold text-zinc-500 hover:text-emerald-500 flex items-center gap-1 transition-colors"
              >
                <Eye className="w-3 h-3" /> View Public Page
              </a>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Cropper Modal */}
      {cropperOpen && (
        <ImageCropper
          image={cropperImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCropperOpen(false);
            setCropperImage('');
          }}
          aspect={cropperTarget.type === 'thumbnail' ? 3/1 : (cropperTarget.type === 'logo' ? 1/1 : 1/1)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {cardToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCardToDelete(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Delete Card?</h2>
              <p className="text-zinc-500 mb-8">
                Are you sure you want to delete the card "{cardToDelete.displayName}"? This action is permanent and cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setCardToDelete(null)} 
                  className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition-all">
                  Cancel
                </button>
                <button 
                  onClick={deleteCard} 
                  className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all">
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}