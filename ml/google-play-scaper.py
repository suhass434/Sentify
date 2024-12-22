import google.generativeai as genai

class GooglePlaySentimentAnalyzer:
    def __init__(self):
        self.vader = SentimentIntensityAnalyzer()
        self.nlp = spacy.load('en_core_web_sm')
        genai.configure(api_key="AIzaSyDVU6y2yc2di3n88zrNSt0USNErvnJ1STE")
        self.gemini_model = genai.GenerativeModel("gemini-1.5-flash")
    
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
        # Combine all reviews content
        all_text = " ".join([review['content'] for review in reviews_data])
        max_tokens = 3000
        truncated_text = all_text[:max_tokens]
    
        try:
            # Generate content using Google Gemini API with a clear prompt for summary
            prompt = (
                "Summarize the following reviews in 3-5 lines, focusing only on key points. "
                "Do not generate content outside the context of the reviews. "
                "If the input is not relevant or if the summary is too short, respond with 'Error: Irrelevant content'."
                f"\n\n{truncated_text}"
            )
            response = self.gemini_model.generate_content(prompt)
            summary = response.text.strip()
    
            # Shield query to validate summary length and relevance
            if not summary or len(summary.split()) < 5:
                return "Error: Summary is too short or irrelevant."
    
            # Validate relevance by comparing keywords in input and output
            input_keywords = set(truncated_text.lower().split())
            output_keywords = set(summary.lower().split())
            common_keywords = input_keywords & output_keywords
    
            if len(common_keywords) < 5:  # Threshold for relevance
                return "Error: Summary appears irrelevant to input text."
            
            return summary
    
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