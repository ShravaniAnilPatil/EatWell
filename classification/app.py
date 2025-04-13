from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
import pickle
import json
import pandas as pd



app = Flask(__name__, template_folder='templates')
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins


@app.route('/api/predict', methods=['POST'])
def api_predict():
    """API endpoint for making predictions"""
    try:
        input_data = request.json
        model_name = input_data.pop('model_name', 'lightgbm') 

        if model_name not in ['lightgbm', 'xgboost']:
            return jsonify({"error": "Invalid model name. Choose 'lightgbm' or 'xgboost'"}), 400
        
        result = predict(input_data, model_name)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def predict(input_data, model_name='lightgbm'):
    """Make predictions with the selected model"""
    model_path = f'models/{model_name}_model.pkl'
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    with open('models/label_encoder.pkl', 'rb') as f:
        le = pickle.load(f)
    with open('models/feature_names.json', 'r') as f:
        feature_names = json.load(f)
    
    # Create DataFrame with just the required features
    filtered_input = {k: v for k, v in input_data.items() if k in feature_names}
    df = pd.DataFrame([filtered_input], columns=feature_names)
    
    # Fill missing values with 0
    for feature in feature_names:
        if feature not in df.columns:
            df[feature] = 0
    
    # Ensure columns are in the right order
    df = df[feature_names]
    
    # Make prediction
    prediction_idx = model.predict(df)[0]
    prediction_label = le.inverse_transform([prediction_idx])[0]
    
    probabilities = model.predict_proba(df)[0]
    prob_dict = {le.inverse_transform([i])[0]: float(prob) for i, prob in enumerate(probabilities)}
    
    result = {
        'prediction': prediction_label,
        'probabilities': prob_dict
    }
    
    return result

@app.route('/')
def index():
    """Serve the static React app"""
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5007)