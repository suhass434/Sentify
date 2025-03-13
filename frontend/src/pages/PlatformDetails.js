// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import {
//   TrendingUp,
//   TrendingDown,
//   MinusCircle,
//   BarChart2,
//   AlertCircle,
// } from 'lucide-react';

// const PlatformDetails = () => {
//   const [platformData, setPlatformData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isSummaryExpanded, setIsSummaryExpanded] = useState(false); // For "Load More" functionality
//   const platformName = 'Swiggy'; // Hardcoded for now

//   useEffect(() => {
//     const fetchPlatformDetails = async () => {
//       try {
//         const response = await axios.get(`http://localhost:5001/api/platforms/${platformName}`);
//         if (response.data) {
//           setPlatformData(response.data);
//         } else {
//           throw new Error("No data received from API");
//         }
//         setLoading(false);
//       } catch (err) {
//         setError(err.message || 'Failed to load platform details. Please try again.');
//         setLoading(false);
//       }
//     };

//     fetchPlatformDetails();
//   }, [platformName]);

//   const getSentimentColor = (sentiment) => {
//     if (sentiment > 60) return 'text-green-600 dark:text-green-400';
//     if (sentiment < 40) return 'text-red-600 dark:text-red-400';
//     return 'text-yellow-600 dark:text-yellow-400';
//   };

//   const getTrendIcon = (trend) => {
//     if (trend === 'Upward') return <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />;
//     if (trend === 'Downward') return <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />;
//     return <MinusCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />;
//   };

//   const toggleSummary = () => {
//     setIsSummaryExpanded(!isSummaryExpanded);
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
//         <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="mx-auto max-w-2xl mt-8 p-6 bg-red-100 dark:bg-red-900 border border-red-400 rounded-lg shadow-lg">
//         <div className="flex items-center gap-4">
//           <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
//           <div>
//             <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
//               Error Loading Platform Data
//             </h2>
//             <p className="text-red-500 dark:text-red-300">{error}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const { analyzed_content, summary, trend, aspects } = platformData || {};
//   const overallSentiment = trend?.confidence ? (trend.confidence * 100).toFixed(1) : "N/A";
//   const dominantEmotion = trend?.trend || "No data available";
//   const shortSummary = summary?.slice(0, 200); // Shortened summary for preview

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* Platform Header */}
//         <div className="bg-white dark:bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow">
//           <div className="p-6 sm:p-8">
//             <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
//               {platformName}
//             </h1>
//             <p className="text-gray-600 dark:text-gray-300 text-lg">
//               Sentiment analysis and insights for {platformName}.
//             </p>
//           </div>
//         </div>

//         {/* Sentiment Overview */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6 flex items-center space-x-4">
//             <BarChart2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
//             <div>
//               <p className="text-gray-600 dark:text-gray-400">Overall Sentiment</p>
//               <p className={`text-2xl font-bold ${getSentimentColor(overallSentiment)}`}>
//                 {overallSentiment}%
//               </p>
//             </div>
//           </div>
//           <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6 flex items-center space-x-4">
//             {getTrendIcon(dominantEmotion)}
//             <div>
//               <p className="text-gray-600 dark:text-gray-400">Dominant Emotion</p>
//               <p className="text-2xl font-bold">{dominantEmotion}</p>
//             </div>
//           </div>
//         </div>

//         {/* Summary */}
//         <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6">
//           <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Summary</h2>
//           <p className="text-gray-600 dark:text-gray-300 mt-4">
//             {isSummaryExpanded ? summary : `${shortSummary}...`}
//           </p>
//           {summary?.length > 200 && (
//             <button
//               onClick={toggleSummary}
//               className="mt-2 text-blue-500 hover:underline"
//             >
//               {isSummaryExpanded ? 'Show Less' : 'Load More'}
//             </button>
//           )}
//         </div>

//         {/* Aspects Analysis */}
//         <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6">
//           <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Aspects Analysis</h2>
//           <ul className="mt-4 space-y-4">
//             {Object.entries(aspects || {}).map(([aspect, value]) => (
//               <li key={aspect} className="flex items-center justify-between">
//                 <span className="text-gray-600 dark:text-gray-300 capitalize">{aspect}</span>
//                 <span className={`text-lg font-bold ${getSentimentColor(value.avg_score)}`}>
//                   {(value.avg_score || 0).toFixed(1)}%
//                 </span>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Analyzed Content */}
//         <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6">
//           <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Analyzed Content</h2>
//           <div className="mt-4 space-y-4">
//             {analyzed_content?.length > 0 ? (
//               analyzed_content.map((content, index) => (
//                 <div key={index} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
//                   <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
//                     <a href={content.url} target="_blank" rel="noopener noreferrer">
//                       {content.title || "No title"}
//                     </a>
//                   </h4>
//                   <p className="text-gray-600 dark:text-gray-300">
//                     Sentiment: {content.sentiment.label} ({content.sentiment.score}/100)
//                   </p>
//                 </div>
//               ))
//             ) : (
//               <p className="text-gray-600 dark:text-gray-300">No content available.</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PlatformDetails;


import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertCircle,
  Search,
  Loader2,
  ExternalLink
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const PlatformDetails = () => {
  const [searchInput, setSearchInput] = useState('');
  const [platformName, setPlatformName] = useState('');
  const [platformData, setPlatformData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlatformDetails = useCallback(async (name) => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5001/api/sentiment/analyze-normal/${name}`);
      if (!response.ok) throw new Error('Failed to fetch platform data');
      const data = await response.json();
      setPlatformData(data);
    } catch (err) {
      setError(err.message || 'Failed to load platform details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setPlatformName(searchInput);
    fetchPlatformDetails(searchInput);
  };

  // Calculate metrics from analyzed content
  const calculateMetrics = (data) => {
    if (!data?.analyzed_content?.length) return {};
    
    const sentiments = data.analyzed_content.map(content => content.sentiment.score);
    const emotions = data.analyzed_content.map(content => ({
      emotion: content.emotions.emotion,
      confidence: content.emotions.confidence
    }));

    // Calculate sentiment distribution
    const sentimentDistribution = sentiments.reduce((acc, score) => {
      const category = score >= 70 ? 'Positive' : score >= 40 ? 'Neutral' : 'Negative';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Calculate emotion distribution
    const emotionCount = emotions.reduce((acc, curr) => {
      acc[curr.emotion] = (acc[curr.emotion] || 0) + 1;
      return acc;
    }, {});

    const overallSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    const dominantEmotion = Object.entries(emotionCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Not Available';

    return {
      overallSentiment: overallSentiment.toFixed(1),
      dominantEmotion,
      sentimentDistribution,
      emotionCount
    };
  };

  const SearchBar = () => (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Enter platform name to analyze..."
          className="w-full px-6 py-4 pl-14 rounded-xl border-2 border-gray-200 
                   dark:border-gray-700 bg-white dark:bg-gray-800 
                   text-gray-900 dark:text-gray-100 text-lg
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   placeholder-gray-400 dark:placeholder-gray-500
                   transition-all duration-300 ease-in-out
                   group-hover:border-blue-400 dark:group-hover:border-blue-600"
        />
        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 
                        w-6 h-6 text-gray-400 group-hover:text-blue-500 
                        transition-colors duration-300" />
        <button
          type="submit"
          disabled={loading || !searchInput.trim()}
          className="absolute right-3 top-1/2 transform -translate-y-1/2
                   px-6 py-2 bg-blue-600 hover:bg-blue-700 
                   text-white rounded-lg flex items-center gap-2 
                   disabled:bg-gray-400 disabled:cursor-not-allowed
                   transition-all duration-300 ease-in-out
                   focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Search className="w-5 h-5" />
              Analyze
            </>
          )}
        </button>
      </form>
    </div>
  );

  const COLORS = ['#22c55e', '#eab308', '#ef4444'];

  const metrics = calculateMetrics(platformData);
  const sentimentChartData = metrics.sentimentDistribution ? 
    Object.entries(metrics.sentimentDistribution).map(([name, value]) => ({
      name,
      value
    })) : [];

  const emotionChartData = metrics.emotionCount ?
    Object.entries(metrics.emotionCount).map(([name, value]) => ({
      name,
      value
    })) : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Search Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-center 
                       text-gray-900 dark:text-gray-100 mb-8">
            Platform Analysis Dashboard
          </h1>
          <SearchBar />
        </div>

        {error ? (
          <div className="p-6 bg-red-50 dark:bg-red-900/50 border-2 
                       border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        ) : platformData && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Metrics Cards */}
            <div className="col-span-full lg:col-span-1 space-y-6">
              {/* Overall Metrics */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Overall Metrics
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 
                               bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-300">Sentiment Score</span>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {metrics.overallSentiment || 'N/A'}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 
                               bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-300">Dominant Emotion</span>
                    <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {metrics.dominantEmotion}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sentiment Distribution Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Sentiment Distribution
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sentimentChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Analyzed Content */}
            <div className="col-span-full lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Recent Analysis
                </h2>
                <div className="space-y-4 max-h-[calc(100vh-20rem)] overflow-y-auto">
                  {platformData.analyzed_content?.slice(0, 10).map((content, index) => (
                    <div key={index} 
                         className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg 
                                  hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-blue-600 dark:text-blue-400">
                          {content.title || 'Untitled Content'}
                        </h3>
                        <a
                          href={content.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-gray-500 
                                   hover:text-blue-500 transition-colors duration-200"
                        >
                          View Source <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Source: </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {content.source || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Sentiment: </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {content.sentiment.label} ({content.sentiment.score}%)
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Emotion: </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {content.emotions.emotion} ({(content.emotions.confidence * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">VADER Score: </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {content.sentiment.raw_scores.vader.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!platformData.analyzed_content || platformData.analyzed_content.length === 0) && (
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      No analysis data available
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Emotion Distribution Chart */}
            {emotionChartData.length > 0 && (
              <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Emotion Distribution
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={emotionChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Aspect Sentiments */}
            {Object.keys(platformData.analyzed_content?.[0]?.aspect_sentiments || {}).length > 0 && (
              <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Aspect Analysis</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(platformData.analyzed_content[0].aspect_sentiments).map(([aspect, data]) => (
                    <div key={aspect} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 capitalize mb-2">{aspect}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Score:</span>
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {data.score?.toFixed(1) || 'N/A'}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Mentions:</span>
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {data.count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformDetails;