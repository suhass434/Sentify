# wHACKiest '24 - CodeSapiens

# Sentify - Sentiment Analysis for Smarter Decisions

## Overview
Sentify is a sentiment analysis tool that aids in smarter decision-making by summarizing and evaluating reviews, news, and social media posts related to products, apps, or companies. It offers sentiment scores, emotional insights, and impactful content summaries to enhance understanding and efficiency in evaluating products or services.

## Problem Statement
With the vast amount of online content and reviews, extracting meaningful insights for decision-making can be challenging. Sentify addresses this by providing concise and reliable summaries of opinions spread across various platforms.

## Objectives
- Provide sentiment analysis, emotion classification, and impactful content summaries.
- Offer location-based insights for tailored analysis.
- Ensure a user-friendly interface for efficient data interaction.

## Key Features
- **Sentiment and Emotion Analysis**: Utilizes VADER, TextBlob, and DistilRoBERTa-base for sophisticated sentiment and emotion analysis.
- **Content Summarization**: Incorporates Gemini API and Scapy to summarize relevant content effectively.
- **Location-Based Insights**: Enables region-specific sentiment analysis to provide insights tailored to specific areas.
- **Integration**: Google Play integration for in-depth app review analysis.

## Tech Stack
- **Frontend**: ReactJS
- **Backend**: FastAPI
- **Database**: MongoDB
- **NLP & Text Analysis**: VADER, TextBlob, Gemini API, Scapy, DistilRoBERTa-base, Facebook BART
- **Scraping & Data Fetching**: Google Play Scraper

## Installation
```bash
git clone https://github.com/suhass434/wHACKiest
cd wHACKiest
# Follow setup instructions for React and FastAPI as detailed in the docs
npm start
```
### Backend
```bash
python3 -m venv env
source env/bin/activate
uvicorn app:app --host 0.0.0.0 --port 5001
node app.js
uvicorn app1:app  --host 0.0.0.0 --port 5002
uvicorn app2:app  --host 0.0.0.0 --port 5003

