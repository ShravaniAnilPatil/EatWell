import React, { useRef, useState, useEffect } from "react"
import axios from "axios"
import Webcam from "react-webcam"
import { Bar } from "react-chartjs-2"
import "chart.js/auto"
import {
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  IconButton,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Chip,
  Fade,
  Zoom,
} from "@mui/material"
import { Mic } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../styles/details.css"
import NutritionalQualityCard from "../components/NutritionalQualityCard"

const ProductScan = () => {
  const [productName, setProductName] = useState("")
  const [confirmedProductName, setConfirmedProductName] = useState("")
  const [productData, setProductData] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [mode, setMode] = useState("scan")
  const { user } = useAuth()
  const [userData, setUserData] = useState(null)
  const webcamRef = useRef(null)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [openSpeechDialog, setOpenSpeechDialog] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/user/profile/${user}`)
      if (!response.ok) {
        throw new Error("User not found")
      }
      const data = await response.json()
      setUserData(data)
    } catch (error) {
      setError(error.message)
    }
  }

  const resetScan = () => {
    setProductName("")
    setConfirmedProductName("")
    setProductData(null)
    setError("")
    setImagePreview(null)
    setIsCameraOn(false)
  }

  const fetchProductData = async () => {
    if (!confirmedProductName.trim()) {
      setError("Please confirm the product name before searching.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/product", {
        params: { name: confirmedProductName },
      })
      setProductData(response.data.products[0])
      setImagePreview(null) // Automatically close image preview
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong!")
      setProductData(null)
    } finally {
      setLoading(false)
    }
  }

  const capture = async () => {
    if (mode === "scan" && webcamRef.current && isCameraOn) {
      const imageSrc = webcamRef.current.getScreenshot()
      setImagePreview(imageSrc)
      await processImage(imageSrc)
    }
  }

  const uploadImage = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const imageSrc = reader.result
        setImagePreview(imageSrc)
        await processImage(imageSrc)
      }
      reader.readAsDataURL(file)
    }
  }

  const processImage = async (imageSrc) => {
    const byteString = atob(imageSrc.split(",")[1])
    const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0]
    const arrayBuffer = new ArrayBuffer(byteString.length)
    const uintArray = new Uint8Array(arrayBuffer)

    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i)
    }

    const blob = new Blob([arrayBuffer], { type: mimeString })
    const formData = new FormData()
    formData.append("image", blob, "image.jpeg")

    try {
      const response = await axios.post("http://127.0.0.1:5500/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      if (response.data.extracted_text) {
        setProductName(response.data.extracted_text)
        setConfirmedProductName("")
      } else {
        alert("Failed to extract text from the image.")
      }
    } catch (error) {
      alert("Error occurred during image processing.")
    }
  }

  const startVoiceRecognition = async () => {
    setOpenSpeechDialog(true)
  }

  const handleSpeechRecognition = async () => {
    setLoading(true)
    setOpenSpeechDialog(false)
    try {
      const response = await axios.post("http://127.0.0.1:5002/speech-to-text")
      if (response.data.text) {
        setProductName(response.data.text)
        setConfirmedProductName("")
      } else {
        setError("Speech recognition failed. Please try again.")
      }
    } catch (error) {
      setError("Error during speech recognition.")
    } finally {
      setLoading(false)
    }
  }

  const getStyle = (scoreType, grade) => {
    const styles = {
      ecoScore: {
        A: { color: "#1a9641", backgroundColor: "#b8e186" },
        B: { color: "#55a867", backgroundColor: "#ddecb8" },
        C: { color: "#a6d96a", backgroundColor: "#f1faee" },
        D: { color: "#fdae61", backgroundColor: "#fee08b" },
        E: { color: "#d7191c", backgroundColor: "#fdae61" },
      },
      nutriScore: {
        A: { color: "#006837", backgroundColor: "#a6d96a" },
        B: { color: "#1a9850", backgroundColor: "#d9ef8b" },
        C: { color: "#66bd63", backgroundColor: "#fee08b" },
        D: { color: "#fdae61", backgroundColor: "#fdae61" },
        E: { color: "#d73027", backgroundColor: "#f46d43" },
      },
    }

    if (grade === "N/A") {
      return { color: "#767676", backgroundColor: "#e0e0e0" }
    }

    return styles[scoreType][grade] || { color: "#767676", backgroundColor: "#e0e0e0" }
  }

  const renderNutrientChart = () => {
    if (!productData || !productData.nutritional_values) return null

    const significantNutrients = Object.entries(productData.nutritional_values)
      .filter(([_, value]) => Number.parseFloat(value) > 0.1)
      .sort(([_, a], [__, b]) => Number.parseFloat(b) - Number.parseFloat(a))
      .slice(0, 10)

    const labels = significantNutrients.map(([key, _]) => key.replace(/_/g, " "))
    const values = significantNutrients.map(([_, value]) => value)

    const data = {
      labels,
      datasets: [
        {
          label: "Nutrients per 100g",
          data: values,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    }

    const options = {
      indexAxis: "y",
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Top 10 Nutrients",
        },
      },
    }

    return <Bar data={data} options={options} />
  }

  const getNutriScoreMessage = (grade) => {
    switch (grade) {
      case "A":
        return "This product has an excellent nutritional quality. Enjoy without hesitation!"
      case "B":
      case "C":
        return "This product has a good nutritional quality. Consume in moderation as part of a balanced diet."
      case "D":
      case "E":
        return "This product has a poor nutritional quality. It's advisable to limit its consumption and look for healthier alternatives."
      default:
        return "Nutritional information is not available for this product."
    }
  }

  const ScoreCard = ({ title, grade, style }) => (
    <Card
      style={{
        padding: "20px",
        marginBottom: "20px",
        backgroundColor: style.backgroundColor,
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)"
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)"
        e.currentTarget.style.boxShadow = "none"
      }}
    >
      <Typography variant="h6" style={{ color: style.color, fontWeight: "bold", marginBottom: "8px" }}>
        {title}
      </Typography>
      <Typography variant="h3" style={{ color: style.color, fontWeight: "bold" }}>
        {grade}
      </Typography>
    </Card>
  )

  return (
    <Paper elevation={3} style={{ padding: "20px", margin: "20px" }}>
      <Typography variant="h4" gutterBottom align="center" color="#2f524d" fontWeight={600}>
        Product Analysis
      </Typography>

      <Grid container spacing={3} justifyContent="center" style={{ marginBottom: "20px" }}>
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
            <Button variant="contained" color="secondary" onClick={() => setConfirmedProductName("")}>
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
            {loading ? <CircularProgress size={24} /> : "Search"}
          </Button>
        </Grid>
        <Grid item>
          <IconButton onClick={startVoiceRecognition} color="primary">
            <Mic />
          </IconButton>
        </Grid>
        {/* <Grid item>
          <Link to="/imgscan">
            <Button>Scan</Button>
          </Link>
        </Grid> */}
      </Grid>

      <div className="container1">
        <div className="button-group">
          <button
            className={`button ${mode === "scan" ? "active" : ""}`}
            onClick={() => {
              setMode("scan")
              setIsCameraOn(!isCameraOn)
            }}
          >
            {isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
          </button>
          <button className={`button ${mode === "upload" ? "active" : ""}`} onClick={() => setMode("upload")}>
            Upload Image
          </button>
        </div>

        {mode === "scan" && isCameraOn && (
          <div className="webcam-container">
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="webcam" />
            <button onClick={capture} className="button capture-button">
              Capture Image
            </button>
          </div>
        )}

        {mode === "upload" && (
          <div className="upload-container">
            <input type="file" accept="image/*" onChange={uploadImage} />
          </div>
        )}

        {imagePreview && (
          <div className="preview-container">
            <h2>Image Preview:</h2>
            <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="image-preview" />
            <Button variant="outlined" color="secondary" onClick={resetScan}>
              Remove Image
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Typography color="error" align="center">
          {error}
        </Typography>
      )}

      {productData && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography align="left" variant="h5" marginTop={6}>
              <strong>Product:</strong> {productData.product_name || "N/A"}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <div style={{ display: "flex", flexDirection: "column", justifyItems: "space-between" }}>
              <ScoreCard
                title="Eco-Score"
                grade={productData.eco_score}
                style={getStyle("ecoScore", productData.eco_score)}
              />
              <ScoreCard
                title="Nutri-Score"
                grade={productData.nutri_score}
                style={getStyle("nutriScore", productData.nutri_score)}
              />
            </div>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card style={{ padding: "20px", height: "100%" }}>
              <Typography variant="h6" gutterBottom>
                Ingredients
              </Typography>
              <Typography variant="body1" style={{ whiteSpace: "pre-wrap" }}>
                {productData.ingredients || "No ingredients information available."}
              </Typography>
            </Card>
          </Grid>

          {/* <Grid item xs={12}>
            <Card style={{ padding: "20px" }}>
              <Typography variant="h6" gutterBottom>
                Allergens
              </Typography>
              {productData.allergens ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {productData.allergens.split(",").map((allergen, index) => (
                    <Chip key={index} label={allergen.trim()} color="primary" variant="outlined" />
                  ))}
                </div>
              ) : (
                <Typography>No allergen information available.</Typography>
              )}
            </Card>
          </Grid> */}

          <Grid item xs={12}>
            <Card style={{ padding: "20px" }}>
              <Typography variant="h6" gutterBottom>
                Nutrient Levels
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(productData.nutritional_values || {}).map(([key, value]) => (
                  <Grid item xs={6} md={3} key={key}>
                    <Typography>
                      <strong>{key.replace(/_/g, " ")}:</strong> {value || "N/A"}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card style={{ padding: "20px" }}>
              <Typography align="left" variant="h6" style={{ marginBottom: "1rem" }}>
                Nutrient Analysis
              </Typography>
              {renderNutrientChart()}
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Fade in={true} timeout={1000}>
              <div>
                <NutritionalQualityCard nutriScore={productData.nutri_score} getMessage={getNutriScoreMessage} />
              </div>
            </Fade>
          </Grid>

          {productData.low_nutrient_warnings && productData.low_nutrient_warnings.length > 0 && (
            <Grid item xs={12}>
              <Card style={{ padding: "20px" }}>
                <Typography align="left" variant="h6" style={{ marginBottom: "1rem" }}>
                  Low Nutrient Warnings
                </Typography>
                <List>
                  {productData.low_nutrient_warnings.map((warning, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={warning} />
                    </ListItem>
                  ))}
                </List>
              </Card>
            </Grid>
          )}

          {productData.carbon_footprint && productData.carbon_footprint !== "N/A" && (
            <Grid item xs={12}>
              <Card style={{ padding: "20px" }}>
                <Typography align="left" variant="h6" style={{ marginBottom: "1rem" }}>
                  Carbon Footprint
                </Typography>
                <Typography align="left">{productData.carbon_footprint} g CO2 eq/100g</Typography>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      <Dialog open={openSpeechDialog} onClose={() => setOpenSpeechDialog(false)}>
        <DialogTitle>Speech Recognition</DialogTitle>
        <DialogContent>
          <DialogContentText>Click 'Start' when you're ready to speak. Say the product name clearly.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSpeechDialog(false)}>Cancel</Button>
          <Button onClick={handleSpeechRecognition} color="primary">
            Start
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default ProductScan

