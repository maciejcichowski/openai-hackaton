from flask import Flask, request, jsonify
from openai import OpenAI
from typing import Dict, List

app = Flask(__name__)

agents: Dict[str, Dict[str, str | List[Dict[str, str]]]] = {}

def create_agent(name: str, role: str) -> Dict[str, str | List[Dict[str, str]]]:
    """Create an agent with a specific name and role."""
    return {"name": name, "role": role, "messages": []}

def add_message(agent: Dict[str, str | List[Dict[str, str]]], role: str, content: str) -> None:
    """Add a message to the agent's conversation history."""
    agent["messages"].append({"role": role, "content": content})

def get_agent_response(agent: Dict[str, str | List[Dict[str, str]]], user_input: str, api_key: str) -> str:
    """Get a response from the agent based on the conversation history."""
    # Initialize the OpenAI client with the provided API key
    client = OpenAI(api_key=api_key)

    # Add user input to the conversation
    add_message(agent, "user", user_input)

    # Prepare the messages for the API call
    messages = [{"role": "system", "content": agent["role"]}] + agent["messages"]

    # Make the API call
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages
    )

    # Extract the agent's response
    agent_response = response.choices[0].message.content

    # Add the agent's response to the conversation
    add_message(agent, "assistant", agent_response)

    return agent_response

@app.route('/agent', methods=['POST'])
def create_new_agent():
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        return jsonify({"error": "API key is required in the X-API-Key header"}), 401

    data = request.json
    name = data.get('name')
    role = data.get('role')

    if not name or not role:
        return jsonify({"error": "Name and role are required"}), 400

    agents[name] = create_agent(name, role)
    return jsonify({"message": f"Agent '{name}' created successfully"}), 201

@app.route('/agent/<name>/chat', methods=['POST'])
def chat_with_agent(name):
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        return jsonify({"error": "API key is required in the X-API-Key header"}), 401

    if name not in agents:
        return jsonify({"error": f"Agent '{name}' not found"}), 404

    data = request.json
    user_input = data.get('message')

    if not user_input:
        return jsonify({"error": "Message is required"}), 400

    response = get_agent_response(agents[name], user_input, api_key)
    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(debug=True)
