import React, { useState } from "react";

const AlternativeProducts = () => {
    const [productName, setProductName] = useState("");
    const [alternatives, setAlternatives] = useState([]);
    const [error, setError] = useState("");

    const fetchAlternatives = async () => {
        if (!productName) {
            setError("Please enter a product name.");
            return;
        }
        
        setError("");  // Clear previous errors
        setAlternatives([]);  // Clear previous results

        try {
            const response = await fetch(`http://127.0.0.1:5002/recommend?product_name=${encodeURIComponent(productName)}`);
            console.log("sent")
            const data = await response.json();
            console.log(data)
            if (!response.ok) {
                setError(data.error || "Something went wrong.");
            } else {
                setAlternatives(data.healthier_alternatives || data.alternative || []);
            }
        } catch (err) {
            setError("Failed to fetch data. Check API or network connection.");
        }
    };

    return (
        <div style={{ textAlign: "center", maxWidth: "400px", margin: "auto", padding: "20px" }}>
            <h2>Find Healthier Alternatives</h2>
            <input
                type="text"
                placeholder="Enter product name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                style={{ padding: "10px", width: "100%", marginBottom: "10px" }}
            />
            <button onClick={fetchAlternatives} style={{ padding: "10px 15px", cursor: "pointer" }}>
                Search
            </button>

            {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

            {alternatives.length > 0 && (
                <div style={{ marginTop: "20px", textAlign: "left" }}>
                    <h3>Alternatives:</h3>
                    <ul>
                        {alternatives.map((product, index) => (
                            <li key={index}>
                                <strong>{product.name}</strong> - Score: {product.health_score.toFixed(2)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AlternativeProducts;
