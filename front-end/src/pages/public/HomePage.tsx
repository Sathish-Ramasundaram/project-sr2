import React from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '@/components/layout/AppHeader';
import PageMain from '@/components/layout/PageMain';
import PageShell from '@/components/layout/PageShell';
import ThemeToggleButton from '@/components/theme/ThemeToggleButton';
import HeroSection from '@/components/public/HeroSection';
import AboutContactSection from '@/components/public/AboutContactSection';
import Footer from '@/components/layout/Footer';
import LoginChooser from '@/components/public/LoginChooser';
import { useLoginChooser } from '@/hooks/useLoginChooser';
import './HomePage.css';

function HomePage() {

  const { isLoginChooserOpen, openLoginChooser, closeLoginChooser } = useLoginChooser();

  return (
    <PageShell>
      <AppHeader
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

      <PageMain className="flex px-0 pt-12">
        <HeroSection />
      </PageMain>
      <AboutContactSection />
      <Footer />

      <LoginChooser isOpen={isLoginChooserOpen} onClose={closeLoginChooser} />
      
    </PageShell>
  );
}

export default HomePage;
