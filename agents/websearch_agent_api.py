from flask import Flask, request, jsonify
import openai
import os

app = Flask(__name__)

# Model constants
WEB_SEARCH_MODEL = "text-davinci-003"

WEB_SEARCH_ROLE = """
You are a web search assistant. Your task is to search the web and provide concise and relevant information
about the given query. Ensure the response is informative and accurate.
"""

def query_openai_with_web_search(query: str, api_key: str) -> str:
    """Query OpenAI with web search enabled."""
    openai.api_key = api_key

    messages = [
        {"role": "system", "content": WEB_SEARCH_ROLE},
        {"role": "user", "content": f"Search the web and provide information about: {query}"}
    ]

    response = openai.Completion.create(
        engine=WEB_SEARCH_MODEL,
        prompt=messages[1]['content'],
        max_tokens=150
    )

    return response.choices[0].text.strip()

@app.route('/query_openai', methods=['POST'])
def query_openai_endpoint():
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        return jsonify({"error": "API key is required in the X-API-Key header"}), 401

    data = request.json
    query = data.get('query')

    if not query:
        return jsonify({"error": "Query is required"}), 400

    try:
        result = query_openai_with_web_search(query, api_key)
        return jsonify({"response": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
