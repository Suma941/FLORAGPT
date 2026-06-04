import os
import json
from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure Gemini API
# Make sure GEMINI_API_KEY is set in your .env file
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# Use Gemini 1.5 Flash for fast text generation
# We can also use gemini-1.5-pro if needed for more complex queries
model = genai.GenerativeModel('gemini-2.5-flash')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/plant-care', methods=['POST'])
def get_plant_care():
    try:
        data = request.get_json()
        plant_name = data.get('plant_name')

        if not plant_name:
            return jsonify({'error': 'Plant name is required'}), 400

        # Construct the prompt to enforce a JSON response structure
        prompt = f"""
        You are an expert botanist and plant care assistant. The user wants to know how to care for: '{plant_name}'.
        Provide a comprehensive care guide in JSON format ONLY. Do not include markdown code blocks, just raw JSON.
        
        The JSON must have the following exact keys:
        - "plantName": A beautifully formatted common name (and scientific name if applicable).
        - "overview": A short 2-3 sentence engaging overview of the plant.
        - "watering": Specific watering requirements (frequency, how to check soil, etc).
        - "sunlight": Specific sunlight needs (bright indirect, low light, full sun, etc).
        - "soil": Ideal soil type, pH, and drainage needs.
        - "fertilizer": Fertilizer recommendations (type, frequency, seasons).
        - "diseases": Common pests/diseases and how to prevent them.
        - "tips": 2-3 beginner-friendly pro tips for this specific plant.
        """

        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean up in case the model wraps it in markdown code block
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]

        try:
            care_data = json.loads(response_text)
            return jsonify(care_data)
        except json.JSONDecodeError:
            print(f"Failed to decode JSON from Gemini: {response_text}")
            return jsonify({'error': 'Failed to parse AI response. Please try again.'}), 500

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred while communicating with the AI.'}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)