import { useState } from 'react';
import { motion } from 'framer-motion';
import { analyzeWithLocation } from '../api/sentimentApi';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import SentimentResultCard from '../components/SentimentResultCard';
import SentimentChart from '../components/SentimentChart';

const LocationAnalysisPage = () => {
  const [platform, setPlatform] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!platform.trim()) {
      setError({ message: 'Please enter a product or platform name' });
      return;
    }

    if (!location.trim()) {
      setError({ message: 'Please enter a location' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await analyzeWithLocation(platform, location);
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
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Location-Based Sentiment Analysis
          </h1>

          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
                    Product/Platform Name
                  </label>
                  <input
                    type="text"
                    id="platform"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    placeholder="e.g. Starbucks, Walmart"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. New York, London"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {error && <ErrorMessage message={error.message} onRetry={() => setError(null)} />}

              <button
                type="submit"
                className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                Analyze Sentiment
              </button>
            </form>
          </div>
        </motion.div>

        {loading && <Loading message={`Analyzing ${platform} sentiment in ${location}...`} />}

        {result && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Location Analysis Results</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow-md rounded-lg p-6">
                <SentimentResultCard
                  score={result.score || 0}
                  label={result.label || 'Unknown'}
                  title={`${platform} in ${location}`}
                />
              </div>

              <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="font-medium mb-4">Regional Comparison</h3>
                {result.regionalComparison ? (
                  <div className="h-64">
                    <SentimentChart
                      type="bar"
                      data={result.regionalComparison}
                      title="Sentiment Score by Region"
                    />
                  </div>
                ) : (
                  <p className="text-gray-500">No regional comparison data available.</p>
                )}
              </div>
            </div>

            {result.locationInsights && result.locationInsights.length > 0 && (
              <div className="bg-white shadow-md rounded-lg p-6 mt-6">
                <h3 className="font-medium mb-4">Location-Specific Insights</h3>
                <ul className="space-y-2">
                  {result.locationInsights.map((insight, index) => (
                    <li key={index} className="flex">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.aspectsByLocation && Object.keys(result.aspectsByLocation).length > 0 && (
              <div className="bg-white shadow-md rounded-lg p-6 mt-6">
                <h3 className="font-medium mb-4">Location-Specific Aspects</h3>
                <div className="h-80">
                  <SentimentChart
                    type="bar"
                    data={result.aspectsByLocation}
                    title={`Aspect Scores in ${location}`}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LocationAnalysisPage;