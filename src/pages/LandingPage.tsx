import { Check, ChevronRight, Star, Linkedin, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="bg-zinc-950 text-white">
      {/* Hero Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            Your Digital Identity, Redefined.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-3xl mx-auto">
            Create a stunning, interactive digital business card in minutes. Share your brand, connect with your audience, and grow your network like never before.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="bg-emerald-500 text-zinc-950 font-bold px-8 py-3 rounded-full hover:bg-emerald-400 transition-colors duration-300">
              Get Started for Free
            </Link>
            <Link to="#features" className="flex items-center gap-2 font-bold px-8 py-3 rounded-full hover:bg-zinc-800 transition-colors duration-300">
              Learn More <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Animated Preview Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold">Bring Your Brand to Life</h2>
            <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">Create a lasting impression with a dynamic, animated digital card.</p>
          </div>
          <div className="mt-16 relative h-96">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-72 h-48 bg-zinc-800 rounded-2xl shadow-2xl transform -rotate-6 transition-transform duration-500 hover:rotate-0">
                <div className="p-4">
                  <h3 className="font-bold text-lg">John Doe</h3>
                  <p className="text-sm text-zinc-400">Web Developer</p>
                </div>
              </div>
              <div className="w-72 h-48 bg-emerald-500 rounded-2xl shadow-2xl transform rotate-6 transition-transform duration-500 hover:rotate-0">
                <div className="p-4">
                  <h3 className="font-bold text-lg text-zinc-950">Jane Smith</h3>
                  <p className="text-sm text-zinc-900">Freelancer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 bg-zinc-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold">Powerful Features, Seamless Experience</h2>
            <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">Everything you need to create a professional and engaging digital identity.</p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-zinc-800 p-8 rounded-2xl">
              <Check className="w-8 h-8 text-emerald-500" />
              <h3 className="mt-4 text-xl font-bold">Advanced Customization</h3>
              <p className="mt-2 text-zinc-400">Go beyond templates with custom fonts, colors, and layouts to perfectly match your brand.</p>
            </div>
            <div className="bg-zinc-800 p-8 rounded-2xl">
              <Check className="w-8 h-8 text-emerald-500" />
              <h3 className="mt-4 text-xl font-bold">Lead Generation</h3>
              <p className="mt-2 text-zinc-400">Capture leads directly from your digital card with a built-in contact form.</p>
            </div>
            <div className="bg-zinc-800 p-8 rounded-2xl">
              <Check className="w-8 h-8 text-emerald-500" />
              <h3 className="mt-4 text-xl font-bold">Team Management</h3>
              <p className="mt-2 text-zinc-400">Create and manage digital cards for your entire team with ease.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold">Create Your Card in 3 Simple Steps</h2>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-2xl font-bold">1. Sign Up</h3>
              <p className="mt-2 text-zinc-400">Create your account in seconds.</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold">2. Customize</h3>
              <p className="mt-2 text-zinc-400">Personalize your card with your branding and content.</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold">3. Share</h3>
              <p className="mt-2 text-zinc-400">Share your card with anyone, anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 sm:py-32 bg-zinc-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold">Loved by Professionals Worldwide</h2>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-zinc-800 p-8 rounded-2xl">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-500" />
                <Star className="w-5 h-5 text-emerald-500" />
                <Star className="w-5 h-5 text-emerald-500" />
                <Star className="w-5 h-5 text-emerald-500" />
                <Star className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="mt-4 text-zinc-400">"The best digital business card I've ever used. It's a game-changer for my networking."</p>
              <p className="mt-4 font-bold">- John Doe, CEO at Company</p>
            </div>
            <div className="bg-zinc-800 p-8 rounded-2xl">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-500" />
                <Star className="w-5 h-5 text-emerald-500" />
                <Star className="w-5 h-5 text-emerald-500" />
                <Star className="w-5 h-5 text-emerald-500" />
                <Star className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="mt-4 text-zinc-400">"I love how easy it is to create and share my card. The analytics are a huge plus!"</p>
              <p className="mt-4 font-bold">- Jane Smith, Freelancer</p>
            </div>
            <div className="bg-zinc-800 p-8 rounded-2xl">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-500" />
                <Star className="w-5 h-5 text-emerald-500" />
                <Star className="w-5 h-5 text-emerald-500" />
                <Star className="w-5 h-5 text-emerald-500" />
                <Star className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="mt-4 text-zinc-400">"A must-have tool for any professional looking to make a great first impression."</p>
              <p className="mt-4 font-bold">- Samuel Lee, Consultant</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold">Frequently Asked Questions</h2>
          </div>
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="bg-zinc-900 p-6 rounded-2xl">
              <h3 className="font-bold">Is it free to get started?</h3>
              <p className="mt-2 text-zinc-400">Yes, you can create a free digital business card with all the essential features. We also offer premium plans for advanced users.</p>
            </div>
            <div className="mt-4 bg-zinc-900 p-6 rounded-2xl">
              <h3 className="font-bold">Can I customize my card?</h3>
              <p className="mt-2 text-zinc-400">Absolutely! You can choose from a variety of templates, colors, and fonts to create a card that perfectly represents your brand.</p>
            </div>
            <div className="mt-4 bg-zinc-900 p-6 rounded-2xl">
              <h3 className="font-bold">How do I share my card?</h3>
              <p className="mt-2 text-zinc-400">You can share your card via a unique URL, QR code, email, or social media. It's easy to share with anyone, anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-zinc-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-zinc-400">&copy; 2026 ExposeID. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <a href="/docs">Docs</a>
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <a href="/about">About</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
