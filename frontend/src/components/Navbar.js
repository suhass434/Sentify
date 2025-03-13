import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Menu, X, MessageCircle, Info } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';

const Navbar = ({ onLogoClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (onLogoClick) {
      onLogoClick();
    }
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { path: '/contact', label: 'Contact Us', icon: MessageCircle },
    { path: '/about', label: 'About Us', icon: Info },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
        ${isScrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/"
              onClick={handleLogoClick}
              className="flex items-center space-x-2 cursor-pointer group"
            >
              <Sparkles className="w-6 h-6 transition-colors duration-300 text-gray-700 dark:text-blue-400 
                                 group-hover:text-purple-500 dark:group-hover:text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 
                             dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Sentify
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 
                    ${isActive 
                      ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                      : 'text-blue-600 dark:text-gray-300 hover:text-blue-700 hover:bg-blue-50 dark:hover:text-white dark:hover:bg-gray-800'}`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {link.label}
                </Link>
              );
            })}
            {/* Dark Mode Toggle */}
            <DarkModeToggle />
            {/* Login Button */}
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-lg transition-all duration-200 bg-blue-600 dark:bg-blue-500 
                       text-white hover:bg-blue-700 dark:hover:bg-blue-600"
            >
              Login
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <DarkModeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="ml-4 p-2 rounded-lg transition-colors duration-200 text-blue-600 dark:text-gray-400 
                       hover:text-blue-700 hover:bg-gray-200 dark:hover:text-white dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ height: isMobileMenuOpen ? 'auto' : 0 }}
        className="lg:hidden overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg 
                   border-t border-gray-200 dark:border-gray-800"
      >
        <div className="container mx-auto px-4 py-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 
                  ${isActive 
                    ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                    : 'text-blue-600 dark:text-gray-300 hover:text-blue-700 hover:bg-blue-50 dark:hover:text-white dark:hover:bg-gray-800'}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {link.label}
              </Link>
            );
          })}
          {/* Mobile Login Button */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate('/login');
            }}
            className="w-full px-4 py-3 rounded-lg transition-all duration-200 bg-blue-600 dark:bg-blue-500 
                     text-white hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            Login
          </button>
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;
