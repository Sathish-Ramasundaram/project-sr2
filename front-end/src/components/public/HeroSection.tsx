import React from 'react';
import StoreLogo from '@/components/shared/StoreLogo';

const heroSlides = [
  'https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/100PercentageCustomerSatisfaction.png',
  'https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/OriginalProductsGuarenteed.png',
  'https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/PremiumQuality.png',
  'https://raw.githubusercontent.com/Sathish-Ramasundaram/images-srs/refs/heads/main/images/ValueForMoney.png',
];

const marqueeContainerClass =
  'relative left-1/2 mt-16 w-screen -translate-x-1/2 overflow-hidden bg-white dark:bg-slate-800';
const slideItemClass =
  'w-[50vw] shrink-0 overflow-hidden h-56 sm:h-64 md:h-72';
const slideImageClass = 'h-full w-full object-fill opacity-95 dark:opacity-85';

function HeroSection() {
  
  const slides = [...heroSlides, ...heroSlides];

  return (
    <section className="w-full text-center">

      <div className="mt-4 flex flex-col items-center">
        <StoreLogo
          className="justify-center"
          imgClassName="mx-auto h-40 w-auto"
        />
        <p className="-mt-12 ml-4 text-lg md:text-xl font-medium italic tracking-wide text-slate-700 dark:text-slate-300">
          20 years of trust.
        </p>
      </div>

      <div className={marqueeContainerClass}>
        
        <div className="marquee-track flex w-max">

          {slides.map((slide, index) => (
            <div key={`${slide}-${index}`} className={slideItemClass}>
              <img
                src={slide}
                alt={`Store slide ${index + 1}`}
                className={slideImageClass}
              />
            </div>
          ))}


        </div>
      </div>
    </section>
  );
}

export default HeroSection;
