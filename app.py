import json
from flask import Flask, render_template, request, jsonify
import pandas as pd
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def categorize_transactions(df):

    df['Value'] = df["Value"].astype(int)

    categorized_transactions = df.groupby('Component')['Value'].sum().reset_index()
    categorized_transactions = categorized_transactions.to-dict(orient = 'records')
    return categorized_transactions

def calculate_monthly_summary(df):
    df['Date'] = pd.to_datetime(df['Date'])
    df['Month'] = df['Date'].dt.month

    monthly_summary = df.groupby(['Component'])['Value'].sum().reset_index()
    monthly_summary = monthly_summary.to_dict(orient = 'records')
    return monthly_summary


@app.route("/")
def index():
    return render_template('index.html')

@app.route("/monthly-summary", methods = ["POST"])
def generate_monthly_summary():
    data = request.get_json()
    df = pd.DataFrame(data)

    categorized_transactions = categorize_transactions(df)
    monthly_summary = calculate_monthly_summary(df)

    summary_data = {
        'categorized_transactions' : categorized_transactions,
        'monthly-summary' : monthly_summary
    }

    return jsonify(summary_data)

if __name__ == "__main__":
    app.run(debug = True)
