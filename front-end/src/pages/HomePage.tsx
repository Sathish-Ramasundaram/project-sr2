import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import ThemeToggleButton from '../components/ThemeToggleButton';
import StoreLogo from '../components/StoreLogo';

function HomePage() {
  const [isLoginChooserOpen, setIsLoginChooserOpen] = useState(false);
  const heroSlides = [
    'https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/100PercentageCustomerSatisfaction.png',
    'https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/OriginalProductsGuarenteed.png',
    'https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/PremiumQuality.png',
    'https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/ValueForMoney.png',
  ];

  const closeLoginChooser = () => {
    setIsLoginChooserOpen(false);
  };

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
              onClick={() => setIsLoginChooserOpen(true)}
              className="hover:underline"
            >
              Login
            </button>
            <ThemeToggleButton />
          </nav>
        }
      />

      <main className="flex min-h-[calc(100vh-73px)] items-start justify-center px-0.5 sm:px-1 md:px-2 pt-12">
        <section className="w-full text-center">
          <div className="mt-4 flex flex-col items-center">
            <StoreLogo
              className="justify-center"
              imgClassName="mx-auto h-40 w-auto"
              textClassName="text-6xl font-extrabold tracking-tight"
            />
            <p className="-mt-12 ml-4 text-lg md:text-xl font-medium italic tracking-wide text-slate-700 dark:text-slate-300">
              20 years of trust.
            </p>
          </div>

          <div className="relative mt-12 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex w-max animate-[home-marquee_60s_linear_infinite]">
              {[...heroSlides, ...heroSlides].map((slide, index) => (
                <div
                  key={`${slide}-${index}`}
                  className="relative h-72 w-[50vw] shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-900 sm:h-80 md:h-96"
                >
                  <img
                    src={slide}
                    alt={`Store slide ${index + 1}`}
                    className="h-full w-full object-fill"
                  />
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-white/40 to-transparent dark:from-slate-900/40" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-white/40 to-transparent dark:from-slate-900/40" />
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-0 bg-sky-500/15 mix-blend-multiply dark:bg-emerald-500/20" />
          </div>
        </section>
      </main>
      <section className="px-0.5 pb-8 sm:px-1 md:px-2">
        <div className="p-3">
          <div className="mx-auto grid max-w-4xl gap-4 text-left text-sm md:grid-cols-2">
            <article className="rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="font-semibold">About Us</p>
              <p className="mt-2">
                SR Stores has served neighborhood families for over 20 years
                with quality groceries, fair pricing, and trusted daily
                essentials.
              </p>
              <p className="mt-2">
                Branches: Chennai, Coimbatore, Madurai, Tirunelveli | Open: 6:00
                AM - 10:00 PM.
              </p>
            </article>
            <article className="rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="font-semibold">Contact Us</p>
              <p className="mt-2">Phone: +91 98765 43210</p>
              <p className="mt-1">Email: support@srstores.demo</p>
            </article>
          </div>
        </div>
      </section>
      <footer className="border-t border-slate-300 bg-white px-6 py-4 text-center text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        2026 All right reserved
      </footer>
      <style>{`
        @keyframes home-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>

      {isLoginChooserOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 px-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-colors dark:bg-slate-800">
            <div className="mb-6 flex items-start justify-between">
              <h3 className="text-xl font-bold">Choose Login</h3>
              <button
                type="button"
                onClick={closeLoginChooser}
                className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                aria-label="Close login selector"
              >
                X
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Link
                to="/customer/login?switch=1"
                onClick={closeLoginChooser}
                className="flex flex-col items-center gap-3 rounded-xl border border-slate-300 px-4 py-5 text-center transition hover:border-blue-500 hover:bg-blue-50 dark:border-slate-600 dark:hover:border-blue-400 dark:hover:bg-slate-700"
              >
                <span className="rounded-full bg-blue-100 p-3 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3-7 8-7s8 3 8 7" />
                  </svg>
                </span>
                <span className="font-semibold">Customer Login</span>
              </Link>

              <Link
                to="/admin/login"
                onClick={closeLoginChooser}
                className="flex flex-col items-center gap-3 rounded-xl border border-slate-300 px-4 py-5 text-center transition hover:border-emerald-500 hover:bg-emerald-50 dark:border-slate-600 dark:hover:border-emerald-400 dark:hover:bg-slate-700"
              >
                <span className="rounded-full bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <path d="M12 2l8 4v6c0 5-3.5 8.8-8 10-4.5-1.2-8-5-8-10V6l8-4z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </span>
                <span className="font-semibold">Admin Login</span>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default HomePage;
