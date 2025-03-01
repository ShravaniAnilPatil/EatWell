import React, { useState, useEffect } from "react";
import "./Classification.css";

const ProductClassification = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [productInfo, setProductInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/products.json")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading products:", error);
        setLoading(false);
      });
  }, []);

  const calculateNutriScore = (product) => {
    let negativeScore = 0;
    let positiveScore = 0;

    // Much Looser Negative Points
    negativeScore += product.Energy > 6000 ? 10 : Math.floor(product.Energy / 600);
    negativeScore += product.Sugar > 80 ? 10 : Math.floor(product.Sugar / 8);
    negativeScore += product.Fat > 20 ? 10 : Math.floor(product.Fat / 2);
    negativeScore += product.Sodium > 2000 ? 10 : Math.floor(product.Sodium / 200);

    // Even More Generous Positive Points
    positiveScore += product.Protein > 5 ? 10 : Math.floor(product.Protein / 0.5);
    positiveScore += product.Fiber > 4 ? 10 : Math.floor(product.Fiber / 0.4);
    positiveScore += product.Fruits >= 70 ? 10 : product.Fruits >= 50 ? 7 : product.Fruits >= 30 ? 5 : 0;

    const finalScore = negativeScore - positiveScore;

    if (finalScore <= 2) return "A";
    if (finalScore >= 3 && finalScore <= 8) return "B";
    if (finalScore >= 9 && finalScore <= 15) return "C";
    if (finalScore >= 16 && finalScore <= 22) return "D";
    return "E";
  };

  const classifyProduct = (nutriScore) => {
    if (nutriScore === "A" || nutriScore === "B" ) return "Beneficial";
    if (nutriScore === "C" || nutriScore === "D" ) return "Neutral";
    return "Harmful";
  };

  const handleSearch = () => {
    if (!searchTerm) return;
    const product = products.find((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (product) {
      const nutriScore = calculateNutriScore(product);
      setProductInfo({ ...product, nutriScore, classification: classifyProduct(nutriScore) });
    } else {
      setProductInfo(null);
    }
  };

  return (
    <div className="classification-container">
      <h1>Product Classification</h1>
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter product name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      
      {loading && <p>Loading products...</p>}
      
      {productInfo ? (
        <div className={`product-info ${productInfo.classification.toLowerCase()}`}>
          <h2>{productInfo.name}</h2>
          <p>Category: {productInfo.category}</p>
          <p>Energy: {productInfo.Energy} kJ</p>
          <p>Protein: {productInfo.Protein}g</p>
          <p>Carbohydrates: {productInfo.Carbohydrates}g</p>
          <p>Sugar: {productInfo.Sugar}g</p>
          <p>Fat: {productInfo.Fat}g</p>
          <p>Sodium: {productInfo.Sodium}mg</p>
          <p>Fiber: {productInfo.Fiber}g</p>
          <p>Fruits/Veggies: {productInfo.Fruits}%</p>
          <p>Nutri-Score: {productInfo.nutriScore}</p>
          <p className="classification">Classification: {productInfo.classification}</p>
        </div>
      ) : (
        <p>No product found.</p>
      )}
    </div>
  );
};

export default ProductClassification;
