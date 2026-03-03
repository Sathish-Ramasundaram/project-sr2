import React, { useState } from 'react';

type StoreLogoProps = {
  lightSrc?: string;
  darkSrc?: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  textClassName?: string;
};

function StoreLogo({
  lightSrc = '/logo-light.png',
  darkSrc = '/logo-dark.png',
  alt = 'SR Store',
  className = '',
  imgClassName = '',
  textClassName = '',
}: StoreLogoProps) {
  const [lightError, setLightError] = useState(false);
  const [darkError, setDarkError] = useState(false);
  const isHeaderLogo = className.includes('h-12');
  const adjustedClassName = `${className} ${isHeaderLogo ? 'mt-4' : ''}`.trim();

  return (
    <span className={`inline-flex items-center ${adjustedClassName}`.trim()}>
      {!lightError ? (
        <img
          src={lightSrc}
          alt={alt}
          onError={() => setLightError(true)}
          className={`block dark:hidden ${imgClassName}`.trim()}
        />
      ) : null}

      {!darkError ? (
        <img
          src={darkSrc}
          alt={alt}
          onError={() => setDarkError(true)}
          className={`hidden dark:block ${imgClassName}`.trim()}
        />
      ) : null}

      <span
        className={`${
          lightError ? 'dark:hidden inline-flex' : 'dark:hidden hidden'
        } ${textClassName}`.trim()}
      >
        SR Store
      </span>
      <span
        className={`${
          darkError ? 'dark:inline-flex hidden' : 'dark:hidden hidden'
        } ${textClassName}`.trim()}
      >
        SR Store
      </span>
    </span>
  );
}

export default StoreLogo;
