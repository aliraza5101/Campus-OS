import React from 'react';

interface CampusOSLogoProps {
  className?: string;
  size?: number | string;
  alt?: string;
  id?: string;
}

export const CampusOSLogo: React.FC<CampusOSLogoProps> = ({
  className = 'w-7 h-7',
  size,
  alt = 'CampusOS Logo',
  id,
}) => {
  return (
    <img
      id={id}
      src="/campusos-logo.png"
      alt={alt}
      className={`select-none object-contain ${className}`}
      style={size ? { width: size, height: size } : undefined}
      loading="eager"
      decoding="async"
    />
  );
};

interface CampusOSBrandBannerProps {
  className?: string;
}

export const CampusOSBrandBanner: React.FC<CampusOSBrandBannerProps> = ({ className = '' }) => {
  return (
    <div
      className={`rounded-2xl sm:rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_36px_rgba(40,53,147,0.12)] border border-white/80 flex flex-col items-center text-center ${className}`}
    >
      {/* Exact Official Logo Graphic */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
        <CampusOSLogo className="w-full h-full object-contain" />
      </div>

      {/* Brand Name */}
      <div className="mt-4 flex items-center justify-center">
        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0B1336]">
          Campus
        </span>
        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#00D2FF] via-[#0084FF] to-[#2CE88E] bg-clip-text text-transparent ml-0.5">
          OS
        </span>
      </div>

      {/* Official Slogan with Divider Lines */}
      <div className="mt-3 flex items-center gap-2 sm:gap-3 w-full max-w-xs justify-center">
        <div className="h-[1px] flex-1 bg-slate-300" />
        <p className="text-[10px] sm:text-[11px] font-bold tracking-widest text-[#0B1336] uppercase whitespace-nowrap">
          YOUR CAMPUS. YOUR ROADMAP. YOUR FUTURE.
        </p>
        <div className="h-[1px] flex-1 bg-slate-300" />
      </div>
    </div>
  );
};
