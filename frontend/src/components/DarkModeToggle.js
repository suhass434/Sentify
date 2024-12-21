import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check localStorage first
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setIsDarkMode(savedMode === 'true');
      document.documentElement.classList.toggle('dark', savedMode === 'true');
    } else {
      // Check system preference
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
        relative h-10 w-20 rounded-full p-1
        transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isDarkMode ? 
          'bg-slate-700 border-2 border-slate-600 focus:ring-slate-500' : 
          'bg-sky-100 border-2 border-sky-200 focus:ring-sky-500'
        }
      `}
    >
      <div
        className={`
          absolute top-1 
          transform transition-all duration-500 ease-in-out
          w-8 h-8 rounded-full flex items-center justify-center
          ${isDarkMode ?
            'translate-x-9 bg-slate-800 text-yellow-300' :
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
          <Moon size={16} className="transition-transform duration-500 rotate-0" />
        ) : (
          <Sun size={16} className="transition-transform duration-500 rotate-90" />
        )}
      </div>
      
      {/* Background icons for enhanced visual effect */}
      <span className={`
        absolute right-2 top-1/2 -translate-y-1/2 transition-opacity duration-300
        ${isDarkMode ? 'opacity-30' : 'opacity-0'}
      `}>
        <Moon size={14} className="text-slate-400" />
      </span>
      <span className={`
        absolute left-2 top-1/2 -translate-y-1/2 transition-opacity duration-300
        ${isDarkMode ? 'opacity-0' : 'opacity-30'}
      `}>
        <Sun size={14} className="text-sky-400" />
      </span>
    </button>
  );
};

export default DarkModeToggle;