import pandas as pd
import numpy as np
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
from transformers import pipeline
import praw
import requests
import spacy
from datetime import datetime, timedelta
from collections import Counter
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.spatial.distance import cosine
import google.generativeai as genai
from geopy.geocoders import Nominatim
from typing import Dict, List, Optional
import pycountry
import sys
import json
import contextlib
import io
import math
from dotenv import load_dotenv, find_dotenv
import os
from concurrent.futures import ThreadPoolExecutor 

class EnhancedContentAnalyzer:
    def __init__(self, reddit_credentials, news_api_key, gemini_api_key):
        """
        Initialize the EnhancedContentAnalyzer with necessary credentials and models.
        """
        self.vader = SentimentIntensityAnalyzer()
        self.reddit = praw.Reddit(**reddit_credentials)
        self.news_api_key = news_api_key
        self.nlp = spacy.load('en_core_web_sm')
        
        # Initialize models
        self.emotion_classifier = pipeline("text-classification", 
                                        model="j-hartmann/emotion-english-distilroberta-base", 
                                        device=-1)
        
        # Sentiment thresholds
        self.sentiment_labels = {
            range(0, 35): "Negative",
            range(35, 65): "Neutral",
            range(65, 101): "Positive"
        }
        genai.configure(api_key=gemini_api_key)
        self.gemini_model = genai.GenerativeModel("gemini-1.5-flash")

    def clean_text(self, text):
        """
        Clean and preprocess text by removing URLs, mentions, hashtags, and retaining important tokens.
        """
        if not isinstance(text, str):
            return ""
        
        text = re.sub(r'http\S+|\@\w+|\#\w+|[^\w\s]', '', text)
        return ' '.join([word.lower() for word in text.split() if len(word) > 2])

    def get_combined_sentiment(self, text):
        """
        Calculate combined sentiment score using VADER and TextBlob with weighted averaging.
        """
        cleaned_text = self.clean_text(text)
        
        # VADER sentiment
        vader_scores = self.vader.polarity_scores(cleaned_text)
        vader_compound = vader_scores['compound']
        
        # TextBlob sentiment
        textblob_score = TextBlob(cleaned_text).sentiment.polarity
        
        # Define weights for ensemble
        weights = {
            'vader': 0.6,
            'textblob': 0.4
        }
        
        # Calculate weighted ensemble score
        ensemble_score = (
            weights['vader'] * vader_compound +
            weights['textblob'] * textblob_score
        )
        
        # Normalize to 0-100 scale
        normalized_score = int((ensemble_score + 1) * 50)
        
        # Get sentiment label
        sentiment_label = next(
            (label for range_obj, label in self.sentiment_labels.items() 
             if normalized_score in range_obj),
            "Neutral"
        )
        
        return {
            'score': normalized_score,
            'label': sentiment_label,
            'raw_scores': {
                'vader': vader_compound,
                'textblob': textblob_score
            }
        }

    def get_aspect_based_sentiment(self, text, aspects):
        """
        Perform aspect-based sentiment analysis on the given text.
        """
        doc = self.nlp(text)
        aspect_sentiments = {}
        
        for aspect in aspects:
            relevant_sentences = []
            for sent in doc.sents:
                # Check for aspect and its synonyms
                sent_lower = sent.text.lower()
                if aspect.lower() in sent_lower:
                    relevant_sentences.append(sent.text)
            
            if relevant_sentences:
                # Calculate sentiment for each relevant sentence
                sentiments = [self.get_combined_sentiment(sent)['score'] 
                            for sent in relevant_sentences]
                
                aspect_sentiments[aspect] = {
                    'score': np.mean(sentiments),
                    'count': len(relevant_sentences),
                    'sample_text': relevant_sentences[0] if relevant_sentences else None
                }
        
        return aspect_sentiments

    def analyze_emotions(self, text):
        """
        Analyze emotions in the given text using a pre-trained emotion classification model.
        """
        try:
            emotion_result = self.emotion_classifier(text)[0]
            return {
                'emotion': emotion_result['label'],
                'confidence': emotion_result['score']
            }
        except:
            return {'emotion': 'neutral', 'confidence': 1.0}

    def deduplicate_content(self, texts, threshold=0.8):
        """
        Remove near-duplicate content using TF-IDF and cosine similarity.
        """
        if not texts:  # Handle empty input
            return []
            
        vectorizer = TfidfVectorizer()
        try:
            tfidf_matrix = vectorizer.fit_transform(texts)
        except ValueError:  # Handle empty strings
            return list(range(len(texts)))
        
        unique_indices = []
        for i in range(len(texts)):
            is_unique = True
            for j in range(i):
                if j in unique_indices:
                    similarity = 1 - cosine(
                        tfidf_matrix[i].toarray().flatten(),
                        tfidf_matrix[j].toarray().flatten()
                    )
                    if similarity > threshold:
                        is_unique = False
                        break
            if is_unique:
                unique_indices.append(i)
        
        return unique_indices

    def fetch_news(self, query, days=7):
        """
        Fetch news articles from NewsAPI for the given query.
        """
        url = 'https://newsapi.org/v2/everything'
        date_from = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
        
        params = {
            'q': query,
            'from': date_from,
            'sortBy': 'relevancy',
            'apiKey': self.news_api_key,
            'language': 'en'
        }
        
        try:
            response = requests.get(url, params=params)
            articles = response.json().get('articles', [])
            return [{
                'source': 'news',
                'title': article['title'],
                'text': f"{article['title']} {article['description']}",
                'url': article['url'],
                'published_at': article['publishedAt']
            } for article in articles[:10]]
        except:
            return []

    def fetch_reddit_posts(self, query, limit=10):
        """
        Fetch Reddit posts for the given query.
        """
        posts = []
        subreddit = self.reddit.subreddit('all')
        
        for post in subreddit.search(query, sort='relevance', limit=limit):
            posts.append({
                'source': 'reddit',
                'title': post.title,
                'text': f"{post.title} {post.selftext}",
                'url': f"https://reddit.com{post.permalink}",
                'score': post.score
            })
            
        return posts
        
    def fetch_content(self, query, limit=50):
        """
        Fetch and aggregate content from multiple sources (NewsAPI and Reddit).
        """
        # Fetch news articles
        news_articles = self.fetch_news(query)
        
        # Fetch Reddit posts
        reddit_posts = self.fetch_reddit_posts(query, limit=limit)
        
        # Combine all content
        all_content = news_articles + reddit_posts
        
        # Deduplicate content
        unique_texts = [item['text'] for item in all_content]
        unique_indices = self.deduplicate_content(unique_texts)
        
        return [all_content[i] for i in unique_indices]

    def predict_trend(self, sentiments, window_size=7):
        """
        Predict sentiment trend using a rolling window approach.
        """
        if len(sentiments) < window_size:
            return {
                'trend': "Insufficient data",
                'confidence': 0.0
            }
        
        sentiment_series = pd.Series(sentiments)
        rolling_mean = sentiment_series.rolling(window=window_size).mean()
        
        current_trend = rolling_mean.iloc[-1] - rolling_mean.iloc[-2]
        confidence = min(abs(current_trend) * 10, 1.0)
        
        if current_trend > 0.05:
            trend = "Upward"
        elif current_trend < -0.05:
            trend = "Downward"
        else:
            trend = "Stable"
            
        return {
            'trend': trend,
            'confidence': confidence
        }

    def generate_summary(self, content_items):
        """
        Generate a summary of the content using Google Gemini.
        """
        if not content_items:  # Handle empty input
            return "No content available for summary generation."
            
        # Combine all text
        all_text = " ".join([item['text'] for item in content_items])
        
        # Truncate text if needed
        max_tokens = 512
        truncated_text = ' '.join(all_text.split()[:max_tokens])  # Rough character estimate
        
        try:
            # Generate summary using Google Gemini
            prompt = (
                "Please summarize the following content in 3-5 lines, focusing on the key points. "
                "Ensure the summary is concise and covers the main aspects of the text."
                f"\n\n{truncated_text}"
            )
            response = self.gemini_model.generate_content(prompt)
            initial_summary = response.text.strip()

            # Analyze emotions in the content
            emotions = [self.analyze_emotions(item['text']) for item in content_items]
            dominant_emotion = Counter(
                [e['emotion'] for e in emotions]
            ).most_common(1)[0][0]
            
            # Calculate overall sentiment
            sentiments = [self.get_combined_sentiment(item['text'])['score'] 
                        for item in content_items]
            avg_sentiment = np.mean(sentiments)
            
            sentiment_label = next(
                (label for range_obj, label in self.sentiment_labels.items() 
                 if int(avg_sentiment) in range_obj),
                "Neutral"
            )
            
            # Enhanced summary with insights
            enhanced_summary = (
                f"{initial_summary}\n\n"
                f"Overall Sentiment: {sentiment_label} ({avg_sentiment:.1f}/100)\n"
                f"Dominant Emotion: {dominant_emotion.title()}"
            )
            
            return enhanced_summary
            
        except Exception as e:
            return f"Error generating summary: {str(e)}"
        
    def analyze_query(self, query, aspects=None):
        """
        Analyze content for the given query and aspects.
        """
        if aspects is None:
            aspects = ["price", "quality", "features", "service"]
        
        # Fetch and analyze content
        content_items = self.fetch_content(query)
        
        # Analyze each piece of content
        analyzed_content = []
        for item in content_items:
            sentiment = self.get_combined_sentiment(item['text'])
            emotions = self.analyze_emotions(item['text'])
            aspect_sentiments = self.get_aspect_based_sentiment(item['text'], aspects)
            
            analyzed_content.append({
                'source': item['source'],
                'title': item.get('title', ''),
                'url': item.get('url', ''),
                'sentiment': sentiment,
                'emotions': emotions,
                'aspect_sentiments': aspect_sentiments
            })
        
        # Generate overall summary
        summary = self.generate_summary(content_items)
        
        # Calculate aggregated metrics
        sentiments = [item['sentiment']['score'] for item in analyzed_content]
        trend = self.predict_trend(sentiments)
        
        return {
            'summary': summary,
            'analyzed_content': analyzed_content,
            'trend': trend,
            'aspects': {
                aspect: {
                    'avg_score': np.mean([
                        content['aspect_sentiments'].get(aspect, {}).get('score', 0)
                        for content in analyzed_content
                        if aspect in content['aspect_sentiments']
                    ])
                }
                for aspect in aspects
            }
        }

class LocationBasedAnalyzer(EnhancedContentAnalyzer):
    def __init__(self, reddit_credentials, news_api_key, gemini_api_key):
        """
        Initialize the LocationBasedAnalyzer with geolocation capabilities.
        """
        super().__init__(reddit_credentials, news_api_key, gemini_api_key)
        self.geocoder = Nominatim(user_agent="AI-lluminati-location")
        
    def get_location_info(self, location: str) -> Dict:
        """
        Get standardized location information using geocoding.
        """
        try:
            # Geocode the location
            location_data = self.geocoder.geocode(location, language='en')
            if not location_data:
                return None
            
            # Extract country code and address components
            raw_address = location_data.raw.get('address', {})
            
            # Handle country-level queries differently
            if 'country' in raw_address:
                country_code = raw_address.get('country_code', '').upper()
                country_name = raw_address.get('country')
            else:
                # Try to get country code from the raw data
                country_code = location_data.raw.get('country_code', '').upper()
                country_name = location
    
            if country_code:
                country = pycountry.countries.get(alpha_2=country_code)
                if country:
                    country_name = country.name
    
            return {
                'input_location': location,
                'formatted_address': location_data.address,
                'country': country_name,
                'country_code': country_code,
                'coordinates': (location_data.latitude, location_data.longitude),
                'city': raw_address.get('city'),
                'state': raw_address.get('state')
            }
        except Exception as e:
            return {
                'input_location': location,
                'formatted_address': location,
                'country': location,
                'country_code': None,
                'coordinates': None,
                'city': None,
                'state': None
            }

    def get_location_subreddits(self, location_info: Dict) -> List[str]:
        """
        Get relevant subreddits for a location.
        """
        if not location_info:
            return []
            
        subreddits = []
        
        # Add country subreddit
        if location_info['country']:
            subreddits.append(location_info['country'].lower())
        
        # Add city subreddit if available
        if location_info['city']:
            subreddits.append(location_info['city'].lower())
            
        # Add state/region subreddit if available
        if location_info['state']:
            subreddits.append(location_info['state'].lower())
            
        # Add common location-specific subreddit patterns
        for location in [location_info['city'], location_info['state'], location_info['country']]:
            if location:
                subreddits.extend([
                    f"r/{location.lower()}",
                    f"{location.lower()}news",
                    f"{location.lower()}politics"
                ])
                
        return list(set(subreddits))

    def fetch_location_news(self, query: str, location_info: Dict, days: int = 7) -> List[Dict]:
        """
        Fetch news articles specific to a location.
        """
        if not location_info:
            return []
            
        url = 'https://newsapi.org/v2/everything'
        date_from = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
        
        # Create location-specific query
        location_terms = []
        if location_info['city']:
            location_terms.append(location_info['city'])
        if location_info['state']:
            location_terms.append(location_info['state'])
        if location_info['country']:
            location_terms.append(location_info['country'])
            
        if not location_terms:
            return []
            
        location_query = f"{query} AND ({' OR '.join(location_terms)})"
        
        params = {
            'q': location_query,
            'from': date_from,
            'sortBy': 'relevancy',
            'apiKey': self.news_api_key,
            'language': 'en'
        }
        
        try:
            response = requests.get(url, params=params)
            articles = response.json().get('articles', [])
            return [{
                'source': 'news',
                'title': article['title'],
                'text': f"{article['title']} {article['description']}",
                'url': article['url'],
                'published_at': article['publishedAt'],
                'location': location_info['formatted_address']
            } for article in articles[:15] if article.get('description')]
        except Exception as e:
            return []

    def fetch_location_reddit_content(self, query: str, location_info: Dict, limit: int = 15) -> List[Dict]:
        """
        Fetch Reddit content specific to a location.
        """
        if not location_info:
            return []
            
        location_subreddits = self.get_location_subreddits(location_info)
        posts = []
        
        for subreddit_name in location_subreddits:
            try:
                subreddit = self.reddit.subreddit(subreddit_name)
                for post in subreddit.search(query, sort='relevance', limit=limit):
                    posts.append({
                        'source': 'reddit',
                        'subreddit': subreddit_name,
                        'title': post.title,
                        'text': f"{post.title} {post.selftext}",
                        'url': f"https://reddit.com{post.permalink}",
                        'score': post.score,
                        'location': location_info['formatted_address']
                    })
            except Exception as e:
                continue
                
        return posts

    def analyze_location_insights(self, query: str, location: str, aspects: Optional[List[str]] = None) -> Dict:
        """
        Analyze content for a specific location.
        """
        if aspects is None:
            aspects = ["impact", "local_response", "public_opinion", "concerns"]
            
        # Get location information
        location_info = self.get_location_info(location)
        if not location_info:
            return {"error": f"Could not find location information for {location}"}
            
        # Fetch location-specific content
        news_articles = self.fetch_location_news(query, location_info)
        reddit_posts = self.fetch_location_reddit_content(query, location_info)
        
        # Combine and deduplicate content
        all_content = news_articles + reddit_posts
        if not all_content:
            return {
                "error": f"No content found for {query} in {location}",
                "location_info": location_info
            }
            
        unique_texts = [item['text'] for item in all_content]
        unique_indices = self.deduplicate_content(unique_texts)
        content_items = [all_content[i] for i in unique_indices]
        
        with ThreadPoolExecutor(max_workers=2) as executor:
            futures = {}
            analyzed_content = []
            for item in content_items:
                futures[executor.submit(self.get_combined_sentiment, item['text'])] = ('sentiment', item)
                futures[executor.submit(self.analyze_emotions, item['text'])] = ('emotions', item)
                futures[executor.submit(self.get_aspect_based_sentiment, item['text'], aspects)] = ('aspect_sentiments', item)

            for future in futures:
                analysis_type, item = futures[future]
                item[analysis_type] = future.result()

                if analysis_type == 'aspect_sentiments':
                    analyzed_content.append({
                        'source': item['source'],
                        'title': item.get('title', ''),
                        'url': item.get('url', ''),
                        'location': item.get('location', ''),
                        'sentiment': item.get('sentiment', {}),
                        'emotions': item.get('emotions', {}),
                        'aspect_sentiments': item.get('aspect_sentiments', {})
                    })
            
        # Generate location-specific summary
        location_context = (
            f"The following summary is based on content from {location_info['formatted_address']}. "
            f"Consider the local context and perspectives when interpreting the information."
        )
        summary = self.generate_summary(content_items)
        enhanced_summary = f"{location_context}\n\n{summary}"
        
        # Calculate aspect averages
        aspect_averages = {}
        for aspect in aspects:
            scores = []
            for content in analyzed_content:
                if aspect in content['aspect_sentiments']:
                    aspect_score = content['aspect_sentiments'][aspect].get('score', 0)
                    if aspect_score > 0:
                        scores.append(aspect_score)
            
            if scores:
                aspect_averages[aspect] = {
                    'avg_score': np.mean(scores),
                    'count': len(scores)
                }
            else:
                aspect_averages[aspect] = {
                    'avg_score': 0,
                    'count': 0
                }
        
        return {
            'location_info': location_info,
            'summary': enhanced_summary,
            'analyzed_content': analyzed_content,
            'aspects': aspect_averages,
            'sources': {
                'news_count': len(news_articles),
                'reddit_count': len(reddit_posts)
            }
        }
    
def replace_nan_with_null(data):
    if isinstance(data, dict):
        return {k: replace_nan_with_null(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [replace_nan_with_null(v) for v in data]
    elif isinstance(data, float) and math.isnan(data):
        return None
    return data

def main(query, location=None):
    """
    Main function to analyze content for a given query and location.
    """
    # Initialize with credentials
    load_dotenv(find_dotenv())

    reddit_credentials = {
        'client_id': os.getenv('REDDIT_CLIENT_ID'),
        'client_secret': os.getenv('REDDIT_CLIENT_SECRET'), 
        'user_agent': os.getenv('REDDIT_USER_AGENT')
    }
    news_api_key = os.getenv('NEWS_API_KEY')
    gemini_api_key = os.getenv('GEMINI_API_KEY')

    results = None

    # Suppress all output except JSON
    with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
        try:
            if location:
                analyzer = LocationBasedAnalyzer(reddit_credentials, news_api_key, gemini_api_key)
                results = analyzer.analyze_location_insights(query, location)
            else:
                analyzer = EnhancedContentAnalyzer(reddit_credentials, news_api_key, gemini_api_key)
                aspects = ["price", "features", "reliability", "support"]
                results = analyzer.analyze_query(query, aspects)

        except Exception as e:
            results = {"error": str(e)}

    results = replace_nan_with_null(results)
    
    # Print only the JSON output
    print(json.dumps(results, indent=4))

if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else "Test"
    location = sys.argv[2] if len(sys.argv) > 2 else None
    main(query, location)