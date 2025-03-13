import re
import spacy
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import google.generativeai as genai
from google_play_scraper import reviews
import json
import sys
from dotenv import load_dotenv, find_dotenv
import os
from typing import List, Dict
from concurrent.futures import ThreadPoolExecutor

class GooglePlaySentimentAnalyzer:
    """
    A class to analyze sentiment and generate summaries for Google Play Store reviews.
    """

    def __init__(self, gemini_api_key: str):
        """
        Initialize the sentiment analyzer with necessary tools and models.

        Args:
            gemini_api_key (str): API key for Google Gemini.
        """
        self.vader = SentimentIntensityAnalyzer()
        self.nlp = spacy.load('en_core_web_sm')
        genai.configure(api_key=gemini_api_key)
        self.gemini_model = genai.GenerativeModel("gemini-1.5-flash")

    def clean_text(self, text: str) -> str:
        """
        Clean and preprocess the input text by removing URLs, mentions, hashtags, and stopwords.

        Args:
            text (str): The input text to clean.

        Returns:
            str: The cleaned text.
        """
        if not isinstance(text, str):
            return ""

        # Remove URLs, mentions, hashtags, and special characters
        text = re.sub(r'http\S+|\@\w+|\#\w+|[^\w\s]', '', text)
        return ' '.join([word.lower() for word in text.split() if len(word) > 2])

    def get_combined_sentiment(self, text: str) -> Dict:
        """
        Calculate combined sentiment score using VADER and TextBlob with weighted averaging.

        Args:
            text (str): The input text to analyze.

        Returns:
            Dict: A dictionary containing the normalized sentiment score, label, and raw scores.
        """
        cleaned_text = self.clean_text(text)

        # VADER sentiment analysis
        vader_scores = self.vader.polarity_scores(cleaned_text)
        vader_compound = vader_scores['compound']

        # TextBlob sentiment analysis
        textblob_score = TextBlob(cleaned_text).sentiment.polarity

        # Weighted ensemble score (60% VADER, 40% TextBlob)
        ensemble_score = 0.6 * vader_compound + 0.4 * textblob_score

        # Normalize score to a 0-100 scale
        normalized_score = int((ensemble_score + 1) * 50)

        # Determine sentiment label
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

    def generate_summary(self, reviews_data: List[Dict]) -> str:
        """
        Generate a summary of the reviews using Google Gemini.

        Args:
            reviews_data (List[Dict]): A list of reviews with their content.

        Returns:
            str: A concise summary of the reviews.
        """
        # Combine all reviews into a single text
        all_text = " ".join([review['content'] for review in reviews_data])
        max_tokens = 3000
        truncated_text = all_text[:max_tokens]

        try:
            # Generate summary using Google Gemini
            prompt = (
                "Summarize the following reviews in 3-5 lines, focusing only on key points. "
                "Do not generate content outside the context of the reviews. "
                "If the input is not relevant or if the summary is too short, respond with 'Error: Irrelevant content'."
                f"\n\n{truncated_text}"
            )
            response = self.gemini_model.generate_content(prompt)
            summary = response.text.strip()

            # Validate summary length and relevance
            if not summary or len(summary.split()) < 5:
                return "Error: Summary is too short or irrelevant."

            # Validate relevance by comparing keywords in input and output
            input_keywords = set(truncated_text.lower().split())
            output_keywords = set(summary.lower().split())
            common_keywords = input_keywords & output_keywords

            if len(common_keywords) < 5:
                return "Error: Summary appears irrelevant to input text."

            return summary

        except Exception as e:
            return f"Error generating summary: {str(e)}"


def fetch_reviews_as_dict(app_id: str, num_reviews: int = 50) -> List[Dict]:
    """
    Fetch reviews from Google Play Store for a given app ID.

    Args:
        app_id (str): The Google Play Store app ID.
        num_reviews (int): The number of reviews to fetch.

    Returns:
        List[Dict]: A list of reviews with their content.
    """
    result, _ = reviews(app_id, count=num_reviews)
    return [{'content': r['content']} for r in result if r['content'] and len(r['content']) > 10]

def analyze_google_play_reviews(app_id: str, gemini_api_key: str, num_reviews: int = 50) -> Dict:
    """
    Analyze sentiment and generate a summary for Google Play Store reviews.

    Args:
        app_id (str): The Google Play Store app ID.
        gemini_api_key (str): API key for Google Gemini.
        num_reviews (int): The number of reviews to analyze.

    Returns:
        Dict: A dictionary containing the average sentiment, sentiment label, summary, and reviews.
    """
    # Fetch reviews
    reviews_data = fetch_reviews_as_dict(app_id, num_reviews)
    if not reviews_data:
        return {"error": "No reviews fetched."}

    # Initialize sentiment analyzer
    analyzer = GooglePlaySentimentAnalyzer(gemini_api_key)

    # Parallel sentiment analysis using ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(analyzer.get_combined_sentiment, review['content']): review for review in reviews_data}

        # Retrieve results
        for future in futures:
            review = futures[future]
            review['sentiment'] = future.result()

    # Generate a summary of all reviews
    summary = analyzer.generate_summary(reviews_data)

    # Calculate average sentiment
    sentiment_scores = [review['sentiment']['score'] for review in reviews_data]
    avg_sentiment = sum(sentiment_scores) / len(sentiment_scores)

    # Determine overall sentiment label
    sentiment_label = "Neutral"
    if avg_sentiment < 35:
        sentiment_label = "Negative"
    elif avg_sentiment > 65:
        sentiment_label = "Positive"

    # Return results
    return {
        'average_sentiment': avg_sentiment,
        'sentiment_label': sentiment_label,
        'review_summary': summary,
        'reviews': reviews_data
    }


def main(query: str):
    """
    Main function to analyze Google Play Store reviews.

    Args:
        query (str): The Google Play Store app ID.
    """
    load_dotenv(find_dotenv())
    gemini_api_key = os.getenv('GEMINI_API_KEY')

    if not gemini_api_key:
        print(json.dumps({"error": "GEMINI_API_KEY not found in environment variables."}))
        return
    
    # Analyze reviews and print results
    result = analyze_google_play_reviews(query, gemini_api_key)
    print(json.dumps(result, indent=4))


if __name__ == "__main__":
    # Get app ID from command-line arguments or use a default
    query = sys.argv[1] if len(sys.argv) > 1 else "com.facebook.katana"
    main(query)