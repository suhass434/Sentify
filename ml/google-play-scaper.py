import pandas as pd
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
from transformers import pipeline
import spacy
import re
from datetime import datetime
from collections import Counter

from google_play_scraper import reviews, Sort 

# Fetching reviews using Google Play Scraper
def fetch_reviews_as_dict(app_id, num_reviews=100):
    all_reviews = []
    try:
        for offset in range(0, num_reviews, 150):
            result, _ = reviews(
                app_id,
                lang='en',
                country='us',
                sort=Sort.NEWEST,
                count=min(150, num_reviews - offset)
            )
            all_reviews.extend(result)
        
        review_dicts = [
            {
                "userName": r["userName"],
                "content": r["content"],
                "score": r["score"],
                "date": r["at"].strftime('%Y-%m-%d %H:%M:%S')
            }
            for r in all_reviews
        ]
        return review_dicts
    except Exception as e:
        print(f"Error fetching reviews: {e}")
        return []

# Sentiment analysis helper functions
class GooglePlaySentimentAnalyzer:
    def __init__(self):
        self.vader = SentimentIntensityAnalyzer()
        self.nlp = spacy.load('en_core_web_sm')
        self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    
    def clean_text(self, text):
        if not isinstance(text, str):
            return ""
        text = re.sub(r'http\S+', '', text)
        text = re.sub(r'@\w+', '', text)
        text = re.sub(r'#\w+', '', text)
        text = re.sub(r'[^\w\s]', ' ', text)
        
        doc = self.nlp(text)
        important_tokens = [token.text.lower() for token in doc if not token.is_stop]
        return ' '.join(important_tokens)

    def get_combined_sentiment(self, text):
        cleaned_text = self.clean_text(text)
        vader_scores = self.vader.polarity_scores(cleaned_text)
        vader_compound = vader_scores['compound']
        textblob_score = TextBlob(cleaned_text).sentiment.polarity

        ensemble_score = 0.6 * vader_compound + 0.4 * textblob_score
        normalized_score = int((ensemble_score + 1) * 50)
        
        sentiment_label = "Neutral"
        if normalized_score < 35:
            sentiment_label = "Negative"
        elif normalized_score > 65:
            sentiment_label = "Positive"
        
        return {
            'score': normalized_score,
            'label': sentiment_label,
            'raw_scores': {'vader': vader_compound, 'textblob': textblob_score}
        }

    def generate_summary(self, reviews_data):
        all_text = " ".join([review['content'] for review in reviews_data])
        max_tokens = 512
        truncated_text = all_text[:max_tokens]

        try:
            initial_summary = self.summarizer(
                truncated_text,
                max_length=200,
                min_length=50,
                do_sample=False
            )[0]['summary_text']
            return initial_summary
        except Exception as e:
            return f"Error generating summary: {str(e)}"

# Main Analysis function
def analyze_google_play_reviews(app_id, num_reviews=100):
    # Fetch reviews
    reviews_data = fetch_reviews_as_dict(app_id, num_reviews)
    
    if not reviews_data:
        return "No reviews fetched."

    # Initialize Sentiment Analyzer
    analyzer = GooglePlaySentimentAnalyzer()
    
    # Analyze sentiment for each review
    for review in reviews_data:
        sentiment = analyzer.get_combined_sentiment(review['content'])
        review['sentiment'] = sentiment
    
    # Generate a summary of all reviews
    summary = analyzer.generate_summary(reviews_data)
    
    # Aggregate sentiment analysis results
    sentiment_scores = [review['sentiment']['score'] for review in reviews_data]
    avg_sentiment = sum(sentiment_scores) / len(sentiment_scores)
    
    sentiment_label = "Neutral"
    if avg_sentiment < 35:
        sentiment_label = "Negative"
    elif avg_sentiment > 65:
        sentiment_label = "Positive"
    
    # Return results
    result = {
        'average_sentiment': avg_sentiment,
        'sentiment_label': sentiment_label,
        'review_summary': summary,
        'reviews': reviews_data
    }
    
    return result

if __name__ == "__main__":
    # Example usage:
    app_id = 'com.facebook.katana' 
    result = analyze_google_play_reviews(app_id)
    
    # Print summarized result
    print("Summary:", result['review_summary'])
    print("Average Sentiment:", result['average_sentiment'])
    print("Sentiment Label:", result['sentiment_label'])