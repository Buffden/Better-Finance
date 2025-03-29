# AI-Powered Finance Manager

An intelligent finance management application that helps you track expenses, analyze spending patterns, and get AI-powered financial advice.

## Features

- 📊 Expense categorization using Gemini AI
- 📈 Interactive visualizations with charts and tooltips
- 💡 AI-powered financial advice and insights
- 💰 Budget tracking with category-wise comparisons
- 📱 Modern, responsive UI built with Streamlit

## Setup

1. Clone this repository
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the root directory and add your Google API key:
   ```
   GOOGLE_API_KEY=your_api_key_here
   ```
   You can get a Google API key from the [Google Cloud Console](https://console.cloud.google.com/)

## Running the Application

1. Start the Streamlit app:
   ```bash
   streamlit run main.py
   ```
2. Open your browser and navigate to the URL shown in the terminal (typically http://localhost:8501)

## Usage

1. **Upload Data**: Use the sample data or upload your own CSV file with columns: date, amount, description
2. **Expense Analysis**: View interactive charts showing your spending patterns
3. **Budget Tracker**: Set budgets for different categories and track your spending
4. **AI Insights**: Get personalized financial advice based on your spending habits

## Sample Data Format

Your CSV file should have the following columns:
- date: Date of the transaction (YYYY-MM-DD)
- amount: Transaction amount
- description: Transaction description

Example:
```csv
date,amount,description
2024-03-01,50.00,Groceries at Walmart
2024-03-02,1200.00,Monthly Rent
```

## Technologies Used

- Streamlit
- Google Gemini AI
- Pandas
- Plotly
- Python-dotenv 