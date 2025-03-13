// import React, { useState, useEffect, useRef } from 'react';
// import { ChevronDownIcon, SearchIcon } from 'lucide-react';

// const ServiceSelector = ({ onServiceSelect, setPlatformsVisible, selectedService }) => {
//   const [services, setServices] = useState([]);
//   const [filteredServices, setFilteredServices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isServiceMode, setIsServiceMode] = useState(true);
//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     const fetchServices = async () => {
//       try {
//         const response = await fetch('http://localhost:5000/api/services');
//         const data = await response.json();
//         setServices(data);
//         setFilteredServices(data);
//         setLoading(false);
//       } catch (err) {
//         setError('Unable to load services. Please try again later.');
//         setLoading(false);
//       }
//     };

//     fetchServices();

//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//         if (selectedService) setPlatformsVisible(true);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [selectedService, setPlatformsVisible]);

//   const handleSelect = (service) => {
//     onServiceSelect(service.name); // Pass selected service name to parent
//     setIsOpen(false);
//     setPlatformsVisible(true);
//   };

//   const handleSearch = (event) => {
//     const query = event.target.value.toLowerCase();
//     setSearchQuery(query);
//     setFilteredServices(
//       services.filter((service) => 
//         service.name.toLowerCase().includes(query) || 
//         (service.description && service.description.toLowerCase().includes(query))
//       )
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center p-8">
//         <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6 dark:bg-red-500/10 bg-red-50 dark:border-red-500/20 border-red-200 border rounded-lg transition-colors">
//         <p className="text-red-600 dark:text-red-400 font-medium transition-colors">{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-8 bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 from-gray-50 to-gray-100 rounded-2xl shadow-xl dark:border-gray-700 border-gray-200 border transition-all duration-200">
//       <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
//         {isServiceMode ? 'Select a Service' : 'Search for a Company'}
//       </h2>

//       <div className="mb-4">
//         <button
//           onClick={() => setIsServiceMode(true)}
//           className={`px-4 py-2 rounded-lg mr-2 ${
//             isServiceMode
//               ? 'bg-blue-500 text-white'
//               : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200'
//           }`}
//         >
//           Service Mode
//         </button>
//         <button
//           onClick={() => setIsServiceMode(false)}
//           className={`px-4 py-2 rounded-lg ${
//             !isServiceMode
//               ? 'bg-blue-500 text-white'
//               : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200'
//           }`}
//         >
//           Company Search Mode
//         </button>
//       </div>

//       {isServiceMode ? (
//         <div className="relative" ref={dropdownRef}>
//           <button
//             onClick={() => {
//               setIsOpen(!isOpen);
//               setPlatformsVisible(false);
//             }}
//             className={`w-full dark:bg-gray-800 bg-white text-gray-900 dark:text-white p-4 rounded-xl 
//                      dark:border-gray-600 border-gray-200 border
//                      hover:border-blue-400 dark:hover:border-blue-500 
//                      hover:bg-gray-50 dark:hover:bg-gray-700 
//                      transition-all duration-200
//                      flex justify-between items-center group ${
//                        isOpen ? 'border-blue-400 dark:border-blue-500 bg-gray-50 dark:bg-gray-700' : ''
//                      }`}
//           >
//             <span className="text-lg font-medium">
//               {selectedService || 'Choose a Service'}
//             </span>
//             <ChevronDownIcon 
//               className={`w-5 h-5 dark:text-gray-400 text-gray-500 group-hover:text-blue-400 dark:group-hover:text-blue-500 
//                          transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400 dark:text-blue-500' : ''}`}
//             />
//           </button>

//           {isOpen && (
//             <div className="absolute w-full mt-2 dark:bg-gray-800 bg-white 
//                            dark:border-gray-600 border-gray-200 border rounded-xl shadow-2xl
//                            max-h-64 overflow-y-auto z-20 transition-all duration-200">
//               {filteredServices.map((service) => (
//                 <button
//                   key={service._id}
//                   onClick={() => handleSelect(service)}
//                   className="w-full text-left px-6 py-4 dark:text-gray-200 text-gray-700 
//                            hover:text-gray-900 dark:hover:text-white
//                            hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900 dark:hover:to-purple-900
//                            transition-all duration-200 first:rounded-t-xl last:rounded-b-xl
//                            dark:border-gray-700 border-gray-200 border-b last:border-0"
//                 >
//                   <span className="block text-base font-medium">{service.name}</span>
//                   {service.description && (
//                     <span className="block mt-1 text-sm dark:text-gray-400 text-gray-500 transition-colors">
//                       {service.description}
//                     </span>
//                   )}
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="relative">
//           <div className="flex items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
//             <SearchIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
//             <input
//               type="text"
//               value={searchQuery}
//               onChange={handleSearch}
//               placeholder="Enter company name for sentiment analysis..."
//               className="w-full bg-transparent text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 outline-none"
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ServiceSelector;

import React from 'react';
import { useNavigate } from 'react-router-dom';

const ServiceSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8 bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 from-gray-50 to-gray-100 rounded-2xl shadow-xl dark:border-gray-700 border-gray-200 border transition-all duration-200 max-w-4xl mx-auto">
      <h2 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent text-center">
        Select Your Analysis
      </h2>
      <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
        <button
          onClick={() => navigate('/platform/6763a4edf82e23aef2c296b5')}
          className="w-full md:w-1/3 h-20 px-6 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-pink-100 text-black text-lg font-semibold hover:from-blue-400 hover:to-pink-500 shadow-lg transform hover:scale-105 transition-all duration-300"
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate('/playStoreAnalysis')}
          className="w-full md:w-1/3 h-20 px-6 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-pink-100 text-black text-lg font-semibold hover:from-blue-400 hover:to-pink-500 shadow-lg transform hover:scale-105 transition-all duration-300"
        >
          Play Store Analysis
        </button>
        <button
          onClick={() => navigate('/geographicalAnalysis')}
          className="w-full md:w-1/3 h-20 px-6 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-pink-100 text-black text-lg font-semibold hover:from-blue-400 hover:to-pink-500 shadow-lg transform hover:scale-105 transition-all duration-300"
        >
          Geographical Analysis
        </button>
      </div>
    </div>
  );
};

export default ServiceSelector;