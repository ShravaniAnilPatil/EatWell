export async function fetchProteinContent(productName) {
    const apiUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(productName)}&search_simple=1&action=process&json=1`;
  
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
  
      if (data.products && data.products.length > 0) {
        const product = data.products[0];
        return product.nutriments?.proteins_100g || 0;
      }
  
      return 0;
    } catch (error) {
      console.error("Error fetching protein content:", error);
      return 0;
    }
  }
  