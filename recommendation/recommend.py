import requests

SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl"


def fetch_product_details(product_name):
    """
    Fetch product details by its name.
    """
    try:
        response = requests.get(
            f"https://world.openfoodfacts.org/cgi/search.pl?search_terms={product_name}&search_simple=1&action=process&json=1"
        )
        if response.status_code == 200:
            data = response.json()
            if data.get("products"):
                return data["products"]
            else:
                print("Product not found.")
                return None
    except requests.RequestException as e:
        print(f"Error fetching product details: {e}")
        return None


def search_alternatives(category, allergens, min_nutri_score, max_carbon_footprint):
    """
    Search for alternatives in the same category, excluding allergens and
    sorting by nutri-score and carbon footprint.
    """
    params = {
        "action": "process",
        "tagtype_0": "categories",
        "tag_contains_0": "contains",
        "tag_0": category,
        "json": 1,
        "page_size": 50,
    }
    try:
        response = requests.get(SEARCH_URL, params=params)
        response.raise_for_status()
        products = response.json().get("products", [])
        
        alternatives = []
        for product in products:
            if category in product.get("categories_tags", []):  # Check for matching category
                try:
                    nutri_score = product.get("nutriscore_score", 100)
                    carbon_footprint = product.get("ecoscore_data", {}).get("agribalyse", {}).get("co2_total", float("inf"))
                    product_allergens = product.get("allergens_tags", [])

                    # if not set(allergens).intersection(set(product_allergens)):
                    if nutri_score >= min_nutri_score or carbon_footprint < max_carbon_footprint:
                            alternatives.append({
                                "product_name": product.get("product_name", "Unknown"),
                                "nutri_score": nutri_score,
                                "carbon_footprint": carbon_footprint,
                                "url": product.get("url", "Unknown"),
                            })
                except Exception as e:
                    print(f"Error processing product: {e}")
        
        # Sort alternatives by nutri-score, then carbon footprint
        alternatives.sort(key=lambda x: (-x["nutri_score"], x["carbon_footprint"]))
        return alternatives
    except requests.RequestException as e:
        print(f"Error fetching alternatives: {e}")
        return []


def display_recommendations(alternatives):
    """
    Display the list of alternative products.
    """
    if not alternatives:
        print("No alternatives found.")
        return

    print("\nRecommended Alternatives (Prioritized by Nutri-Score):")
    for i, alt in enumerate(alternatives, start=1):
        print(f"{i}. {alt['product_name']}")
        print(f"   Nutri-Score: {alt['nutri_score']}")
        print(f"   Carbon Footprint: {alt['carbon_footprint']} kg CO2")
        # print(f"   Packaging: {', '.join(alt['packaging']) if alt['packaging'] else 'N/A'}")
        packaging = alt.get('packaging', 'N/A')
        print(f"   Packaging: {', '.join(packaging) if isinstance(packaging, list) else packaging}")
        # print(f"   Allergens: {', '.join(alt['allergens']) if alt['allergens'] else 'None'}")
        allergens = alt.get('allergens', 'None')  # Default to 'None' if allergens key is missing
        print(f"   Allergens: {', '.join(allergens) if isinstance(allergens, list) else allergens}")

        print(f"   More Info: {alt['url']}\n")


def main():
    """
    Main function to execute the recommendation process.
    """
    product_name = "amul butter"
    product = fetch_product_details(product_name)

    if product:
        product = product[0]
        categories = product.get("categories_tags", [None])
        # specific_categories = [cat for cat in categories if "Pizza" in cat.lower()]
        # category = specific_categories[0] if specific_categories else (categories[-1] if categories else None)
        category = categories[-2] if categories else None
        print("category: ", category)

        allergens = product.get("allergens_tags", [])
        nutri_score = product.get("nutriscore_score", 100)
        carbon_footprint = product.get("ecoscore_data", {}).get("agribalyse", {}).get("co2_total", float("inf"))

        print(f"\nScanned Product: {product.get('product_name', 'Unknown')}")
        print(f"Brand: {product.get('brands', 'N/A')}")
        print(f"Quantity: {product.get('quantity', 'N/A')}")
        print(f"Serving Size: {product.get('serving_size', 'N/A')}")
        print(f"Packaging: {', '.join(product.get('packaging_tags', [])) if product.get('packaging_tags') else 'N/A'}")
        print(f"Allergens: {', '.join(allergens) if allergens else 'None'}")
        print(f"Nutri-Score: {nutri_score}")
        print(f"Carbon Footprint: {carbon_footprint} kg CO2\n")

        if category:
            alternatives = search_alternatives(
                category=category,
                allergens=allergens,
                min_nutri_score=nutri_score,
                max_carbon_footprint=carbon_footprint,
            )
            display_recommendations(alternatives)
        else:
            print("Category information is missing for this product.")
    else:
        print("Failed to retrieve product details.")


if __name__ == "__main__":
    main()
