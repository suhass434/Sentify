import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  MinusCircle,
  Newspaper,
  BarChart2,
  AlertCircle,
} from 'lucide-react';

const PlatformDetails = () => {
  const { id } = useParams();
  const [platformData, setPlatformData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlatformDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/platforms/${id}`);
        setPlatformData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPlatformDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl mt-8 bg-red-500/10 dark:bg-red-500/5 
                    border border-red-500/20 rounded-lg">
        <div className="flex items-center gap-4 p-6">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <div>
            <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Platform Data</h2>
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { platform, news, reviews } = platformData;

  const getSentimentColor = (sentiment) => {
    if (sentiment > 0.3) return 'text-green-600 dark:text-green-400';
    if (sentiment < -0.3) return 'text-red-600 dark:text-red-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  const SentimentIcon = ({ sentiment, className }) => {
    if (sentiment > 0.3) return <TrendingUp className={`${className} text-green-600 dark:text-green-400`} />;
    if (sentiment < -0.3) return <TrendingDown className={`${className} text-red-600 dark:text-red-400`} />;
    return <MinusCircle className={`${className} text-yellow-600 dark:text-yellow-400`} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Platform Header */}
        <div className="bg-white dark:bg-gradient-to-r from-gray-800 to-gray-900 
                      border border-gray-200 dark:border-gray-700 rounded-lg
                      shadow-sm transition-colors duration-200">
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 
                         bg-gradient-to-r from-blue-600 to-purple-600 
                         dark:from-blue-400 dark:to-purple-400 
                         bg-clip-text text-transparent">
              {platform.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">{platform.description}</p>
          </div>
        </div>

        {/* Overall Sentiment Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-800/50 
                       border border-gray-200 dark:border-gray-700 
                       rounded-lg shadow-sm transition-colors duration-200">
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <BarChart2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Total Sentiment</p>
                  <p className={`text-2xl font-bold ${getSentimentColor((news.overallSentiment + reviews.overallSentiment) / 2)}`}>
                    {(((news.overallSentiment + reviews.overallSentiment) / 2) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* News and Reviews Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* News Analysis */}
          <div className="bg-white dark:bg-gray-800/50 
                       border border-gray-200 dark:border-gray-700 
                       rounded-lg shadow-sm transition-colors duration-200">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl sm:text-2xl text-gray-900 dark:text-gray-100 
                           flex items-center gap-3">
                <Newspaper className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                Top News Analysis
              </h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {news.topNews.map((article, index) => (
                  <div key={index} 
                       className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg 
                                hover:bg-gray-100 dark:hover:bg-gray-700 
                                transition-colors duration-200">
                    <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                      {article.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SentimentIcon sentiment={article.sentiment} className="w-4 h-4" />
                        <span className={`font-medium ${getSentimentColor(article.sentiment)}`}>
                          {(article.sentiment * 100).toFixed(1)}%
                        </span>
                      </div>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 
                                 hover:text-blue-700 dark:hover:text-blue-300 
                                 text-sm font-medium transition-colors duration-200"
                      >
                        Read More →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews section would follow the same pattern */}
        </div>
      </div>
    </div>
  );
};

export default PlatformDetails;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useParams } from 'react-router-dom';

// const PlatformDetails = () => {
//   const { id } = useParams();
//   const [platformData, setPlatformData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchPlatformDetails = async () => {
//       try {
//         const response = await axios.get(`http://localhost:5000/api/platforms/${id}`);
//         setPlatformData(response.data);
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchPlatformDetails();
//   }, [id]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6 bg-red-900/50 text-red-200 rounded-lg">
//         <h2 className="text-xl font-bold mb-2">Error</h2>
//         <p>{error}</p>
//       </div>
//     );
//   }

//   const { platform, news, reviews } = platformData;

//   const getSentimentColor = (sentiment) => {
//     if (sentiment > 0.3) return 'text-green-400';
//     if (sentiment < -0.3) return 'text-red-400';
//     return 'text-yellow-400';
//   };

//   return (
//     <div className="p-6">
//       {/* Platform Header */}
//       <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
//         <h1 className="text-3xl font-bold text-gray-100 mb-4">{platform.name}</h1>
//         <p className="text-gray-300 mb-4">{platform.description}</p>
//       </div>

//       {/* Responsive Grid for News and Reviews */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* News Analysis */}
//         <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
//           <h2 className="text-2xl font-bold text-gray-100 mb-4">News Sentiment Analysis</h2>
//           {news.error ? (
//             <p className="text-red-400">{news.error}</p>
//           ) : (
//             <>
//               <div className="mb-6">
//                 <p className="text-xl mb-2">Overall Sentiment:</p>
//                 <p className={`text-2xl font-bold ${getSentimentColor(news.overallSentiment)}`}>
//                   {(news.overallSentiment * 100).toFixed(1)}%
//                 </p>
//               </div>
//               <div className="space-y-4">
//                 <h3 className="text-xl font-semibold text-gray-100">Top Impactful News</h3>
//                 {news.topNews.map((article, index) => (
//                   <div key={index} className="bg-gray-700 p-4 rounded-lg">
//                     <h4 className="font-semibold text-blue-400 mb-2">{article.title}</h4>
//                     <p className="text-gray-300 mb-2">{article.description}</p>
//                     <div className="flex flex-wrap justify-between items-center gap-2">
//                       <span className={`font-medium ${getSentimentColor(article.sentiment)}`}>
//                         Sentiment: {(article.sentiment * 100).toFixed(1)}%
//                       </span>
//                       <a
//                         href={article.url}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-blue-400 hover:text-blue-300"
//                       >
//                         Read More
//                       </a>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}
//         </div>

//         {/* Reviews Analysis */}
//         <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
//           <h2 className="text-2xl font-bold text-gray-100 mb-4">User Reviews Analysis</h2>
//           {reviews.error ? (
//             <p className="text-red-400">{reviews.error}</p>
//           ) : (
//             <>
//               <div className="mb-6">
//                 <p className="text-xl mb-2">Overall Review Sentiment:</p>
//                 <p className={`text-2xl font-bold ${getSentimentColor(reviews.overallSentiment)}`}>
//                   {(reviews.overallSentiment * 100).toFixed(1)}%
//                 </p>
//               </div>
//               <div className="space-y-4">
//                 <h3 className="text-xl font-semibold text-gray-100">Most Impactful Reviews</h3>
//                 {reviews.topReviews.map((review, index) => (
//                   <div key={index} className="bg-gray-700 p-4 rounded-lg">
//                     <p className="text-gray-300 mb-2">{review.text}</p>
//                     <div className="flex flex-wrap justify-between items-center gap-2">
//                       <span className={`font-medium ${getSentimentColor(review.sentiment)}`}>
//                         Sentiment: {(review.sentiment * 100).toFixed(1)}%
//                       </span>
//                       <span className="text-gray-400">
//                         Rating: {review.score}/5
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PlatformDetails;
