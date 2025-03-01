from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import re

app = Flask(__name__)
CORS(app)

os.environ['GOOGLE_API_KEY'] = 'AIzaSyB6O5E2i17vu4AV0g84NReFjW2U8bLCWPg'
API_KEY = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=API_KEY)

def prep_image(image_path):
    sample_file = genai.upload_file(path=image_path, display_name="UploadedImage")
    file = genai.get_file(name=sample_file.name)
    return sample_file

def extract_text_from_image(image_path, prompt):
    model = genai.GenerativeModel(model_name="gemini-1.5-pro")
    response = model.generate_content([image_path, prompt])
    return response.text

def extract_ingredients_text(full_text):
    match = re.search(r"(?i)(ingredients:?\s*)(.*?\.)(?=\s|$)", full_text)  
    if match:
        return match.group(2).strip()  
    return None 

@app.route('/upload-image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image = request.files['image']
    image_path = f"temp/{image.filename}" 
    os.makedirs("temp", exist_ok=True) 
    image.save(image_path)

    try:
        sample_file = prep_image(image_path)
        full_text = extract_text_from_image(sample_file, "Extract the text in the image verbatim")
        ingredients_text = extract_ingredients_text(full_text)
        
        if ingredients_text:
            return jsonify({"extracted_text": ingredients_text}), 200
        else:
            return jsonify({"extracted_text": full_text.strip()}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(image_path):
            os.remove(image_path)

if __name__ == '__main__':
    app.run(debug=True, port=5500)
