from flask import Blueprint, request, jsonify
import torch
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
from recommendation_model.model import Autoencoder  # adjust import as needed
from flask_cors import CORS
recommend_bp = Blueprint('recommend', __name__)
CORS(recommend_bp)
# Load data
df = pd.read_csv('routes/preprocessed_dataset.csv')

# Nutrient columns (must match training)
nutrient_cols = [
    "Protein", "Sugar", "Fat", "Fiber", "Sodium", "Carbohydrates",
    "allergen_milk", "allergen_nuts", "allergen_gluten",
    "allergen_eggs", "allergen_soybeans"
]

# Load scaler
import pickle
with open('recommendation_model/scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)

# Normalize dataset
X = scaler.transform(df[nutrient_cols].fillna(0))
X_tensor = torch.tensor(X, dtype=torch.float32)

# Load trained autoencoder
model = Autoencoder(input_dim=X.shape[1])
model.load_state_dict(torch.load('recommendation_model/autoencoder_model.pth'))
model.eval()

# Allergen mapping
allergen_map = {
    "milk": "allergen_milk",
    "nuts": "allergen_nuts",
    "soybeans": "allergen_soybeans",
    "gluten": "allergen_gluten",
    "eggs": "allergen_eggs"
}

# Dummy disease rules
disease_rules = {
    "Diabetes": {"ingredients": ["sugar"], "threshold": 10},
    "Hypertension": {"ingredients": ["sodium"], "threshold": 1500}
}

# Classifier
def classify_product(row, user_profile):
    reasons = []

    for allergen in user_profile.get("allergens", []):
        col = allergen_map.get(allergen.lower())
        if col and row.get(col, 0) == 1:
            reasons.append(f"Allergen: {allergen}")

    for disease in user_profile.get("diseases", []):
        rule = disease_rules.get(disease)
        if rule:
            for ingredient in rule["ingredients"]:
                if row.get(ingredient.title(), 0) > rule["threshold"]:
                    reasons.append(f"{ingredient} > {rule['threshold']}")

    return "Harmful" if reasons else row.get("health_class", "Healthy")

@recommend_bp.route('/recommend', methods=['POST'])
def recommend():
    print("reached")
    data = request.get_json()
    print(data)
    product_name = data.get("product_name")
    user_allergens = data.get("allergens", [])
    user_diseases = data.get("diseases", [])
    print(user_allergens, user_diseases)
    if product_name not in df["name"].values:
        return jsonify({"error": "Product not found"}), 404

    user_profile = {
        "allergens": user_allergens,
        "diseases": user_diseases
    }

    # Get input product
    input_index = df[df["name"] == product_name].index[0]
    input_vector = X_tensor[input_index].unsqueeze(0)
    reconstructed_input = model(input_vector).detach().numpy()
    input_category = df.loc[input_index, "category"]

    # Filter same category products (excluding input)
    mask = (df["name"] != product_name) & (df["category"] == input_category)
    filtered_df = df[mask].copy()
    filtered_X = X_tensor[filtered_df.index]

    reconstructed_all = model(filtered_X).detach().numpy()
    similarities = cosine_similarity(reconstructed_input, reconstructed_all)[0]
    filtered_df["similarity"] = similarities

    # Health filtering
    filtered_df["health_filtered"] = filtered_df.apply(
        lambda row: classify_product(row, user_profile), axis=1
    )

    result = filtered_df[filtered_df["health_filtered"] != "Harmful"]\
        .sort_values("similarity", ascending=False)\
        .head(5)[["name", "category", "health_class", "similarity"]]

    return jsonify(result.to_dict(orient="records"))
