import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
import lightgbm as lgbm
import xgboost as xgb
import pickle
import json
from flask import Flask, request, jsonify, render_template
import os

def prepare_data(data_path):
    """Load and prepare data for training"""
    df = pd.read_csv('preprocessed_dataset.csv')
    
    features = ['Protein', 'Fat', 'Sodium', 'Carbohydrates', 'Fiber', 'Sugar']
    X = df[features]
    y = df['health_class']
  
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    return X_train, X_test, y_train, y_test, le, X.columns.tolist()



def train_lightgbm(X_train, y_train, X_test, y_test, le):
    """Train and evaluate LightGBM model"""
    print("--- Training LightGBM ---")
    params = {
        'objective': 'multiclass',
        'num_class': len(le.classes_),
        'metric': 'multi_logloss',
        'learning_rate': 0.05,
        'max_depth': 6,
        'n_estimators': 200,
        'verbose': -1  
    }
    
    model = lgbm.LGBMClassifier(**params)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, target_names=le.classes_, output_dict=True)
    
    print(f"Accuracy: {accuracy:.4f}")
    print("Classification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))
    
    return model, accuracy, report

def train_xgboost(X_train, y_train, X_test, y_test, le):
    """Train and evaluate XGBoost model"""
    print("--- Training XGBoost ---")

    params = {
        'objective': 'multi:softmax',
        'num_class': len(le.classes_),
        'max_depth': 6,
        'learning_rate': 0.05,
        'n_estimators': 200,
        'verbosity': 0  
    }
    
    model = xgb.XGBClassifier(**params)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, target_names=le.classes_, output_dict=True)
    
    print(f"Accuracy: {accuracy:.4f}")
    print("Classification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))
    
    return model, accuracy, report

def save_models(lgbm_model, xgb_model, le, feature_names):
    """Save trained models, label encoder and feature names to files"""
    os.makedirs('models', exist_ok=True)
    
    with open('models/lightgbm_model.pkl', 'wb') as f:
        pickle.dump(lgbm_model, f)

    with open('models/xgboost_model.pkl', 'wb') as f:
        pickle.dump(xgb_model, f)
    
    with open('models/label_encoder.pkl', 'wb') as f:
        pickle.dump(le, f)
    
    with open('models/feature_names.json', 'w') as f:
        json.dump(feature_names, f)
    
    print("Models, label encoder, and feature names saved successfully!")

def predict(input_data, model_name='lightgbm'):
    """Make predictions with the selected model"""
    model_path = f'models/{model_name}_model.pkl'
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    with open('models/label_encoder.pkl', 'rb') as f:
        le = pickle.load(f)

    with open('models/feature_names.json', 'r') as f:
        feature_names = json.load(f)
    
    df = pd.DataFrame([input_data], columns=feature_names)
    
    for col in df.columns:
        if col not in feature_names:
            similar_cols = [feat for feat in feature_names if feat.lower() == col.lower()]
            if similar_cols:
                df.rename(columns={col: similar_cols[0]}, inplace=True)
    prediction_idx = model.predict(df)[0]
    prediction_label = le.inverse_transform([prediction_idx])[0]
    
    probabilities = model.predict_proba(df)[0]
    prob_dict = {le.inverse_transform([i])[0]: float(prob) for i, prob in enumerate(probabilities)}
    
    
    result = {
        'prediction': prediction_label,
        'probabilities': prob_dict
    }
    
    return result

if __name__ == "__main__":
    X_train, X_test, y_train, y_test, le, feature_names = prepare_data('preprocessed_data.csv')
    lgbm_model, lgbm_acc, _ = train_lightgbm(X_train, y_train, X_test, y_test, le)
    xgb_model, xgb_acc, _ = train_xgboost(X_train, y_train, X_test, y_test, le)
    save_models(lgbm_model, xgb_model, le, feature_names)

    print("\n--- Summary ---")
    print(f"LightGBM Accuracy: {lgbm_acc:.4f}")
    print(f"XGBoost Accuracy: {xgb_acc:.4f}")
    sample_input = {
        'Protein': 1.0,
        'Carbohydrates': 400.0,
        'Sugar': 0.0,
        'Fat': 200.0,
        'Fiber': 50.0,
        'Sodium': 100.1,
        'allergen_eggs': 0,
        'allergen_gluten': 0,
        'allergen_milk': 0,
        'allergen_nuts': 0,
        'allergen_soybeans': 0
    }

    prediction_result = predict(sample_input, model_name='lightgbm')
    print("\n--- Sample Prediction ---")
    print("Prediction:", prediction_result['prediction'])
    print("Probabilities:", prediction_result['probabilities'])

app = Flask(__name__, template_folder='templates')
os.makedirs('templates', exist_ok=True)