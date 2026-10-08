import React from 'react';

export interface BlockLicenseLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'icon' | 'full' | 'stacked';
  theme?: 'dark' | 'light' | 'auto'; // 'dark' = for dark backgrounds like #013330, 'light' = for light bg like #cce7ff/white
  className?: string;
  interactive?: boolean;
}

export const BlockLicenseLogo: React.FC<BlockLicenseLogoProps> = ({
  size = 'md',
  variant = 'icon',
  theme = 'dark',
  className = '',
  interactive = false
}) => {
  // Determine pixel dimension
  let pixelSize = 36;
  if (typeof size === 'number') {
    pixelSize = size;
  } else {
    switch (size) {
      case 'xs':
        pixelSize = 20;
        break;
      case 'sm':
        pixelSize = 28;
        break;
      case 'md':
        pixelSize = 38;
        break;
      case 'lg':
        pixelSize = 48;
        break;
      case 'xl':
        pixelSize = 64;
        break;
    }
  }

  const isLight = theme === 'light';

  const emblem = (
    <div
      style={{ width: pixelSize, height: pixelSize }}
      className={`relative shrink-0 flex items-center justify-center rounded-2xl select-none ${
        interactive ? 'transition-all duration-300 hover:scale-105 group-hover:rotate-3' : ''
      } ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        className="overflow-visible drop-shadow-md"
      >
        <defs>
          {/* Main Background Gradient */}
          <linearGradient id="blBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#013330" />
            <stop offset="100%" stopColor="#024945" />
          </linearGradient>

          {/* Left Shield Facet */}
          <linearGradient id="blShieldLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Right Shield Facet */}
          <linearGradient id="blShieldRight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Interlocking Block Facet */}
          <linearGradient id="blCubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#cce7ff" stopOpacity="0.8" />
          </linearGradient>

          {/* Core Crystal Prism */}
          <linearGradient id="blCoreDiamond" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="50%" stopColor="#a7f3d0" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="blGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Squircle Base Frame */}
        <rect
          width="100"
          height="100"
          rx="26"
          fill="url(#blBgGrad)"
          stroke="#059669"
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />

        {/* Outer Faceted Cryptographic Shield */}
        <polygon
          points="50,15 22,29 22,55 50,70"
          fill="url(#blShieldLeft)"
          fillOpacity="0.95"
        />
        <polygon
          points="50,15 78,29 78,55 50,70"
          fill="url(#blShieldRight)"
        />
        <polygon
          points="50,70 22,55 50,86 78,55"
          fill="#012422"
          fillOpacity="0.85"
        />

        {/* Isometric Blockchain Block Top */}
        <polygon
          points="50,22 66,31 50,40 34,31"
          fill="url(#blCubeTop)"
        />
        <polygon
          points="34,31 50,40 50,55 34,46"
          fill="#047857"
          fillOpacity="0.85"
        />
        <polygon
          points="50,40 66,31 66,46 50,55"
          fill="#10b981"
        />

        {/* Central License Padlock & Cryptographic Node */}
        <g filter="url(#blGlow)">
          <polygon
            points="50,34 60,46 50,58 40,46"
            fill="url(#blCoreDiamond)"
          />
          {/* Padlock Arch */}
          <path
            d="M46,36 C46,30.5 54,30.5 54,36"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Keyhole Node */}
          <circle cx="50" cy="46" r="2.2" fill="#013330" />
          <path
            d="M50,46 L50,51"
            stroke="#013330"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Satellite Node Accents */}
        <circle cx="50" cy="15" r="2" fill="#a7f3d0" />
        <circle cx="22" cy="29" r="1.5" fill="#a7f3d0" />
        <circle cx="78" cy="29" r="1.5" fill="#a7f3d0" />
        <circle cx="50" cy="86" r="2" fill="#34d399" />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return emblem;
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center gap-2 text-center ${className}`}>
        {emblem}
        <div className="flex flex-col items-center">
          <span
            className={`text-xl font-extrabold tracking-tight font-display ${
              isLight ? 'text-[#013330]' : 'text-white'
            }`}
          >
            Block<span className="text-emerald-400">License</span>
          </span>
          <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400">
            Blockchain Software Licensing
          </span>
        </div>
      </div>
    );
  }

  // variant === 'full' (Horizontal Logo + Wordmark)
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {emblem}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-0.5">
          <span
            className={`text-lg font-extrabold tracking-tight font-display ${
              isLight ? 'text-[#013330]' : 'text-white'
            }`}
          >
            Block
          </span>
          <span className="text-lg font-extrabold tracking-tight font-display text-emerald-400">
            License
          </span>
        </div>
        <span
          className={`text-[9px] tracking-wider font-semibold uppercase mt-0.5 ${
            isLight ? 'text-slate-500' : 'text-slate-300'
          }`}
        >
          EVM Protocol
        </span>
      </div>
    </div>
  );
};
