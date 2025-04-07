# from flask import Flask, jsonify, request
# import requests
# from flask_cors import CORS
# import csv

# import json

# def load_products_from_json(file_path):
#     products = []
#     with open(file_path, 'r', encoding='utf-8') as f:
#         for line in f:
#             products.append(json.loads(line))
#     return products


# products_dataset = load_products_from_json("../dataset/final.json")

# app = Flask(__name__)
# CORS(app)

# # Load dataset from CSV
# # def load_products_from_csv(file_path):
# #     products = []
# #     with open(file_path, newline='', encoding='utf-8') as csvfile:
# #         reader = csv.DictReader(csvfile)
# #         for row in reader:
# #             # Convert comma-separated string to list for ingredients
# #             if "ingredients" in row and row["ingredients"]:
# #                 row["ingredients"] = [ingredient.strip() for ingredient in row["ingredients"].split(",")]
# #             products.append(row)
# #     return products

# # Load data at startup




# @app.route("/api/products", methods=['GET'])
# def search_products():
#     query = request.args.get("name", "").lower().strip()

#     if not query:
#         return jsonify({"products": []})

#     matched_products = [
#         product for product in products_dataset
#         if query in product.get("product_name", "").lower().strip()
#     ]

#     return jsonify({"products": matched_products})


# # @app.route('/api/product', methods=['GET'])
# # def get_product_info():
# #     product_name = request.args.get('name', '').strip()
# #     if not product_name:
# #         return jsonify({"error": "Product name is required"}), 400

# #     url = f"https://world.openfoodfacts.org/cgi/search.pl?search_terms={product_name}&search_simple=1&action=process&json=1"
# #     response = requests.get(url)
    
# #     if response.status_code == 200:
# #         data = response.json()
        
# #         if data.get("products"):
# #             products = []
# #             for product in data["products"]:
# #                 print(product)
# #                 print("*****")
# #                 # Extract product information
# #                 product_info = {
# #                     "product_name": product.get("product_name", "N/A"),
# #                     "brands": product.get("brands", "N/A"),
# #                     "quantity": product.get("quantity", "N/A"),
# #                     "serving_size": product.get("serving_size", "N/A"),
# #                     # "nutri_score": product.get("nutriscore_grade", "D").upper(),
# #                     "nutri_score": 'E',
# #                     "eco_score": product.get("ecoscore_grade", "N/A").upper(),
# #                     "green_score": product.get("environment_impact_level_tags", ["N/A"])[0].replace('en:', '').capitalize() 
# #                         if product.get("environment_impact_level_tags") else "N/A",
# #                     "carbon_footprint": product.get("nutriments", {}).get("carbon-footprint_100g", "N/A"),
# #                     "environment_impact": product.get("environment_impact_level_tags", []),
# #                     "ingredients": product.get("ingredients_text_en", "No ingredients information available."),
# #                     "allergens": product.get("allergens_en", "None"),
# #                     "nutritional_values": {
# #                         "energy_kcal": product.get("nutriments", {}).get("energy-kcal_100g", "N/A"),
# #                         "carbohydrates": product.get("nutriments", {}).get("carbohydrates_100g", "N/A"),
# #                         "fat": product.get("nutriments", {}).get("fat_100g", "N/A"),
# #                         "saturated_fat": product.get("nutriments", {}).get("saturated-fat_100g", "N/A"),
# #                         "proteins": product.get("nutriments", {}).get("proteins_100g", "N/A"),
# #                         "sugars": product.get("nutriments", {}).get("sugars_100g", "N/A"),
# #                         "fiber": product.get("nutriments", {}).get("fiber_100g", "N/A"),
# #                         "salt": product.get("nutriments", {}).get("salt_100g", "N/A"),
# #                     },
# #                     "images": {
# #                         "front_image": product.get("image_url", "No image available"),
# #                     },
# #                 }

# #                 # Add low nutrient information
# #                 product_info["low_nutrient_warnings"] = check_low_nutrients(product_info["nutritional_values"])
# #                 products.append(product_info)
            
# #             return jsonify({"products": products}), 200
# #         else:
# #             return jsonify({"error": "No products found for the given name"}), 404
# #     else:
# #         return jsonify({"error": f"Error fetching product data. Status code: {response.status_code}"}), 500

# def check_low_nutrients(nutrients):
#     """ Check and return low nutritional warnings """
#     low_fat_threshold = 3  
#     low_sugar_threshold = 5  
#     low_salt_threshold = 0.5  

#     warnings = []
#     if isinstance(nutrients.get("fat", 0), (int, float)) and nutrients["fat"] <= low_fat_threshold:
#         warnings.append("Low fat content (<= 3g per 100g).")
#     if isinstance(nutrients.get("sugars", 0), (int, float)) and nutrients["sugars"] <= low_sugar_threshold:
#         warnings.append("Low sugar content (<= 5g per 100g).")
#     if isinstance(nutrients.get("salt", 0), (int, float)) and nutrients["salt"] <= low_salt_threshold:
#         warnings.append("Low salt content (<= 0.5g per 100g).")
#     return warnings

# if __name__ == "__main__":
#     app.run(debug=True)



from flask import Flask, jsonify, request
from flask_cors import CORS
import csv

app = Flask(__name__)
CORS(app)

def load_products_from_csv(file_path):
    products = []
    with open(file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if "ingredients" in row and row["ingredients"]:
                row["ingredients"] = [ingredient.strip() for ingredient in row["ingredients"].split(",")]
            products.append(row)
    return products

products_dataset = load_products_from_csv("preprocessed_dataset.csv")
print(f"Loaded {len(products_dataset)} products")
print(f"First product sample: {products_dataset[0] if products_dataset else 'No products loaded'}")
print(f"Available columns: {list(products_dataset[0].keys()) if products_dataset else []}")

@app.route('/api/products', methods=['GET'])  # ✅ FIXED: Removed <name>
def search_products():
    query = request.args.get("name", "").lower().strip()  # ✅ Using query param
    print(f"Searching for: '{query}'")

    if not query:
        return jsonify({"products": []})
    
    matched_products = [
        product for product in products_dataset
        if query in product.get("name", "").lower()
    ]
    
    print(f"Found {len(matched_products)} matching products")
    
    for product in matched_products:
        if "name" in product and "product_name" not in product:
            product["product_name"] = product["name"]

    return jsonify({"products": matched_products})

if __name__ == "__main__":
    app.run(debug=True)
