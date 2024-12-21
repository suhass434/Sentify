import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon } from 'lucide-react';

const ServiceSelector = ({ onServiceSelect, setPlatformsVisible, selectedService }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/services');
        const data = await response.json();
        setServices(data);
        setLoading(false);
      } catch (err) {
        setError('Unable to load services. Please try again later.');
        setLoading(false);
      }
    };

    fetchServices();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (selectedService) setPlatformsVisible(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedService, setPlatformsVisible]);

  const handleSelect = (service) => {
    onServiceSelect(service.name);
    setIsOpen(false);
    setPlatformsVisible(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 dark:bg-red-500/10 bg-red-50 dark:border-red-500/20 border-red-200 border rounded-lg transition-colors">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full dark:bg-red-500/20 bg-red-100">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 dark:text-red-400 font-medium transition-colors">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 from-gray-50 to-gray-100 rounded-2xl shadow-xl dark:border-gray-700 border-gray-200 border transition-all duration-200">
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
        Select a Service
      </h2>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setPlatformsVisible(false);
          }}
          className={`w-full dark:bg-gray-800 bg-white text-gray-900 dark:text-white p-4 rounded-xl 
                     dark:border-gray-600 border-gray-200 border
                     hover:border-blue-400 dark:hover:bg-gray-700 hover:bg-gray-50 
                     transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
                     flex justify-between items-center group ${
                       isOpen ? 'border-blue-400 dark:bg-gray-700 bg-gray-50' : ''
                     }`}
        >
          <span className="text-lg font-medium">
            {selectedService || 'Choose a Service'}
          </span>
          <ChevronDownIcon 
            className={`w-5 h-5 dark:text-gray-400 text-gray-500 group-hover:text-blue-400 
                       transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute w-full mt-2 dark:bg-gray-800 bg-white 
                         dark:border-gray-600 border-gray-200 border rounded-xl shadow-2xl
                         max-h-64 overflow-y-auto z-20 transition-all duration-200">
            {services.map((service) => (
              <button
                key={service._id}
                onClick={() => handleSelect(service)}
                className="w-full text-left px-6 py-4 dark:text-gray-200 text-gray-700 
                         hover:text-gray-900 dark:hover:text-white
                         dark:hover:bg-gradient-to-r dark:hover:from-blue-500/20 dark:hover:to-purple-500/20
                         hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50
                         transition-all duration-200 first:rounded-t-xl last:rounded-b-xl
                         dark:border-gray-700 border-gray-200 border-b last:border-0"
              >
                <span className="block text-base font-medium">{service.name}</span>
                {service.description && (
                  <span className="block mt-1 text-sm dark:text-gray-400 text-gray-500 transition-colors">
                    {service.description}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceSelector;