import React from 'react';

type StoreLogoProps = {
  lightSrc?: string;
  darkSrc?: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
};

function StoreLogo({
  lightSrc = '/logo-light.png',
  darkSrc = '/logo-dark.png',
  alt = 'SR Store',
  className = '',
  imgClassName = '',
}: StoreLogoProps) {
  return (
    <span className={`inline-flex items-center ${className}`.trim()}>
      <img
        src={lightSrc}
        alt={alt}
        className={`block dark:hidden ${imgClassName}`.trim()}
      />
      <img
        src={darkSrc}
        alt={alt}
        className={`hidden dark:block ${imgClassName}`.trim()}
      />
    </span>
  );
}

export default StoreLogo;
