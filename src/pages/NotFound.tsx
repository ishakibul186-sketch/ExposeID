import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md"
      >
        <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-6xl font-black mb-4 tracking-tighter text-white">404</h1>
        <h2 className="text-2xl font-bold mb-4 text-zinc-200">Page Not Found</h2>
        <p className="text-zinc-500 mb-10 leading-relaxed">
          Oops! The page you're looking for doesn't exist or has been moved to another universe.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold hover:bg-zinc-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <Link 
            to="/" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-600 transition-all hover:scale-105"
          >
            <Home className="w-4 h-4" /> Home Page
          </Link>
        </div>
      </motion.div>

      <div className="mt-20 text-zinc-600 text-xs font-bold uppercase tracking-widest">
        LinkFlow Digital Cards
      </div>
    </div>
  );
}
