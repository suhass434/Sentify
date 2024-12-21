import React from 'react';
import img1 from '../assets/1.jpeg';
import img2 from '../assets/2.jpeg';
import img3 from '../assets/3.jpeg';

const AboutUs = () => {
  return (
    <div className="p-6 dark:bg-gray-900 bg-gray-50 transition-colors duration-200">
      <section className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-4 dark:text-gray-100 text-gray-900 text-center transition-colors">
          About Us
        </h2>
        <p className="text-lg mb-8 dark:text-gray-300 text-gray-600 text-center max-w-3xl mx-auto transition-colors">
          Sentify is a platform that helps users analyze the sentiment of different service platforms across various industries. 
          Our goal is to provide insights into customer feedback, helping businesses improve their services.
        </p>
        <h3 className="text-2xl font-semibold mb-8 dark:text-gray-100 text-gray-900 text-center transition-colors">
          Meet the Team
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Team Member 1 */}
          <div className="dark:bg-gray-800 bg-white shadow-lg rounded-lg p-6 transform hover:scale-105 transition-all duration-200 hover:shadow-xl">
            <img
              src={img1}
              alt="Harshith Bezawada"
              className="w-32 h-32 mx-auto rounded-full mb-4 dark:bg-gray-700 bg-gray-100 object-cover"
            />
            <h4 className="text-xl font-semibold dark:text-gray-100 text-gray-900 transition-colors">
              Harshith Bezawada
            </h4>
            <p className="text-blue-500 dark:text-blue-400">ISE</p>
            <p className="dark:text-gray-300 text-gray-600 mt-2 transition-colors">
              Harshith is passionate about building user-friendly and responsive web applications. 
              He loves bringing designs to life with React and Tailwind CSS.
            </p>
          </div>

          {/* Team Member 2 */}
          <div className="dark:bg-gray-800 bg-white shadow-lg rounded-lg p-6 transform hover:scale-105 transition-all duration-200 hover:shadow-xl">
            <img
              src={img2}
              alt="Abhishek V K"
              className="w-32 h-32 mx-auto rounded-full mb-4 dark:bg-gray-700 bg-gray-100 object-cover"
            />
            <h4 className="text-xl font-semibold dark:text-gray-100 text-gray-900 transition-colors">
              Abhishek V K
            </h4>
            <p className="text-blue-500 dark:text-blue-400">AI & DS</p>
            <p className="dark:text-gray-300 text-gray-600 mt-2 transition-colors">
              Abhishek specializes in backend development using Node.js and MongoDB. 
              He ensures the platform runs smoothly and efficiently.
            </p>
          </div>

          {/* Team Member 3 */}
          <div className="dark:bg-gray-800 bg-white shadow-lg rounded-lg p-6 transform hover:scale-105 transition-all duration-200 hover:shadow-xl">
            <img
              src={img3}
              alt="Suhas S"
              className="w-32 h-32 mx-auto rounded-full mb-4 dark:bg-gray-700 bg-gray-100 object-cover"
            />
            <h4 className="text-xl font-semibold dark:text-gray-100 text-gray-900 transition-colors">
              Suhas S
            </h4>
            <p className="text-blue-500 dark:text-blue-400">ISE</p>
            <p className="dark:text-gray-300 text-gray-600 mt-2 transition-colors">
              Suhas focuses on the AI and data analysis part of Sentify. 
              He builds the models for sentiment analysis and ensures the platform provides accurate insights.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;