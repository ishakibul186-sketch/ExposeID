import React, { useState } from 'react';
import { X, Mail, Send } from 'lucide-react';

interface InviteMemberModalProps {
  onClose: () => void;
  onInvite: (email: string) => void;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ onClose, onInvite }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onInvite(email);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-6">Invite New Member</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <button 
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> Send Invitation
          </button>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
