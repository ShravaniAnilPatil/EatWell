import React, { useState, useEffect } from 'react';
import { useAuth } from "../context/AuthContext";
import '../styles/RecommendationComponent.css';

const RecommendationComponent = () => {
  const [productName, setProductName] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/user/profile/${user?.email}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Unable to fetch profile');
        }
        setProfile(data.data);
      } catch (err) {
        setError(err.message);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const getRecommendations = async () => {
    if (!productName.trim()) {
      setError('Please enter a product name.');
      return;
    }

    setError('');
    setLoading(true);
    setRecommendations([]);

    try {
      const response = await fetch('http://localhost:5000/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: productName,
          allergens: profile?.allergies?.split(',').map(d => d.trim()) || [],
          diseases: profile?.diseases?.split(',').map(d => d.trim()) || [],
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');
      setRecommendations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommendation-container">
      <h2 className="recommendation-title">Product Recommendations</h2>

      <div className="form-group">
        <label >Product Name:</label>
        <input
          type="text"
          placeholder="e.g., Milka - 156g"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
      </div>

      <button onClick={getRecommendations} className="submit-button">
        {loading ? "Generating..." : "Get Recommendations"}
      </button>

      

      {recommendations.length > 0 && (
        <div className="card-container">
          {recommendations.map((product, index) => (
            <div className="card" key={index}>
              <h3 className="card-title" style={{ fontWeight: 'bold' }}>{product.name}</h3>
              <p style={{fontSize: '1.2rem'}}>Category: {product.category}</p>
              <p style={{fontSize: '1.2rem'}}>Health Class:{product.health_class}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationComponent;
