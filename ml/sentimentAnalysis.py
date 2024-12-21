import pandas as pd
import numpy as np
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
import praw
import requests
from transformers import pipeline
from datetime import datetime, timedelta
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

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

        # Categorize sentiment into Positive, Neutral, Negative
        if normalized_score >= 75:
            sentiment_label = 'Positive'
        elif normalized_score >= 50:
            sentiment_label = 'Neutral'
        else:
            sentiment_label = 'Negative'
        
        return normalized_score, sentiment_label

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

    def deduplicate_content(self, all_content):
        """Remove duplicate content using TF-IDF and Cosine Similarity"""
        if len(all_content) < 2:
            return all_content  # No need to deduplicate if there's only one item
        
        # Extract texts from content
        texts = [content['text'] for content in all_content]
        
        # Vectorize the text using TF-IDF
        tfidf_vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = tfidf_vectorizer.fit_transform(texts)
        
        # Calculate cosine similarity
        cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
        
        # Deduplicate content by keeping unique content based on similarity threshold
        unique_content = []
        seen_indexes = set()
        similarity_threshold = 0.8  # Content considered duplicate if similarity > 0.8
        
        for i, content in enumerate(all_content):
            if i not in seen_indexes:
                unique_content.append(content)
                # Mark duplicates
                for j in range(i + 1, len(all_content)):
                    if cosine_sim[i, j] > similarity_threshold:
                        seen_indexes.add(j)
        
        return unique_content

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
        
        # Combine content from news and reddit
        all_content = news_articles + reddit_posts
        
        # Deduplicate content
        unique_content = self.deduplicate_content(all_content)
        
        # Analyze sentiments for unique content
        sentiments = []
        content_texts = []
        for content in unique_content:
            sentiment_score, sentiment_label = self.get_sentiment(content['text'])
            content['sentiment'] = sentiment_score
            content['sentiment_label'] = sentiment_label
            sentiments.append(sentiment_score)
            content_texts.append(content['text'])
        
        # Calculate average sentiment
        avg_sentiment = int(np.mean(sentiments)) if sentiments else 50
        
        # Get top influential content (highest deviation from neutral sentiment)
        influential_content = sorted(
            unique_content,
            key=lambda x: abs(x['sentiment'] - 50),
            reverse=True
        )[:5]
        
        # Generate summaries
        content_summary = self.summarize_content(content_texts) if content_texts else "No content available."
        
        return {
            'sentiment': avg_sentiment,
            'influential_content': influential_content,
            'summary': content_summary
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
    print(f"Overall Sentiment: {results['sentiment']}/100")
    
    print("\nMost Influential Content:")
    for content in results['influential_content']:
        print(f"\nSource: {content['source']}")
        print(f"Title: {content['title']}")
        print(f"Sentiment: {content['sentiment']} - {content['sentiment_label']}")
        print(f"URL: {content['url']}")
    
    print("\nContent Summary:")
    print(results['summary'])

if __name__ == "__main__":
    query = "Bitcoin"
    main(query)