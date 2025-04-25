from flask import Flask, request, jsonify
from openai import OpenAI
import json

app = Flask(__name__)

# Model constants
GPT_4_VISION = "gpt-4-vision-preview"
GPT_4_TURBO = "gpt-4.1"
GPT_3_5_TURBO = "gpt-3.5-turbo-1106"

# Step model assignments
RECEIPT_ANALYSIS_MODEL = GPT_4_TURBO
RECEIPT_OCR_MODEL = GPT_4_TURBO
PRODUCT_CATEGORIZATION_MODEL = GPT_4_TURBO

RECEIPT_AGENT_ROLE = """
You are a receipt analysis assistant. Your task is to extract and analyze information from receipts,
such as total amount, items purchased, date, and vendor name. Provide a concise summary of the receipt details.
"""

RECEIPT_OCR_ROLE = """
You are a receipt OCR assistant. Your task is to extract information from receipt images,
such as the list of products, shop name, and date. Provide the extracted information in a structured JSON format.
Include 'shop_name', 'date', and 'products' (as an array of objects with 'name' and 'price') in your response.
"""

RECEIPT_CATEGORIZATION_ROLE = """
You are a product categorization assistant. Your task is to categorize the given list of products
into appropriate categories such as Groceries, Electronics, Clothing, etc. Provide the categorized products in a structured JSON format.
Each product should have a 'name', 'price', and 'category' field.
"""

def analyze_receipt(receipt_text: str, api_key: str) -> str:
    """Analyze the receipt text using OpenAI API."""
    client = OpenAI(api_key=api_key)

    messages = [
        {"role": "system", "content": RECEIPT_AGENT_ROLE},
        {"role": "user", "content": f"Analyze this receipt: {receipt_text}"}
    ]

    response = client.chat.completions.create(
        model=RECEIPT_ANALYSIS_MODEL,
        messages=messages
    )

    return response.choices[0].message.content

def process_receipt_image(image_base64: str, api_key: str) -> dict:
    """Process the receipt image using OpenAI API."""
    client = OpenAI(api_key=api_key)

    messages = [
        {"role": "system", "content": RECEIPT_OCR_ROLE},
        {"role": "user", "content": [
            {"type": "text", "text": "Extract information from this receipt image:"},
            {"type": "image_url", "image_url": {"url": f"{image_base64}"}}
        ]}
    ]

    response = client.chat.completions.create(
        model=RECEIPT_OCR_MODEL,
        messages=messages,
        max_tokens=300
    )

    return json.loads(response.choices[0].message.content)

def categorize_products(products: list, api_key: str) -> dict:
    """Categorize the products using OpenAI API."""
    client = OpenAI(api_key=api_key)

    messages = [
        {"role": "system", "content": RECEIPT_CATEGORIZATION_ROLE},
        {"role": "user", "content": f"Categorize these products: {json.dumps(products)}"}
    ]

    response = client.chat.completions.create(
        model=PRODUCT_CATEGORIZATION_MODEL,
        messages=messages
    )

    # Check if the response contains valid content
    content = response.choices[0].message.content.strip()
    if not content:
        raise ValueError("Received empty response from the API")

    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to decode JSON response: {e}")

@app.route('/analyze_receipt', methods=['POST'])
def analyze_receipt_endpoint():
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        return jsonify({"error": "API key is required in the X-API-Key header"}), 401

    data = request.json
    receipt_text = data.get('receipt_text')

    if not receipt_text:
        return jsonify({"error": "Receipt text is required"}), 400

    analysis = analyze_receipt(receipt_text, api_key)
    return jsonify({"analysis": analysis})

@app.route('/process_receipt', methods=['POST'])
def process_receipt_endpoint():
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        return jsonify({"error": "API key is required in the X-API-Key header"}), 401

    data = request.json
    image_base64 = data.get('image_base64')

    if not image_base64:
        return jsonify({"error": "Receipt image (base64 encoded) is required"}), 400

    # Step 1: Process the receipt image
    ocr_result = process_receipt_image(image_base64, api_key)

    # Step 2: Categorize the products
    categorized_products = categorize_products(ocr_result['products'], api_key)

    return jsonify({
        "ocr_result": ocr_result,
        "categorized_products": categorized_products
    })

@app.route('/ocr_receipt', methods=['POST'])
def ocr_receipt_endpoint():
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        return jsonify({"error": "API key is required in the X-API-Key header"}), 401

    data = request.json
    image_base64 = data.get('image_base64')

    if not image_base64:
        return jsonify({"error": "Receipt image (base64 encoded) is required"}), 400

    ocr_result = process_receipt_image(image_base64, api_key)
    return jsonify({"ocr_result": ocr_result})

@app.route('/categorize_products', methods=['POST'])
def categorize_products_endpoint():
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        return jsonify({"error": "API key is required in the X-API-Key header"}), 401

    data = request.json
    products = data.get('products')

    if not products:
        return jsonify({"error": "Products list is required"}), 400

    categorized_products = categorize_products(products, api_key)
    return jsonify({"categorized_products": categorized_products})

if __name__ == '__main__':
    app.run(debug=True)
