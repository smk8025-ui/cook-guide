import React from "react";

interface LogoMarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LogoMark({ size = "md", className = "" }: LogoMarkProps) {
  // Define size classes for the outer wrapper
  const sizeClasses = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-12 h-12 rounded-xl",
    lg: "w-20 h-20 rounded-2xl",
  };

  // Define size classes for the SVG
  const svgSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-12 h-12",
  };

  // Define size classes for the online badge
  const badgeSizes = {
    sm: "h-2 w-2 -top-0.5 -right-0.5",
    md: "h-2.5 w-2.5 -top-0.5 -right-0.5",
    lg: "h-4 w-4 -top-1 -right-1",
  };

  const badgeInnerSizes = {
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-4 w-4",
  };

  return (
    <div
      className={`relative flex items-center justify-center bg-gradient-to-br from-brand-primary-light to-brand-primary shadow-md shadow-brand-primary/20 dark:shadow-brand-primary/10 ${sizeClasses[size]} ${className}`}
    >
      <svg
        className={`text-white ${svgSizes[size]}`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Refrigerator Outline */}
        <rect
          x="30"
          y="15"
          width="40"
          height="70"
          rx="8"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Freezer/Fridge Divider Line */}
        <path d="M30 43H70" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        {/* Door Handles */}
        <path d="M37 25V33" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M37 51V63" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />

        {/* Snowflake in Freezer (Top) */}
        <path
          d="M50 24V34M45 29H55M46.5 25.5L53.5 32.5M46.5 32.5L53.5 25.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Chef Hat in Fridge (Bottom) */}
        <path
          d="M44 65C44 61 46.5 60 48.5 61.5C50 60 52 60 53.5 61.5C55.5 60 58 61 58 65C58 67 56 68.5 56 68.5H46C46 68.5 44 67 44 65Z"
          fill="currentColor"
        />
        <rect x="47" y="68.5" width="8" height="3" rx="1" fill="currentColor" />

        {/* Pulsing sparkles/dots in the background */}
        <circle cx="82" cy="22" r="2" fill="currentColor" className="animate-pulse" />
        <circle cx="18" cy="72" r="3" fill="currentColor" className="animate-pulse" />
      </svg>
      {/* Decorative dot/badge */}
      <span className={`absolute ${badgeSizes[size]} flex`}>
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
        <span className={`relative inline-flex rounded-full bg-brand-success ${badgeInnerSizes[size]}`}></span>
      </span>
    </div>
  );
}
