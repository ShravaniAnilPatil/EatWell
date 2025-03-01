import React, { useRef, useState } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import {
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  IconButton,
  Card,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import '../styles/details.css';
import ingredients from '../images/ingredients.png';
import allergy from '../images/allergy.png';

const ProductScan = () => {
  const [productName, setProductName] = useState('');
  const [confirmedProductName, setConfirmedProductName] = useState('');
  const [productData, setProductData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [mode, setMode] = useState('scan');
  const webcamRef = useRef(null);

  const resetScan = () => {
    setProductName('');
    setConfirmedProductName('');
    setProductData(null);
    setError('');
    setImagePreview(null);
  };

  const fetchProductData = async () => {
    if (!confirmedProductName.trim()) {
      setError('Please confirm the product name before searching.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/product', {
        params: { name: confirmedProductName },
      });
      setProductData(response.data.products[0]);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong!');
      setProductData(null);
    } finally {
      setLoading(false);
    }
  };

  const capture = async () => {
    if (mode === 'scan' && webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImagePreview(imageSrc);
      await processImage(imageSrc);
    }
  };

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageSrc = reader.result;
        setImagePreview(imageSrc);
        await processImage(imageSrc);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageSrc) => {
    const byteString = atob(imageSrc.split(',')[1]);
    const mimeString = imageSrc.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([arrayBuffer], { type: mimeString });
    const formData = new FormData();
    formData.append('image', blob, 'image.jpeg');

    try {
      const response = await axios.post('http://127.0.0.1:5500/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.extracted_text) {
        setProductName(response.data.extracted_text);
        setConfirmedProductName('');
      } else {
        alert('Failed to extract text from the image.');
      }
    } catch (error) {
      alert('Error occurred during image processing.');
    }
  };

  const startVoiceRecognition = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:5002/speech-to-text');
      if (response.data.text) {
        setProductName(response.data.text);
        setConfirmedProductName('');
      } else {
        setError('Speech recognition failed. Please try again.');
      }
    } catch (error) {
      setError('Error during speech recognition.');
    } finally {
      setLoading(false);
    }
  };

  const renderNutrientChart = () => {
    if (!productData || !productData.nutriments) return null;

    const labels = Object.keys(productData.nutriments || {});
    const values = Object.values(productData.nutriments || {});

    const data = {
      labels,
      datasets: [
        {
          label: 'Nutrients per 100g',
          data: values,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };

    return <Bar data={data} />;
  };

  return (
    <Paper elevation={3} style={{ padding: '20px', margin: '20px' }}>
      <Typography variant="h4" align="center" color="#2f524d" fontWeight={600}>
        Product Analysis
      </Typography>

      <Grid container spacing={3} justifyContent="center" style={{ marginBottom: '20px' }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Enter product name"
            variant="outlined"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            disabled={Boolean(confirmedProductName)}
          />
        </Grid>
        <Grid item>
          {!confirmedProductName ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setConfirmedProductName(productName)}
              disabled={!productName.trim()}
            >
              Confirm Name
            </Button>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setConfirmedProductName('')}
            >
              Edit Name
            </Button>
          )}
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchProductData}
            disabled={!confirmedProductName || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Search'}
          </Button>
        </Grid>
        <Grid item>
          <IconButton onClick={startVoiceRecognition} color="primary">
            <MicIcon />
          </IconButton>
        </Grid>
        <Grid item>
          <div className="container1">
            <div className="button-group">
              <button
                className={`button ${mode === 'scan' ? 'active' : ''}`}
                onClick={() => setMode('scan')}
              >
                Scan Image
              </button>
              <button
                className={`button ${mode === 'upload' ? 'active' : ''}`}
                onClick={() => setMode('upload')}
              >
                Upload Image
              </button>
            </div>

            {mode === 'scan' && (
              <div className="webcam-container">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="webcam"
                />
                <button onClick={capture} className="button capture-button">
                  Capture Image
                </button>
              </div>
            )}

            {mode === 'upload' && (
              <div className="upload-container">
                <input type="file" accept="image/*" onChange={uploadImage} />
              </div>
            )}

            {imagePreview && (
              <div className="preview-container">
                <h2>Image Preview:</h2>
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <Button variant="outlined" color="secondary" onClick={resetScan}>
                  Remove Image
                </Button>
              </div>
            )}
          </div>
        </Grid>
      </Grid>

      {error && (
        <Typography color="error" align="center">
          {error}
        </Typography>
      )}

      {productData && confirmedProductName && (
        <div>
          <Typography align="left" variant="h5" marginTop={6}>
            <strong>Product:</strong> {productData.product_name || 'N/A'}
          </Typography>
          <Card style={{ padding: '20px', margin: '20px 0' }}>
            <Typography variant="h6">Nutrient Analysis</Typography>
            {renderNutrientChart()}
          </Card>
        </div>
      )}
    </Paper>
  );
};

export default ProductScan;
