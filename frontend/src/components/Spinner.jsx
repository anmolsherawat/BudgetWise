import React from 'react';

const Spinner = ({ size = 'lg', text = 'Processing' }) => {
  // Size mapping to standard dimensions
  const sizes = {
    sm: 40,
    md: 60,
    lg: 80,
    xl: 120,
  };

  const currentSize = sizes[size] || 80;

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-transparent w-full h-full animate-fade-in select-none">
      <div 
        className="relative mb-10"
        style={{ width: currentSize, height: currentSize }}
      >
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full animate-spin-slow"
        >
          {/* Dot Ring based on the user-provided image */}
          {/* We place 8 dots at 45 degree increments, decreasing in radius and opacity */}
          {[...Array(8)].map((_, i) => {
            // Angle in radians
            const angle = (i * 45) * (Math.PI / 180);
            const radius = 38; // Distance from center
            const cx = 50 + radius * Math.cos(angle - Math.PI/2);
            const cy = 50 + radius * Math.sin(angle - Math.PI/2);
            
            // Dot radius decreases linearly
            const dotRadius = 6.5 - (i * 0.6);
            
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={Math.max(dotRadius, 1.5)}
                className="fill-indigo-500 dark:fill-indigo-500/80"
                style={{
                  opacity: 1 - (i * 0.08)
                }}
              />
            );
          })}
        </svg>
      </div>

      {text && (
        <h3 className="text-2xl md:text-3xl font-light text-[#374151] dark:text-slate-400 tracking-tight text-center">
          {text}
        </h3>
      )}

      {/* Embedded Styles for smooth execution */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 1s linear infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default Spinner;
