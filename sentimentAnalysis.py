import pandas as pd
import numpy as np
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
import praw
import requests
from transformers import pipeline
from datetime import datetime, timedelta

# from kaggle_secrets import UserSecretsClient
# import os
# secrets = UserSecretsClient()



class ContentAnalyzer:
    def __init__(self, reddit_credentials, news_api_key):
        self.vader = SentimentIntensityAnalyzer()
        self.reddit = praw.Reddit(**reddit_credentials)
        self.news_api_key = news_api_key
        # Initialize free summarizer from Hugging Face
        self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
        
    def get_sentiment(self, text):
        """Get combined sentiment from VADER and TextBlob"""
        if not isinstance(text, str) or not text.strip():
            return 50  # Neutral score for empty/invalid text
            
        vader_scores = self.vader.polarity_scores(text)
        textblob_score = TextBlob(text).sentiment.polarity
        
        # Combine scores (weighted average)
        combined_score = (vader_scores['compound'] * 0.6) + (textblob_score * 0.4)
        # Convert to 0-100 scale
        normalized_score = int((combined_score + 1) * 50)
        return normalized_score

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

    def summarize_content(self, texts):
        """Summarize multiple pieces of content"""
        combined_text = " ".join(texts)
        try:
            summary = self.summarizer(combined_text, max_length=130, min_length=30, do_sample=False)[0]['summary_text']
            return summary
        except:
            return "Unable to generate summary due to content length or processing error."

    def analyze_query(self, query):
        # Fetch content
        news_articles = self.fetch_news(query)
        reddit_posts = self.fetch_reddit_posts(query)
        
        # Analyze news sentiments
        news_sentiments = []
        news_texts = []
        for article in news_articles:
            sentiment = self.get_sentiment(article['text'])
            article['sentiment'] = sentiment
            news_sentiments.append(sentiment)
            news_texts.append(article['text'])
        
        # Analyze Reddit sentiments
        reddit_sentiments = []
        reddit_texts = []
        for post in reddit_posts:
            sentiment = self.get_sentiment(post['text'])
            post['sentiment'] = sentiment
            reddit_sentiments.append(sentiment)
            reddit_texts.append(post['text'])
        
        # Calculate average sentiments
        avg_news_sentiment = int(np.mean(news_sentiments)) if news_sentiments else 50
        avg_reddit_sentiment = int(np.mean(reddit_sentiments)) if reddit_sentiments else 50
        overall_sentiment = int(np.mean([avg_news_sentiment, avg_reddit_sentiment]))
        
        # Get top influential content (highest deviation from neutral sentiment)
        all_content = news_articles + reddit_posts
        influential_content = sorted(
            all_content,
            key=lambda x: abs(x['sentiment'] - 50),
            reverse=True
        )[:5]
        
        # Generate summaries
        news_summary = self.summarize_content(news_texts) if news_texts else "No news content available."
        reddit_summary = self.summarize_content(reddit_texts) if reddit_texts else "No Reddit content available."
        
        return {
            'sentiments': {
                'news': avg_news_sentiment,
                'reddit': avg_reddit_sentiment,
                'overall': overall_sentiment
            },
            'influential_content': influential_content,
            'summaries': {
                'news': news_summary,
                'reddit': reddit_summary
            }
        }
def main(query):
    # Initialize with your credentials
    reddit_credentials = {
        'client_id': 'dh-pJ2g7bmp5H55tgsth3w',
        'client_secret': 'L2tiTgDrdwwb9DWtrX19CdbZqYAGsg',
        'user_agent': 'AI-lluminati'
    }
    news_api_key = 'bc6a8428bd6143798ea88348297f44ec'
    
    analyzer = ContentAnalyzer(reddit_credentials, news_api_key)
    
    # Analyze content for a query
    results = analyzer.analyze_query(query)
    
    # Print results
    print("\nSentiment Analysis:")
    print(f"News Sentiment: {results['sentiments']['news']}/100")
    print(f"Reddit Sentiment: {results['sentiments']['reddit']}/100")
    print(f"Overall Sentiment: {results['sentiments']['overall']}/100")
    
    print("\nMost Influential Content:")
    for content in results['influential_content']:
        print(f"\nSource: {content['source']}")
        print(f"Title: {content['title']}")
        print(f"Sentiment: {content['sentiment']}/100")
        print(f"URL: {content['url']}")
    
    print("\nContent Summaries:")
    print("\nNews Summary:")
    print(results['summaries']['news'])
    print("\nReddit Summary:")
    print(results['summaries']['reddit'])      

if __name__ == "__main__":
    query = "Bitcoin"
    main(query)