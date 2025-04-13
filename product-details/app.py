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
    app.run(debug=True,port=5010)
