// src/pages/PlayStoreAnalysisPage.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { analyzePlayStore } from '../api/sentimentApi';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import SentimentResultCard from '../components/SentimentResultCard';
import SentimentChart from '../components/SentimentChart';

const PlayStoreAnalysisPage = () => {
  const [appName, setAppName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!appName.trim()) {
      setError({ message: 'Please enter an app name' });
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await analyzePlayStore(appName);
      setResult(response);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Play Store Reviews Analysis</h1>
          
          <div className="card mb-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="appName" className="block text-sm font-medium text-gray-700 mb-1">
                  App Name
                </label>
                <input
                  type="text"
                  id="appName"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. Instagram, TikTok, Spotify"
                  className="input-field"
                  required
                />
              </div>
              
              {error && <ErrorMessage message={error.message} onRetry={() => setError(null)} />}
              
              <button 
                type="submit" 
                className="btn btn-primary w-full md:w-auto"
                disabled={loading}
              >
                Analyze App Reviews
              </button>
            </form>
          </div>
        </motion.div>
        
        {loading && <Loading message={`Analyzing ${appName} reviews...`} />}
        
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">App Review Analysis</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <SentimentResultCard 
                  score={result.score || 0}
                  label={result.label || 'Unknown'}
                  title={`${appName} Reviews`}
                />
              </div>
              
              <div className="card">
                <h3 className="font-medium mb-4">Rating Distribution</h3>
                {result.ratingDistribution ? (
                  <div className="h-64">
                    <SentimentChart 
                      type="bar"
                      data={result.ratingDistribution}
                      title="Ratings"
                    />
                  </div>
                ) : (
                  <p className="text-gray-500">No rating distribution data available.</p>
                )}
              </div>
            </div>
            
            {result.topPositiveReviews && result.topPositiveReviews.length > 0 && (
              <div className="card mt-6">
                <h3 className="font-medium mb-4">Top Positive Reviews</h3>
                <ul className="space-y-4">
                  {result.topPositiveReviews.map((review, index) => (
                    <li key={index} className="p-3 bg-green-50 rounded-md">
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-500">
                          {[...Array(review.rating || 5)].map((_, i) => (
                            <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 ml-2">{review.date || 'Recent'}</span>
                      </div>
                      <p className="text-sm">{review.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.topNegativeReviews && result.topNegativeReviews.length > 0 && (
              <div className="card mt-6">
                <h3 className="font-medium mb-4">Top Critical Reviews</h3>
                <ul className="space-y-4">
                  {result.topNegativeReviews.map((review, index) => (
                    <li key={index} className="p-3 bg-red-50 rounded-md">
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-500">
                          {[...Array(review.rating || 2)].map((_, i) => (
                            <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 ml-2">{review.date || 'Recent'}</span>
                      </div>
                      <p className="text-sm">{review.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.keyIssues && result.keyIssues.length > 0 && (
              <div className="card mt-6">
                <h3 className="font-medium mb-4">Key Issues</h3>
                <ul className="space-y-2">
                  {result.keyIssues.map((issue, index) => (
                    <li key={index} className="flex">
                      <span className="text-red-500 mr-2">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.featureRequests && result.featureRequests.length > 0 && (
              <div className="card mt-6">
                <h3 className="font-medium mb-4">Feature Requests</h3>
                <ul className="space-y-2">
                  {result.featureRequests.map((feature, index) => (
                    <li key={index} className="flex">
                      <span className="text-primary-500 mr-2">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PlayStoreAnalysisPage;