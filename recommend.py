import pickle
import pandas as pd
from flask import Flask, request, jsonify
from sklearn.neighbors import NearestNeighbors
from flask_cors import CORS 

app = Flask(__name__)
CORS(app) 



with open("model/knn_model.pkl", "rb") as model_file:
    knn = pickle.load(model_file)

with open("model/dataset.pkl", "rb") as model_file:
    df = pickle.load(model_file)


num_cols = ["Protein", "Carbohydrates", "Sugar", "Fat", "Sodium"]


import re  

def extract_numeric(value):
    """Extract numeric values from strings like '5.08 g' and convert to float."""
    if isinstance(value, str):  
        value = re.sub(r"[^\d.]", "", value)  
    try:
        return float(value)
    except ValueError:
        return 0  

def compute_health_score(product):
    weight_factors = {
        "Protein": 0.4,
        "Carbohydrates": 0.1,
        "Sugar": -0.3,
        "Fat": -0.2,
        "Sodium": -0.3
    }

    score = sum(extract_numeric(product[nutrient]) * weight for nutrient, weight in weight_factors.items())
    print(score)
    return score




df["health_score"] = df.apply(compute_health_score, axis=1)



@app.route("/recommend", methods=["GET"])
def recommend_healthier_alternative():
    product_name = request.args.get("product_name")
    
    if not product_name:
        return jsonify({"error": "Please provide a product_name"}), 400
    
    if product_name not in df["name"].values:
        return jsonify({"error": f"Product '{product_name}' not found in dataset."}), 404

   
    product = df[df["name"] == product_name].iloc[0]
    category = product["category"]
    product_health_score = product["health_score"]

   
    dimensions, indices = knn.kneighbors([product[num_cols].values])
    similar_products = df.iloc[indices[0]]

   
    alternatives = similar_products[similar_products["category"] == category]

    
    healthier_alternatives = alternatives[alternatives["health_score"] > product_health_score]

   
    if healthier_alternatives.empty:
        best_alternative = alternatives.sort_values(by="health_score", ascending=False).head(5)
        return jsonify({"message": "No strict healthier alternative found.", "alternative": best_alternative.to_dict(orient="records")})
    
    return jsonify({"healthier_alternatives": healthier_alternatives.sort_values(by="health_score", ascending=False).head(5).to_dict(orient="records")})

if __name__ == "__main__":
    app.run(debug=True)
