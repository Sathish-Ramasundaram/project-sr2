import React from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import HeroSection from '@/components/HeroSection';
import AboutContactSection from '@/components/AboutContactSection';
import Footer from '@/components/Footer';
import LoginChooser from '@/components/LoginChooser';
import { useLoginChooser } from './useLoginChooser';

function HomePage() {
  const { isLoginChooserOpen, openLoginChooser, closeLoginChooser } =
    useLoginChooser();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <AppHeader
        left={<div />}
        right={
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link to="/catalogue" className="hover:underline">
              Catalogue
            </Link>
            <Link to="/faq" className="hover:underline">
              FAQ
            </Link>
            <button
              type="button"
              onClick={openLoginChooser}
              className="hover:underline"
            >
              Login
            </button>
            <ThemeToggleButton />
          </nav>
        }
      />

      <main className="flex min-h-[calc(100vh-73px)] items-start justify-center px-0.5 sm:px-1 md:px-2 pt-12">
        <HeroSection />
      </main>
      <AboutContactSection />
      <Footer />
      <LoginChooser isOpen={isLoginChooserOpen} onClose={closeLoginChooser} />
      <style>{`
        @keyframes home-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

export default HomePage;
