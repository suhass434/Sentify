// src/components/Navbar.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'text-primary-600 font-medium' : 'text-gray-700 hover:text-primary-600';
  };
  
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-primary-700">Sentiment Analyzer</h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className={`px-3 py-2 rounded-md text-sm ${isActive('/')}`}>
                General Analysis
              </Link>
              <Link to="/location" className={`px-3 py-2 rounded-md text-sm ${isActive('/location')}`}>
                Location-Based
              </Link>
              <Link to="/playstore" className={`px-3 py-2 rounded-md text-sm ${isActive('/playstore')}`}>
                Play Store Reviews
              </Link>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" 
              className={`block px-3 py-2 rounded-md text-base ${isActive('/')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              General Analysis
            </Link>
            <Link to="/location" 
              className={`block px-3 py-2 rounded-md text-base ${isActive('/location')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Location-Based
            </Link>
            <Link to="/playstore" 
              className={`block px-3 py-2 rounded-md text-base ${isActive('/playstore')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Play Store Reviews
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;