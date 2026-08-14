import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  textClassName?: string;
  iconOnly?: boolean;
}

export function Logo({
  size = 40,
  showText = true,
  className = '',
  textClassName = 'font-bold text-lg sm:text-xl tracking-tight text-zinc-950 font-sans',
  iconOnly = false,
}: LogoProps) {
  const iconElement = (
    <div
      style={{ width: size, height: size }}
      className="relative shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform"
    >
      <Image
        src="/kevoshlogo (2).png?v=3"
        alt="Kevosh"
        width={size * 2}
        height={size * 2}
        className="w-full h-full object-cover rounded-lg shadow-xs"
        priority
        unoptimized
      />
    </div>
  );

  if (iconOnly) {
    return iconElement;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {iconElement}
      {showText && <span className={textClassName}>Kevosh</span>}
    </div>
  );
}
