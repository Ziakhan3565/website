import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
}) => {
  const iconDimensions = {
    sm: { box: 32, svg: 22, text: 'text-base', sub: 'text-[9px]' },
    md: { box: 40, svg: 28, text: 'text-lg', sub: 'text-[10px]' },
    lg: { box: 48, svg: 34, text: 'text-xl', sub: 'text-xs' },
    xl: { box: 58, svg: 42, text: 'text-2xl', sub: 'text-sm' },
  }[size];

  return (
    <div className="flex items-center gap-3 select-none group cursor-pointer">
      {/* Brand Icon Matching Web 3.0 Platform */}
      <div
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] text-white shadow-md shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300"
        style={{ width: iconDimensions.box, height: iconDimensions.box }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-white"
        >
          {/* Futuristic Web 3 / Hand Peace glyph */}
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-extrabold tracking-tight text-white group-hover:text-purple-400 transition-colors font-sans leading-none ${iconDimensions.text}`}>
            Zia Khan
          </span>
          <span className={`font-mono uppercase font-bold text-neutral-400 tracking-wider mt-1 ${iconDimensions.sub}`}>
            LET'S GET INTO WEB 3.0
          </span>
        </div>
      )}
    </div>
  );
};
