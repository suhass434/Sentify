import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setIsDarkMode(savedMode === 'true');
      document.documentElement.classList.toggle('dark', savedMode === 'true');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      document.documentElement.classList.toggle('dark', newMode);
      localStorage.setItem('darkMode', String(newMode));
      return newMode;
    });
  };

  return (
    <button
      onClick={toggleDarkMode}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      className={`
        relative h-6 w-12 sm:h-8 sm:w-16 md:h-10 md:w-20 rounded-full p-[2px]
        transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isDarkMode ? 
          'bg-slate-700 border border-slate-600 focus:ring-slate-500' : 
          'bg-sky-100 border border-sky-200 focus:ring-sky-500'
        }
      `}
    >
      <div
        className={`
          absolute top-[2px] md:top-[3px] transform transition-all duration-500 ease-in-out
          w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center
          ${isDarkMode ?
            'translate-x-6 sm:translate-x-8 md:translate-x-9 bg-slate-800 text-yellow-300' :
            'translate-x-0 bg-sky-50 text-yellow-500'
          }
          shadow-lg
          ${isDarkMode ?
            'shadow-slate-900/50' :
            'shadow-sky-200/50'
          }
        `}
      >
        {isDarkMode ? (
          <Moon size={12} className="transition-transform duration-500 rotate-0" />
        ) : (
          <Sun size={12} className="transition-transform duration-500 rotate-90" />
        )}
      </div>
      
      {/* Background icons for enhanced visual effect */}
      <span className={`
        absolute right-1 md:right-2 top-1/2 -translate-y-1/2 transition-opacity duration-300
        ${isDarkMode ? 'opacity-30' : 'opacity-0'}
      `}>
        <Moon size={10} className="text-slate-400" />
      </span>
      <span className={`
        absolute left-1 md:left-2 top-1/2 -translate-y-1/2 transition-opacity duration-300
        ${isDarkMode ? 'opacity-0' : 'opacity-30'}
      `}>
        <Sun size={10} className="text-sky-400" />
      </span>
    </button>
  );
};

export default DarkModeToggle;
