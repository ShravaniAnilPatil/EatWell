import React, { useState, useEffect } from 'react';
import { useAuth } from "../context/AuthContext";
import '../styles/RecommendationComponent.css';
import { useLocation } from 'react-router-dom';

const RecommendationComponent = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const productName = location.state?.productName || "Unknown";
  console.log("Received product:", productName);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/user/profile/${user}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to fetch profile');
        setProfile(data.data);
      } catch (err) {
        setError(err.message);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  // Fetch recommendations once profile is loaded
  useEffect(() => {
    const getRecommendations = async () => {
      if (!productName || !profile) return;

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

    getRecommendations();
  }, [profile, productName]);

  return (
    <div className="recommendation-container">
      <h2 className="recommendation-title">Healthier Alternatives</h2>
      <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2f524d' }}>Product: {productName}</p>

      {loading && <p>Loading recommendations...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {recommendations.length > 0 && (
        <div className="card-container">
          {recommendations.map((product, index) => (
            <div className="card" key={index}>
              <h3 className="card-title" style={{ fontWeight: 'bold' }}>{product.name}</h3>
              <p style={{ fontSize: '1.2rem' }}>Category: {product.category}</p>
              <p style={{ fontSize: '1.2rem' }}>Health Class: {product.health_class}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationComponent;
