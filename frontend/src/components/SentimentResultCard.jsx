// src/components/SentimentResultCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

const SentimentResultCard = ({ score, label, title }) => {
  // Determine color based on sentiment
  const getColorClass = () => {
    if (score >= 70) return 'bg-green-100 border-green-500 text-green-800';
    if (score >= 40) return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    return 'bg-red-100 border-red-500 text-red-800';
  };

  // Get emoji based on sentiment
  const getEmoji = () => {
    if (score >= 70) return '😀';
    if (score >= 40) return '😐';
    return '😟';
  };

  const colorClass = getColorClass();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-lg border-l-4 p-4 ${colorClass}`}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">{title || 'Overall Sentiment'}</h3>
          <div className="text-3xl font-bold mt-2 flex items-center">
            <span className="mr-2">{score}/100</span>
            <span className="text-2xl">{getEmoji()}</span>
          </div>
          <p className="mt-1 text-sm">{label}</p>
        </div>
        <div className="relative h-24 w-24">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e6e6e6"
              strokeWidth="10"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={`${score * 2.83} 283`}
              strokeDashoffset="0"
              transform="rotate(-90 50 50)"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default SentimentResultCard;