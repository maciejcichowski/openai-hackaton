import logging
from flask import Flask, request, jsonify
from openai import OpenAI
from datetime import datetime
from database import SessionLocal  # Replace with your actual database module
from receipt_service import ReceiptService  # Replace with your actual database module
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)

# Initialize your receipt service with a database session
db_session = SessionLocal()
receipt_service = ReceiptService(db_session)

@app.route('/process_question', methods=['POST'])
def process_question():
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        logging.warning("API key is missing in the request headers.")
        return jsonify({"error": "API key is required in the X-API-Key header"}), 401

    data = request.json
    question = data.get('question')

    if not question:
        logging.warning("Question is missing in the request body.")
        return jsonify({"error": "Question is required"}), 400

    logging.info(f"Received question: {question}")

    client = OpenAI(api_key=api_key)

    # Use OpenAI to determine the intent of the question
    intent_messages = [
        {"role": "system", "content": "You are an assistant that determines whether a question requires database access or can be answered directly."},
        {"role": "user", "content": f"Determine the intent of this question: {question}"}
    ]

    intent_response = client.chat.completions.create(
        model="gpt-4.1",  # Replace with your model ID
        messages=intent_messages,
        max_tokens=50
    )

    intent = intent_response.choices[0].message.content.strip().lower()
    logging.info(f"Determined intent: {intent}")

    # Decide based on the intent
    if "database" in intent:
        logging.info("Intent requires database access.")
        # Extract details from the question using OpenAI
        details = extract_details_from_question(client, question)

        # Check for specific details to determine the database query
        if 'category' in details:
            category = details['category']
            response_text = get_spending_by_category(category)
        elif 'date' in details:
            date = details['date']
            response_text = get_spending_by_date(date)
        elif 'keyword' in details:
            keyword = details['keyword']
            response_text = get_last_spending_by_keyword(keyword)
        else:
            response_text = "Unable to determine the specific database query required."
    else:
        logging.info("Intent does not require database access. Using OpenAI to answer.")
        # If the intent is not database-related, use OpenAI to answer
        answer_messages = [
            {"role": "system", "content": "You are a helpful assistant that helps users get information about their purchase history and receipts."},
            {"role": "user", "content": question}
        ]

        answer_response = client.chat.completions.create(
            model="gpt-4.1",  # Replace with your model ID
            messages=answer_messages,
            max_tokens=150
        )

        response_text = answer_response.choices[0].message.content.strip()

    logging.info(f"Response text: {response_text}")
    return jsonify({"response": response_text})

def extract_details_from_question(client, question):
    # Use OpenAI to extract details from the question
    extraction_messages = [
        {"role": "system", "content": "You are an assistant that extracts details like category, date, or keyword from a question and returns them as a JSON object."},
        {"role": "user", "content": f"Extract details from this question and return as JSON: {question}"}
    ]

    extraction_response = client.chat.completions.create(
        model="gpt-4.1",  # Replace with your model ID
        messages=extraction_messages,
        max_tokens=100
    )

    # Log the raw response for debugging
    raw_content = extraction_response.choices[0].message.content.strip()
    logging.info(f"Raw extraction response: {raw_content}")

    try:
        # Parse the response to extract details
        details = json.loads(raw_content)
        logging.info(f"Extracted details: {details}")
        return details
    except json.JSONDecodeError as e:
        logging.error(f"JSON decoding failed: {e}")
        logging.error(f"Failed to parse response: {raw_content}")
        # Return an empty dictionary or handle the error as needed
        return {}

# Define your receipt queries as functions
def get_spending_by_category(category, start_date=None, end_date=None):
    logging.info(f"Querying database for category: {category}, start_date: {start_date}, end_date: {end_date}")
    start = datetime.strptime(start_date, '%Y-%m-%d').date() if start_date else None
    end = datetime.strptime(end_date, '%Y-%m-%d').date() if end_date else None
    amount = receipt_service.get_spending_by_category(category, start, end)
    logging.info(f"Database response for category '{category}': {amount}")
    return f"Spending in category {category}: {amount:.2f}"

def get_spending_by_date(date):
    logging.info(f"Querying database for date: {date}")
    parsed_date = datetime.strptime(date, '%Y-%m-%d').date()
    amount = receipt_service.get_spending_by_date(parsed_date)
    logging.info(f"Database response for date '{date}': {amount}")
    return f"Spending on {parsed_date}: {amount:.2f}"

def get_last_spending_by_keyword(keyword):
    logging.info(f"Querying database for last spending with keyword: {keyword}")
    receipt = receipt_service.get_last_receipt_containing_keyword(keyword)
    if not receipt:
        logging.info("No receipts found for the given keyword.")
        return "No receipts found"
    result = f"Spending on {receipt.purchase_date}: {receipt.total_amount:.2f}\n"
    for item in receipt.items:
        result += f"- Item on the receipt: {item.name}  Price: {item.price:.2f}\n"
    logging.info(f"Database response for keyword '{keyword}': {result}")
    return result

def search_receipts(keyword):
    logging.info(f"Querying database for receipts with keyword: {keyword}")
    receipts = receipt_service.search_receipts(keyword)
    result = f"Found {len(receipts)} receipts matching '{keyword}':\n"
    for receipt in receipts:
        result += f"- {receipt.store_name} on {receipt.purchase_date}: {receipt.total_amount:.2f}\n"
    logging.info(f"Database response for search keyword '{keyword}': {result}")
    return result

if __name__ == '__main__':
    app.run(port=5000, debug=True)
