// src/api/sentimentApi.js
import axios from 'axios';

// Create a base Axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 600000, // 10 seconds timeout
});

// General sentiment analysis
export const analyzeSentiment = async (platform) => {
  try {
    const response = await apiClient.post(`/api/sentiment/analyze-normal/${platform}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Location-based sentiment analysis
export const analyzeWithLocation = async (platform, location) => {
  try {
    const response = await apiClient.post(`/api/sentiment/analyze-with-location/${platform}/${location}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Play Store sentiment analysis
export const analyzePlayStore = async (appName) => {
  try {
    const response = await apiClient.post(`/api/sentiment/analyze-playstore/${appName}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Error handling helper
const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with an error status
    return {
      status: error.response.status,
      message: error.response.data.message || 'Server error occurred',
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      status: 503,
      message: 'No response from server. Please check your connection.',
    };
  } else {
    // Something else happened while setting up the request
    return {
      status: 500,
      message: error.message || 'An unexpected error occurred',
    };
  }
};

export default {
  analyzeSentiment,
  analyzeWithLocation,
  analyzePlayStore,
};