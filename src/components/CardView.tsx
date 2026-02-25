import { useState } from 'react';
import { UserCard } from '../types';
import { 
  Smartphone, 
  Mail, 
  Globe, 
  MapPin, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Twitter,
  Briefcase,
  ExternalLink,
  MessageCircle,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  QrCode,
  X,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';

interface CardViewProps {
  profile: UserCard;
  onLinkClick?: (linkId: string, url: string) => void;
}

export default function CardView({ profile, onLinkClick }: CardViewProps) {
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const theme = profile.theme || 'classic';

  const socialIcons = {
    facebook: Facebook,
    instagram: Instagram,
    linkedin: Linkedin,
    youtube: Youtube,
    twitter: Twitter
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "min-h-screen w-full flex flex-col items-center py-0 md:py-10 px-0 md:px-4",
      theme === 'minimal' ? "bg-zinc-50" : "bg-zinc-950"
    )}>
      {/* Navigation Buttons */}
      <div className="fixed top-4 left-4 right-4 z-50 flex justify-between pointer-events-none">
        <button 
          onClick={() => window.history.back()}
          className="p-3 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl text-white hover:bg-zinc-800 transition-all pointer-events-auto shadow-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setShowShare(true)}
          className="p-3 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl text-white hover:bg-zinc-800 transition-all pointer-events-auto shadow-xl"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      <div className={cn(
        "w-full max-w-2xl shadow-2xl overflow-hidden md:rounded-[2.5rem] relative",
        theme === 'neon' && "bg-zinc-950 text-white border border-emerald-500/30",
        theme === 'glass' && "bg-zinc-900/90 backdrop-blur-xl text-white border border-white/10",
        theme === 'modern' && "bg-zinc-900 text-white",
        theme === 'minimal' && "bg-white text-zinc-950 border border-zinc-200",
        theme === 'classic' && "bg-zinc-950 text-white"
      )}>
        {/* Header / Cover */}
                <div className="h-48 md:h-64 relative">
          {profile.thumbnail ? (
            <img src={profile.thumbnail} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20" />
          )}
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 z-10">
            <div className={cn(
              "w-32 h-32 md:w-40 md:h-40 rounded-3xl md:rounded-[2rem] overflow-hidden border-4 bg-zinc-800",
              theme === 'neon' ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" : (theme === 'minimal' ? "border-white" : "border-zinc-900")
            )}>
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Smartphone className="w-12 h-12 text-zinc-600" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-20 md:pt-24 px-6 pb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-1">{profile.displayName}</h1>
          <p className="text-emerald-500 font-bold uppercase tracking-widest text-sm mb-4">{profile.title}</p>
          <p className={cn(
            "text-sm max-w-md mx-auto mb-8 leading-relaxed",
            theme === 'minimal' ? "text-zinc-600" : "text-zinc-400"
          )}>
            {profile.bio}
          </p>

          {/* Contact Quick Actions */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {profile.contact?.mobile && (
              <a href={`tel:${profile.contact.mobile}`} className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-emerald-500 transition-all group">
                <Smartphone className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
              </a>
            )}
            {profile.contact?.whatsapp && (
              <a href={`https://wa.me/${profile.contact.whatsapp}`} target="_blank" className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-emerald-500 transition-all group">
                <MessageCircle className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
              </a>
            )}
            {profile.contact?.email && (
              <a href={`mailto:${profile.contact.email}`} className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-emerald-500 transition-all group">
                <Mail className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
              </a>
            )}
            {profile.contact?.website && (
              <a href={profile.contact.website} target="_blank" className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-emerald-500 transition-all group">
                <Globe className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
              </a>
            )}
            {profile.contact?.address && (
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl group">
                <MapPin className="w-5 h-5 text-emerald-500" />
              </div>
            )}
          </div>

          {/* Business Info Section */}
          {profile.business && (
            <div className={cn(
              "border rounded-3xl p-6 mb-10 text-left",
              theme === 'minimal' ? "bg-zinc-50 border-zinc-200" : "bg-zinc-900/50 border-zinc-800"
            )}>
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-5 h-5 text-emerald-500" />
                <h2 className="font-bold text-lg">Professional Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.business.companyName && (
                  <div className="flex items-center gap-4">
                    {profile.business.companyLogo && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white p-1 shrink-0">
                        <img src={profile.business.companyLogo} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Company</p>
                      <p className="text-sm font-bold">{profile.business.companyName}</p>
                    </div>
                  </div>
                )}
                {profile.business.experience !== undefined && (
                  <div>
                    <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Experience</p>
                    <p className="text-sm font-bold">{profile.business.experience} Years</p>
                  </div>
                )}
                {profile.business.skills && profile.business.skills.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Skills & Expertise</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.business.skills.map((skill, i) => (
                        <span key={i} className="text-xs bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Portfolio Section */}
          {profile.business?.portfolio && profile.business.portfolio.length > 0 && (
            <div className="mb-10 text-left">
              <h2 className="font-bold text-lg px-2 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-500" /> Portfolio
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.business.portfolio.map((project) => (
                  <a 
                    key={project.id} 
                    href={project.url} 
                    target="_blank" 
                    className={cn(
                      "group block rounded-2xl overflow-hidden border transition-all",
                      theme === 'minimal' ? "bg-zinc-50 border-zinc-200" : "bg-zinc-900 border-zinc-800"
                    )}
                  >
                    <div className="aspect-video relative overflow-hidden">
                      {project.imageUrl ? (
                        <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                          <Briefcase className="w-8 h-8 text-zinc-700" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm mb-1">{project.title}</h3>
                      <p className="text-xs text-zinc-500 line-clamp-1">{project.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Links Section */}
          <div className="space-y-4 mb-10">
            <h2 className="text-left font-bold text-lg px-2 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-emerald-500" /> My Links
            </h2>
            {profile.links.filter(l => l.active).map(link => (
              <button 
                key={link.id}
                onClick={() => onLinkClick?.(link.id, link.url)}
                className={cn(
                  "w-full py-4 px-6 rounded-2xl text-left font-bold flex items-center justify-between group transition-all",
                  theme === 'neon' && "bg-transparent border border-emerald-500 text-emerald-500 hover:bg-emerald-500/10",
                  theme === 'glass' && "bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10",
                  theme === 'modern' && "bg-emerald-500 text-zinc-950 hover:bg-emerald-400",
                  theme === 'minimal' && "bg-zinc-100 border border-zinc-200 text-zinc-950 hover:bg-zinc-200",
                  theme === 'classic' && "bg-zinc-900 border border-zinc-800 hover:border-emerald-500"
                )}
              >
                <span>{link.title}</span>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-6 mb-12">
            {Object.entries(profile.socialLinks || {}).map(([key, url]) => {
              if (!url) return null;
              const Icon = socialIcons[key as keyof typeof socialIcons];
              return (
                <a key={key} href={url} target="_blank" className="text-zinc-500 hover:text-emerald-500 transition-all hover:scale-110">
                  <Icon className="w-6 h-6" />
                </a>
              );
            })}
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-zinc-800/50">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <Smartphone className="w-3 h-3" /> Created with LinkFlow
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShare && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShare(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-2xl"
            >
              <button 
                onClick={() => setShowShare(false)}
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <h3 className="text-xl font-bold mb-2">Share Card</h3>
                <p className="text-zinc-500 text-sm">Let people connect with you easily</p>
              </div>

              <div className="flex justify-center mb-8 p-4 bg-white rounded-2xl">
                <QRCodeCanvas 
                  value={window.location.href}
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-between p-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Copy className="w-5 h-5 text-emerald-500" />
                    <span className="font-bold">Copy Link</span>
                  </div>
                  {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:translate-x-1 transition-transform" />}
                </button>
                <div className="text-center">
                  <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Scan QR Code to View</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
