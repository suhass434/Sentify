import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Server, AlertCircle } from 'lucide-react';

const PlatformList = ({ selectedService }) => {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedService) {
      setLoading(true);
      fetch(`http://localhost:5000/api/platforms?service=${selectedService}`)
        .then((response) => response.json())
        .then((data) => {
          setPlatforms(data);
          setLoading(false);
        })
        .catch((error) => {
          setError('Failed to load platforms. Please try again later.');
          setLoading(false);
        });
    }
  }, [selectedService]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[300px] space-y-4">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading platforms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-xl">
        <div className="flex items-center justify-center min-h-[200px] sm:min-h-[300px]">
          <div className="flex items-center space-x-3 text-red-500 dark:text-red-400">
            <AlertCircle className="w-6 h-6 md:w-8 md:h-8" />
            <p className="text-sm md:text-base">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            {selectedService}
          </span>
          <span className="text-gray-600 dark:text-gray-400 text-lg sm:text-xl ml-2">Platforms</span>
        </h2>
        <div className="mt-4 sm:mt-0 px-3 py-2 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{platforms.length} platforms available</span>
        </div>
      </div>

      {platforms.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {platforms.map((platform) => (
            <motion.div key={platform._id} variants={item}>
              <Link
                to={`/platform/${platform._id}`}
                className="group block p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 
                         dark:border-gray-700 hover:border-blue-400/50 hover:bg-gray-100 dark:hover:bg-gray-800 
                         transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-500/10 rounded-lg">
                    <Server className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 dark:text-blue-400" />
                  </div>
                  <ArrowRight
                    className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 
                                      dark:group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all duration-300"
                  />
                </div>

                <h3
                  className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 group-hover:text-blue-500 
                             dark:group-hover:text-blue-400 transition-colors duration-300"
                >
                  {platform.name}
                </h3>

                <p
                  className="text-gray-600 dark:text-gray-400 text-sm sm:text-base line-clamp-2 group-hover:text-gray-700 
                             dark:group-hover:text-gray-300 transition-colors duration-300"
                >
                  {platform.description || 'No description available'}
                </p>

                {platform.features && platform.features.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {platform.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs rounded-md bg-gray-200/50 dark:bg-gray-700/50 
                                 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[300px] text-center">
          <Server className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-2">No platforms found</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">Check back later for updates</p>
        </div>
      )}
    </div>
  );
};

export default PlatformList;
