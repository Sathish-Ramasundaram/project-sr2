import React from 'react';
import StoreLogo from '@/components/StoreLogo';

const heroSlides = [
  'https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/100PercentageCustomerSatisfaction.png',
  'https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/OriginalProductsGuarenteed.png',
  'https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/PremiumQuality.png',
  'https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/ValueForMoney.png',
];

function HeroSection() {
  return (
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
  );
}

export default HeroSection;
