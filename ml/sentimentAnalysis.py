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

from kaggle_secrets import UserSecretsClient
import os
secrets = UserSecretsClient()

class EnhancedContentAnalyzer:
    def __init__(self, reddit_credentials, news_api_key, gemini_api_key):
        self.vader = SentimentIntensityAnalyzer()
        self.reddit = praw.Reddit(**reddit_credentials)
        self.news_api_key = news_api_key
        self.nlp = spacy.load('en_core_web_sm')
        
        # Initialize models
        self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
        self.emotion_classifier = pipeline("text-classification", 
                                        model="j-hartmann/emotion-english-distilroberta-base")
        
        # Sentiment thresholds
        self.sentiment_labels = {
            range(0, 35): "Negative",
            range(35, 65): "Neutral",
            range(65, 101): "Positive"
        }
        genai.configure(api_key = gemini_api_key)
        self.gemini_model = genai.GenerativeModel("gemini-1.5-flash")

    def clean_text(self, text):
        """Enhanced text cleaning with entity and key term retention"""
        if not isinstance(text, str):
            return ""
        
        # Basic cleaning
        text = re.sub(r'http\S+', '', text)
        text = re.sub(r'@\w+', '', text)
        text = re.sub(r'#\w+', '', text)
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # SpaCy processing
        doc = self.nlp(text)
        
        # Keep named entities, important parts of speech, and descriptive terms
        important_tokens = []
        for token in doc:
            if (token.ent_type_ or  # Named entities
                token.pos_ in ['ADJ', 'VERB', 'NOUN', 'ADV'] or  # Important POS
                not token.is_stop):  # Non-stop words
                important_tokens.append(token.text.lower())
        
        return ' '.join(important_tokens)

    def get_combined_sentiment(self, text):
        """Enhanced sentiment analysis with normalized scoring and labeling"""
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
        """Enhanced aspect-based sentiment analysis"""
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
        """Enhanced emotion detection"""
        try:
            emotion_result = self.emotion_classifier(text)[0]
            return {
                'emotion': emotion_result['label'],
                'confidence': emotion_result['score']
            }
        except:
            return {'emotion': 'neutral', 'confidence': 1.0}

    def deduplicate_content(self, texts, threshold=0.8):
        """Remove near-duplicate content using TF-IDF and cosine similarity"""
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(texts)
        
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
            """Fetch news articles from NewsAPI"""
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
                } for article in articles[:10]]  # Top 10 most relevant articles
            except:
                return []

    def fetch_reddit_posts(self, query, limit=10):
        """Fetch Reddit posts"""
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
        """Fetch and aggregate content from multiple sources"""
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
        """Enhanced trend prediction with confidence scoring"""
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
        """Generate comprehensive summary using all content"""
        # Combine all text
        all_text = " ".join([item['text'] for item in content_items])
        
        # Truncate the text if it exceeds the maximum token limit for the model
        max_tokens = 512
        truncated_text = all_text[:max_tokens]
        text_was_truncated = len(all_text) > max_tokens
        
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
            if avg_sentiment < 35:
                sentiment_label = "Negative"
            elif avg_sentiment < 65:
                sentiment_label = "Neutral"
            else:
                sentiment_label = "Positive"   
                
            # Get trend
            trend_info = self.predict_trend(sentiments)
    
            # Enhance summary with additional insights
            enhanced_summary = (
                f"{initial_summary}\n\n"
                f"Overall Sentiment: {sentiment_label} "
                f"({avg_sentiment:.1f}/100)\n"
                f"Dominant Emotion: {dominant_emotion.title()}\n"
                f"Trend: {trend_info['trend']} (Confidence: {trend_info['confidence']:.2f})"
            )
            
            # # Append "...." if text was truncated
            # if text_was_truncated:
            #     enhanced_summary += " ...."
            
            return enhanced_summary
        
        except Exception as e:
            return f"Error generating summary: {str(e)}"

    def analyze_query(self, query, aspects=None):
        """Main analysis method"""
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

def main(query):
    # Initialize with credentials
    reddit_credentials = {
        'client_id': secrets.get_secret("REDDIT_CLIENT_ID"),
        'client_secret': secrets.get_secret("REDDIT_CLIENT_SECRET"),
        'user_agent': secrets.get_secret("REDDIT_USER_AGENT")
    }
    news_api_key = secrets.get_secret("NEWS_API_KEY")
    gemini_api_key = secrets.get_secret("GEMINI_API_KEY")
    analyzer = EnhancedContentAnalyzer(reddit_credentials, news_api_key, gemini_api_key)
    
    # Example analysis
    aspects = ["price", "features", "reliability", "support"]
    
    results = analyzer.analyze_query(query, aspects)
    
    # Print results
    print("\nSummary:")
    print(results['summary'])
    
    print("\nAspect Sentiments:")
    for aspect, data in results['aspects'].items():
        print(f"{aspect}: {data['avg_score']:.1f}/100")
    
    print("\nTop Content by Sentiment Impact:")
    sorted_content = sorted(
        results['analyzed_content'],
        key=lambda x: abs(x['sentiment']['score'] - 50),
        reverse=True
    )[:5]
    
    for content in sorted_content:
        print(f"\nSource: {content['source']}")
        print(f"Title: {content['title']}")
        print(f"Sentiment: {content['sentiment']['label']} ({content['sentiment']['score']}/100)")
        print(f"Dominant Emotion: {content['emotions']['emotion']}")
        print(f"URL: {content['url']}")

if __name__ == "__main__":
    query = "Bitcoin"
    main(query)