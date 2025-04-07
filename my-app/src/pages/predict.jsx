
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const makePrediction = async (inputData, modelName = 'lightgbm') => {
  try {
    const response = await axios.post('http://localhost:5005/api/predict', {
      ...inputData,
      model_name: modelName
    });
    return response.data;
  } catch (error) {
    console.error("Error making prediction:", error);
    throw error;
  }
};

const PredictForm = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
      Protein: 0,
      Fat: 0,
      Sodium: 0,
      Carbohydrates: 0,
      Fiber: 0,
      Sugar: 0
    });
    const [modelName, setModelName] = useState('lightgbm');
    const [results, setResults] = useState(null);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    };
  
    const handleModelChange = (e) => {
      setModelName(e.target.value);
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setResults(null);
  
      try {
        const result = await makePrediction(formData, modelName);
        setResults({
          inputData: formData,
          modelName,
          prediction: result.prediction,
          probabilities: result.probabilities
        });
      } catch (err) {
        setError('Error making prediction. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    const getProbClass = (probability) => {
      if (probability > 0.7) return 'bg-success';
      if (probability > 0.4) return 'bg-warning';
      return 'bg-danger';
    };
  
    return (
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">Food Nutritional Information</h2>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Select Model</label>
                  <select 
                    className="form-select" 
                    value={modelName} 
                    onChange={handleModelChange}
                  >
                    <option value="lightgbm">LightGBM</option>
                    <option value="xgboost">XGBoost</option>
                  </select>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Protein (g)</label>
                    <input type="number" step="0.1" className="form-control" name="Protein" value={formData.Protein} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Carbohydrates (g)</label>
                    <input type="number" step="0.1" className="form-control" name="Carbohydrates" value={formData.Carbohydrates} onChange={handleChange} />
                  </div>
                </div>
  
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Fat (g)</label>
                    <input type="number" step="0.1" className="form-control" name="Fat" value={formData.Fat} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Sugar (g)</label>
                    <input type="number" step="0.1" className="form-control" name="Sugar" value={formData.Sugar} onChange={handleChange} />
                  </div>
                </div>
  
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Fiber (g)</label>
                    <input type="number" step="0.1" className="form-control" name="Fiber" value={formData.Fiber} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Sodium (mg)</label>
                    <input type="number" step="0.1" className="form-control" name="Sodium" value={formData.Sodium} onChange={handleChange} />
                  </div>
                </div>
  
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading ? 'Processing...' : 'Get Health Classification'}
                  </button>
                </div>
              </form>
            </div>
          </div>
  
          {results && (
            <div className="card">
              <div className="card-header bg-success text-white">
                <h3 className="mb-0">Prediction Results</h3>
              </div>
              <div className="card-body">
                <div className="alert alert-info">
                  <h4>Predicted Class: <strong>{results.prediction}</strong></h4>
                  <p>Using {results.modelName.toUpperCase()} model</p>
                </div>
  
                <h5>Class Probabilities</h5>
                {Object.entries(results.probabilities).map(([className, prob]) => (
                  <div key={className} className="mb-2">
                    <div className="d-flex justify-content-between">
                      <span>{className}</span>
                      <span>{(prob * 100).toFixed(2)}%</span>
                    </div>
                    <div className="progress">
                      <div className={`progress-bar ${getProbClass(prob)}`} style={{ width: `${prob * 100}%` }}></div>
                    </div>
                  </div>
                ))}
  
                <h5 className="mt-4">Input Summary</h5>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(results.inputData).map(([feature, value]) => (
                      <tr key={feature}>
                        <td>{feature}</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
  
                <div className="d-flex justify-content-end">
                  <button onClick={() => window.print()} className="btn btn-outline-primary">
                    Print Results
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default PredictForm;