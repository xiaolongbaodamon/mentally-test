import React from "react";

interface MentAllyLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  withText?: boolean;
  subtitle?: string;
  badge?: string;
}

export const MentAllyLogo: React.FC<MentAllyLogoProps> = ({
  size = "md",
  className = "",
  withText = false,
  subtitle,
  badge = "PTC",
}) => {
  // Dimensions for the icon container
  const iconDimensions = {
    xs: "w-6 h-6 rounded-lg",
    sm: "w-8 h-8 sm:w-9 sm:h-9 rounded-xl",
    md: "w-10 h-10 sm:w-11 sm:h-11 rounded-2xl",
    lg: "w-14 h-14 sm:w-16 sm:h-16 rounded-[22px]",
    xl: "w-20 h-20 sm:w-24 sm:h-24 rounded-[28px]",
    hero: "w-24 h-24 sm:w-28 sm:h-28 rounded-[32px]",
  };

  const textSizes = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base sm:text-lg",
    lg: "text-xl sm:text-2xl",
    xl: "text-2xl sm:text-3xl",
    hero: "text-3xl sm:text-4xl",
  };

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Sleek Modern Geometric Icon */}
      <div
        className={`relative shrink-0 flex items-center justify-center bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-700 text-white shadow-md shadow-teal-900/15 border border-white/20 p-2 overflow-hidden transition-all duration-300 ${iconDimensions[size]}`}
      >
        {/* Subtle Ambient Light Reflections */}
        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white/20 blur-sm pointer-events-none" />
        <div className="absolute -bottom-3 -left-3 w-8 h-8 rounded-full bg-emerald-400/20 blur-sm pointer-events-none" />

        {/* Scalable Vector Emblem: Interlocking Mind (M) + Supportive Ally (Heart) */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-xs relative z-10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="mentally-grad-a" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#CCFBF1" />
            </linearGradient>
            <linearGradient id="mentally-accent-glow" x1="50" y1="15" x2="50" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#5EEAD4" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
          </defs>

          {/* Left Wing of 'M' looping into supportive embrace */}
          <path
            d="M 22 74 C 22 52, 22 34, 33 26 C 42 19, 48 28, 50 39"
            stroke="url(#mentally-grad-a)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right Wing of 'M' mirroring into balanced ally embrace */}
          <path
            d="M 78 74 C 78 52, 78 34, 67 26 C 58 19, 52 28, 50 39"
            stroke="url(#mentally-grad-a)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Center Heart-Anchor Meeting at bottom apex */}
          <path
            d="M 50 39 L 50 72"
            stroke="url(#mentally-accent-glow)"
            strokeWidth="9"
            strokeLinecap="round"
          />

          {/* Mind / Awareness Apex Beacon (Radiant Sparkle/Dot) */}
          <circle cx="50" cy="18" r="5" fill="#5EEAD4" />

          {/* Calming Base Connection Arc */}
          <path
            d="M 33 70 C 40 76, 60 76, 67 70"
            stroke="url(#mentally-accent-glow)"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* Optional Wordmark and Subtitle for Compact Pairing */}
      {withText && (
        <div className="flex flex-col text-left min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`font-black tracking-tight text-slate-900 leading-none ${textSizes[size]}`}
            >
              Ment<span className="text-teal-700">Ally</span>
            </span>
            {badge && (
              <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-wider px-1.5 py-0.5 bg-teal-100 text-teal-800 rounded-md border border-teal-200/80 leading-none">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium tracking-normal truncate mt-0.5 leading-tight">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
