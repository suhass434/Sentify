// src/pages/GeneralAnalysisPage.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { analyzeSentiment } from '../api/sentimentApi';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import SentimentResultCard from '../components/SentimentResultCard';
import SentimentChart from '../components/SentimentChart';

const GeneralAnalysisPage = () => {
  const [platform, setPlatform] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!platform.trim()) {
      setError({ message: 'Please enter a product or platform name' });
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await analyzeSentiment(platform);
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
          <h1 className="text-2xl font-bold text-gray-800 mb-6">General Sentiment Analysis</h1>
          
          <div className="card mb-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
                  Product/Platform Name
                </label>
                <input
                  type="text"
                  id="platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  placeholder="e.g. iPhone 15, Netflix, Tesla"
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
                Analyze Sentiment
              </button>
            </form>
          </div>
        </motion.div>
        
        {loading && <Loading />}
        
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Analysis Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <SentimentResultCard 
                  score={result.score || 0}
                  label={result.label || 'Unknown'}
                  title={`Sentiment for ${platform}`}
                />
              </div>
              
              <div className="card">
                <h3 className="font-medium mb-4">Sentiment Distribution</h3>
                <SentimentChart 
                  type="pie"
                  data={{
                    positive: result.distribution?.positive || 0,
                    neutral: result.distribution?.neutral || 0,
                    negative: result.distribution?.negative || 0
                  }}
                />
              </div>
            </div>
            
            {result.insights && result.insights.length > 0 && (
              <div className="card mt-6">
                <h3 className="font-medium mb-4">Key Insights</h3>
                <ul className="space-y-2">
                  {result.insights.map((insight, index) => (
                    <li key={index} className="flex">
                      <span className="text-primary-500 mr-2">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.aspects && Object.keys(result.aspects).length > 0 && (
              <div className="card mt-6">
                <h3 className="font-medium mb-4">Sentiment by Aspect</h3>
                <div className="h-80">
                  <SentimentChart 
                    type="bar"
                    data={result.aspects}
                    title="Aspect Scores"
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

export default GeneralAnalysisPage;