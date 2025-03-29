import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime
import google.generativeai as genai
from dotenv import load_dotenv
import os
import re
import json
from PyPDF2 import PdfReader
import io

# Load environment variables
load_dotenv()

# Configure Gemini AI
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# Set page config
st.set_page_config(
    page_title="AI Finance Manager",
    page_icon="💰",
    layout="wide"
)

# Initialize session state
if 'expenses' not in st.session_state:
    st.session_state.expenses = None
if 'budgets' not in st.session_state:
    st.session_state.budgets = {
        'Food': 500,
        'Rent': 1500,
        'Transportation': 200,
        'Entertainment': 300,
        'Utilities': 200,
        'Shopping': 200
    }
if 'statement_type' not in st.session_state:
    st.session_state.statement_type = None

def extract_text_from_pdf(file_content):
    """Extract text from PDF file"""
    try:
        # Create a PDF reader object
        pdf_reader = PdfReader(io.BytesIO(file_content))
        
        # Extract text from all pages
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        return text
    except Exception as e:
        st.error(f"Error reading PDF: {str(e)}")
        return None

def parse_with_gemini(file_content, file_type):
    """Parse bank statement using Gemini AI"""
    try:
        # Handle different file types
        if file_type.lower() == 'pdf':
            content = extract_text_from_pdf(file_content.getvalue())
            if content is None:
                return None
        else:
            content = file_content.getvalue().decode('utf-8')
        
        # Create a prompt for Gemini
        prompt = f"""Please analyze this bank statement and extract all transactions. 
        For each transaction, identify:
        1. Date (in YYYY-MM-DD format)
        2. Amount (as a number)
        3. Description (the transaction description)
        
        Format your response ONLY as a JSON array of objects with these exact fields:
        [
            {{"date": "YYYY-MM-DD", "amount": number, "description": "string"}},
            ...
        ]
        
        Bank Statement Content:
        {content}
        
        Return ONLY the JSON array, no other text."""
        
        # Get response from Gemini
        response = model.generate_content(prompt)
        
        try:
            # Extract JSON from response
            json_str = response.text.strip()
            # Remove any markdown formatting if present
            json_str = json_str.replace('```json', '').replace('```', '').strip()
            
            # Parse the JSON response
            transactions = json.loads(json_str)
            
            # Convert to DataFrame
            df = pd.DataFrame(transactions)
            
            # Convert date strings to datetime
            df['date'] = pd.to_datetime(df['date'])
            
            # Ensure amount is numeric
            df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
            
            # Remove any rows with missing values
            df = df.dropna()
            
            if len(df) == 0:
                st.error("No valid transactions found in the statement.")
                return None
                
            return df
            
        except json.JSONDecodeError as e:
            st.error(f"Failed to parse Gemini's response: {str(e)}")
            st.error("Please try again or use a different format.")
            return None
            
    except Exception as e:
        st.error(f"Error parsing statement with Gemini: {str(e)}")
        return None

def parse_bank_statement(file_content, statement_type):
    """Parse bank statement based on the type"""
    try:
        if statement_type == "Gemini AI":
            file_type = file_content.name.split('.')[-1]
            return parse_with_gemini(file_content, file_type)
            
        elif statement_type == "CSV":
            df = pd.read_csv(file_content)
            # Ensure required columns exist
            required_cols = ['date', 'amount', 'description']
            if not all(col.lower() in [c.lower() for c in df.columns] for col in required_cols):
                st.error("CSV must contain columns: date, amount, description")
                return None
            # Rename columns to match expected format
            df.columns = [c.lower() for c in df.columns]
            df['date'] = pd.to_datetime(df['date'])
            return df
        
        elif statement_type == "Text":
            # Parse text-based bank statement
            lines = file_content.getvalue().decode('utf-8').split('\n')
            transactions = []
            
            for line in lines:
                # Skip empty lines and headers
                if not line.strip() or any(header in line.lower() for header in ['date', 'transaction', 'balance']):
                    continue
                
                # Try to extract date, amount, and description
                # This pattern matches various date formats and amounts
                match = re.match(r'(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\s+([\d,.]+)\s+(.+)', line)
                if match:
                    date_str, amount_str, desc = match.groups()
                    try:
                        date = pd.to_datetime(date_str)
                        amount = float(amount_str.replace(',', ''))
                        transactions.append({
                            'date': date,
                            'amount': amount,
                            'description': desc.strip()
                        })
                    except:
                        continue
            
            if not transactions:
                st.error("No valid transactions found in the text file.")
                return None
                
            return pd.DataFrame(transactions)
        
        else:
            st.error("Unsupported statement type")
            return None
            
    except Exception as e:
        st.error(f"Error parsing statement: {str(e)}")
        return None

def get_detailed_ai_insights(df):
    """Get detailed AI-powered financial insights"""
    # Calculate key metrics
    total_expenses = df['amount'].sum()
    avg_transaction = df['amount'].mean()
    top_categories = df.groupby('category')['amount'].sum().nlargest(3)
    monthly_trend = df.groupby(df['date'].dt.strftime('%Y-%m'))['amount'].sum()
    
    # Create detailed prompt
    prompt = f"""Based on the following financial data:
    
    Total Expenses: ${total_expenses:.2f}
    Average Transaction: ${avg_transaction:.2f}
    Top Spending Categories: {top_categories.to_dict()}
    Monthly Trend: {monthly_trend.to_dict()}
    
    Please provide:
    1. A summary of spending patterns
    2. Areas where spending could be optimized
    3. Specific money-saving recommendations
    4. Investment opportunities based on spending habits
    5. Potential financial risks to watch out for
    
    Format the response in a clear, structured way with bullet points."""
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except:
        return "Unable to generate detailed insights at this time."

# Sidebar navigation
st.sidebar.title("Navigation")
page = st.sidebar.radio("Go to", ["Upload Statement", "Expense Analysis", "Budget Tracker", "AI Insights"])

# Helper functions
def categorize_expense(description):
    """Categorize expense based on description using Gemini AI"""
    prompt = f"Categorize this expense into one of these categories: Food, Rent, Transportation, Entertainment, Utilities, Shopping. Description: {description}"
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except:
        return "Uncategorized"

# Upload Statement Page
if page == "Upload Statement":
    st.title("Upload Your Bank Statement")
    
    # Statement type selection
    st.session_state.statement_type = st.radio(
        "Select Statement Type",
        ["Gemini AI", "CSV", "Text"],
        help="Choose Gemini AI for automatic parsing, CSV for structured data, or Text for raw bank statement"
    )
    
    uploaded_file = st.file_uploader(
        "Choose your bank statement file",
        type=['csv', 'txt', 'pdf'] if st.session_state.statement_type == "Gemini AI" else 
             (['csv', 'txt'] if st.session_state.statement_type == "Text" else ['csv'])
    )
    
    if uploaded_file is not None:
        with st.spinner("Processing your statement..."):
            df = parse_bank_statement(uploaded_file, st.session_state.statement_type)
            if df is not None:
                with st.spinner("Categorizing transactions..."):
                    df['category'] = df['description'].apply(categorize_expense)
                st.session_state.expenses = df
                st.success("Statement processed successfully!")
                
                # Show sample of processed data
                st.subheader("Sample of Processed Transactions")
                st.dataframe(df.head())
                
                # Show basic statistics
                st.subheader("Quick Statistics")
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("Total Transactions", len(df))
                with col2:
                    st.metric("Total Amount", f"${df['amount'].sum():.2f}")
                with col3:
                    st.metric("Unique Categories", len(df['category'].unique()))

# Expense Analysis Page
elif page == "Expense Analysis":
    st.title("Expense Analysis")
    
    if st.session_state.expenses is not None:
        df = st.session_state.expenses
        
        # Create tabs for different visualizations
        tab1, tab2, tab3 = st.tabs(["Category Distribution", "Monthly Trend", "Transaction Analysis"])
        
        with tab1:
            # Pie chart for expense distribution
            fig_pie = px.pie(df, values='amount', names='category', 
                           title='Expense Distribution by Category')
            st.plotly_chart(fig_pie, use_container_width=True)
            
            # Category-wise breakdown
            st.subheader("Category-wise Breakdown")
            category_stats = df.groupby('category').agg({
                'amount': ['sum', 'count', 'mean']
            }).round(2)
            st.dataframe(category_stats)
        
        with tab2:
            # Monthly trend
            monthly_expenses = df.groupby(df['date'].dt.strftime('%Y-%m'))['amount'].sum().reset_index()
            fig_line = px.line(monthly_expenses, x='date', y='amount',
                             title='Monthly Expense Trend')
            st.plotly_chart(fig_line, use_container_width=True)
            
            # Monthly category breakdown
            monthly_categories = pd.pivot_table(
                df,
                values='amount',
                index=df['date'].dt.strftime('%Y-%m'),
                columns='category',
                aggfunc='sum'
            ).fillna(0)
            st.subheader("Monthly Category Breakdown")
            st.dataframe(monthly_categories)
        
        with tab3:
            # Top transactions
            st.subheader("Top Transactions")
            top_transactions = df.nlargest(5, 'amount')
            st.dataframe(top_transactions)
            
            # Transaction distribution
            fig_hist = px.histogram(df, x='amount',
                                  title='Transaction Amount Distribution')
            st.plotly_chart(fig_hist, use_container_width=True)
    else:
        st.warning("Please upload your bank statement first!")

# Budget Tracker Page
elif page == "Budget Tracker":
    st.title("Budget Tracker")
    
    if st.session_state.expenses is not None:
        df = st.session_state.expenses
        
        # Budget input form
        st.subheader("Set Budgets")
        col1, col2 = st.columns(2)
        
        for category in st.session_state.budgets.keys():
            with col1 if len(col1._container) < len(col2._container) else col2:
                st.session_state.budgets[category] = st.number_input(
                    f"{category} Budget",
                    value=float(st.session_state.budgets[category]),
                    min_value=0.0
                )
        
        # Calculate actual expenses vs budget
        actual_expenses = df.groupby('category')['amount'].sum()
        
        # Create comparison chart
        categories = list(st.session_state.budgets.keys())
        budget_values = [st.session_state.budgets[cat] for cat in categories]
        actual_values = [actual_expenses.get(cat, 0) for cat in categories]
        
        fig = go.Figure(data=[
            go.Bar(name='Budget', x=categories, y=budget_values),
            go.Bar(name='Actual', x=categories, y=actual_values)
        ])
        fig.update_layout(title='Budget vs Actual Expenses')
        st.plotly_chart(fig, use_container_width=True)
        
        # Show over-budget categories
        over_budget = {cat: actual_expenses.get(cat, 0) - st.session_state.budgets[cat]
                      for cat in categories}
        over_budget = {k: v for k, v in over_budget.items() if v > 0}
        
        if over_budget:
            st.warning("Over-budget categories:")
            for cat, amount in over_budget.items():
                st.write(f"{cat}: ${amount:.2f} over budget")
    else:
        st.warning("Please upload your bank statement first!")

# AI Insights Page
elif page == "AI Insights":
    st.title("AI-Powered Financial Insights")
    
    if st.session_state.expenses is not None:
        if st.button("Generate Detailed Insights"):
            with st.spinner("Analyzing your financial data..."):
                insights = get_detailed_ai_insights(st.session_state.expenses)
                st.markdown(insights)
                
                # Additional insights
                st.subheader("Key Financial Metrics")
                df = st.session_state.expenses
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("Total Expenses", f"${df['amount'].sum():.2f}")
                with col2:
                    st.metric("Average Transaction", f"${df['amount'].mean():.2f}")
                with col3:
                    st.metric("Most Common Category", df['category'].mode().iloc[0])
    else:
        st.warning("Please upload your bank statement first!")

# Footer
st.markdown("---")
st.markdown("Built with ❤️ using Streamlit and Gemini AI")
