import React from "react";

interface PTCLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const PTCLogo: React.FC<PTCLogoProps> = ({ size = "md", className = "" }) => {
  const sizeMap = {
    sm: "w-7 h-7",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  return (
    <div className={`relative shrink-0 flex items-center justify-center ${className}`}>
      <img
        src="/ptc-logo.png"
        alt="Pateros Technological College Logo"
        className={`${sizeMap[size]} object-contain rounded-full`}
        onError={(e) => {
          // Fallback SVG if image fails to load
          const target = e.currentTarget as HTMLElement;
          target.style.display = "none";
          if (target.nextElementSibling) {
            (target.nextElementSibling as HTMLElement).style.display = "flex";
          }
        }}
      />
      <div
        style={{ display: "none" }}
        className={`${sizeMap[size]} rounded-full bg-teal-800 text-white font-black text-xs items-center justify-center border-2 border-teal-600 shadow-xs`}
      >
        PTC
      </div>
    </div>
  );
};
