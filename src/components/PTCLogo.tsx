import React from "react";

interface PTCLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const PTCLogo: React.FC<PTCLogoProps> = ({ size = "md", className = "" }) => {
  const sizes = { sm: "w-8 h-8", md: "w-12 h-12", lg: "w-16 h-16" };
  return <img src="/ptc-logo.png" alt="Pateros Technological College" className={`${sizes[size]} object-contain ${className}`} />;
};
