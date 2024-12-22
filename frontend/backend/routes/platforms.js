import express from 'express';
import Platform from '../models/Platform.js';
import axios from 'axios';
import gplay from 'google-play-scraper';
import natural from 'natural';

const router = express.Router();
//const analyzer = new natural.SentimentAnalyzer();
const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');

// Helper function for sentiment analysis
const analyzeSentiment = (text) => {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text);
  return analyzer.getSentiment(tokens);
};
router.get('/', async (req, res) => {
  try {
    const { service } = req.query;
    
    if (!service) {
      return res.status(400).json({ error: 'Service parameter is required' });
    }

    const platforms = await Platform.find({ service: service });
    res.json(platforms);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch platforms' });
  }
});
// Get platform details with sentiment analysis
router.get('/:id', async (req, res) => {
  try {
    const platform = await Platform.findById(req.params.id);
    if (!platform) {
      return res.status(404).json({ error: 'Platform not found' });
    }

    // Parallel API calls for news and reviews
    const [newsData, reviewsData] = await Promise.all([
      getNewsAndSentiment(platform.name),
      getAppReviewsAndSentiment(platform.appId) // appId should be stored in your platform model
    ]);

    res.json({
      platform,
      news: newsData,
      reviews: reviewsData
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch platform details' });
  }
});

// Helper function to get news and analyze sentiment
async function getNewsAndSentiment(platformName) {
  try {
    // News API call
    const newsResponse = await axios.get(
      `https://newsapi.org/v2/everything?q=${platformName}&sortBy=relevancy&pageSize=100`,
      {
        headers: { 'X-Api-Key': process.env.NEWS_API_KEY }
      }
    );

    // Reddit API call (requires OAuth setup)
    const redditResponse = await axios.get(
      `https://oauth.reddit.com/search.json?q=${platformName}&sort=relevance&limit=100`,
      {
        headers: { 'Authorization': `Bearer ${process.env.REDDIT_TOKEN}` }
      }
    );

    // Combine and analyze news
    const allNews = [...newsResponse.data.articles, ...redditResponse.data.data.children.map(post => ({
      title: post.data.title,
      description: post.data.selftext,
      url: `https://reddit.com${post.data.permalink}`,
      source: 'Reddit'
    }))];

    // Analyze sentiment for each article
    const analyzedNews = allNews.map(article => ({
      ...article,
      sentiment: analyzeSentiment(article.title + ' ' + (article.description || ''))
    }));

    // Sort by sentiment impact and get top 5 most impactful
    const sortedNews = analyzedNews
      .sort((a, b) => Math.abs(b.sentiment) - Math.abs(a.sentiment))
      .slice(0, 5);

    // Calculate overall sentiment
    const overallSentiment = analyzedNews.reduce((acc, curr) => acc + curr.sentiment, 0) / analyzedNews.length;

    return {
      overallSentiment,
      topNews: sortedNews
    };
  } catch (error) {
    console.error('News API Error:', error);
    return {
      overallSentiment: 0,
      topNews: [],
      error: 'Failed to fetch news data'
    };
  }
}

// Helper function to get app reviews and analyze sentiment
async function getAppReviewsAndSentiment(appId) {
  try {
    if (!appId) {
      throw new Error('App ID not provided');
    }

    // Fetch reviews from Google Play
    const reviews = await gplay.reviews({
      appId: appId,
      sort: gplay.sort.RELEVANCE,
      num: 100
    });

    // Analyze sentiment for each review
    const analyzedReviews = reviews.data.map(review => ({
      ...review,
      sentiment: analyzeSentiment(review.text)
    }));

    // Sort by sentiment impact and get top 5 most impactful
    const sortedReviews = analyzedReviews
      .sort((a, b) => Math.abs(b.sentiment) - Math.abs(a.sentiment))
      .slice(0, 5);

    // Calculate overall sentiment
    const overallSentiment = analyzedReviews.reduce((acc, curr) => acc + curr.sentiment, 0) / analyzedReviews.length;

    return {
      overallSentiment,
      topReviews: sortedReviews
    };
  } catch (error) {
    console.error('Google Play Scraper Error:', error);
    return {
      overallSentiment: 0,
      topReviews: [],
      error: 'Failed to fetch review data'
    };
  }
}

// Export router as default export
export default router;
