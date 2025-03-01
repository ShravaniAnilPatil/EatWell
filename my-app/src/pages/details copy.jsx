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
} from "@mui/material"
import MicIcon from "@mui/icons-material/Mic"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../styles/details.css"
import ingredientsIcon from "../images/ingredients.png"
import allergyIcon from "../images/allergy.png"

const ProductScan = () => {
  const [productName, setProductName] = useState("")
  const [confirmedProductName, setConfirmedProductName] = useState("")
  const [productData, setProductData] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [mode, setMode] = useState("scan")
  const [alternatives, setAlternatives] = useState([])
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
      greenScore: {
        A: { color: "#00429d", backgroundColor: "#93c5fd" },
        B: { color: "#4771b2", backgroundColor: "#bfdbfe" },
        C: { color: "#73a2c6", backgroundColor: "#dbeafe" },
        D: { color: "#a5c8ca", backgroundColor: "#e0f2fe" },
        E: { color: "#d8e7eb", backgroundColor: "#f0f9ff" },
      },
      carbonFootprint: {
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
    if (!productData || !productData.nutriments) return null

    const significantNutrients = Object.entries(productData.nutriments)
      .filter(([_, value]) => Number.parseFloat(value) > 0.1)
      .sort(([_, a], [__, b]) => Number.parseFloat(b) - Number.parseFloat(a))
      .slice(0, 10)

    const labels = significantNutrients.map(([key, _]) => key)
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

  const ecoGrade = productData?.ecoscore_grade?.toUpperCase() || "N/A"
  const greenGrade = productData?.greenscore_grade?.toUpperCase() || "N/A"
  const carbonGrade = productData?.carbon_footprint_grade?.toUpperCase() || "N/A"
  const nutriGrade = productData?.nutriscore_grade?.toUpperCase() || "N/A"

  const ecoStyle = getStyle("ecoScore", ecoGrade)
  const greenStyle = getStyle("greenScore", greenGrade)
  const carbonStyle = getStyle("carbonFootprint", carbonGrade)

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
            <MicIcon />
          </IconButton>
        </Grid>
        <Grid item>
          <Link to="/imgscan">
            <Button>Scan</Button>
          </Link>
        </Grid>
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
              <ScoreCard title="Eco-Score" grade={ecoGrade} style={ecoStyle} />
              <ScoreCard title="Green Score" grade={greenGrade} style={greenStyle} />
              <ScoreCard title="Carbon Footprint" grade={carbonGrade} style={carbonStyle} />
            </div>
          </Grid>

          <Grid
            item
            xs={12}
            md={6}
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "40px",
              backgroundColor: "#f5f5f5",
              padding: "20px",
            }}
          >
            <Card style={{ padding: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Typography
                  variant="h6"
                  align="left"
                  style={{
                    color: "black",
                    fontWeight: "bold",
                    marginRight: "8px",
                    marginBottom: "1rem",
                    fontSize: "1.5rem",
                  }}
                >
                  Ingredients{" "}
                </Typography>
                <img
                  src={ingredientsIcon || "/placeholder.svg"}
                  alt="ingredients"
                  style={{ width: "70px", height: "50px", marginBottom: "1rem", alignSelf: "flex-start" }}
                  onError={(e) => {
                    console.error("Error loading ingredients image:", e)
                    e.target.src = "/placeholder.svg?height=50&width=70"
                  }}
                />
              </div>
              <Typography align="left" marginBottom={3}>
                {productData.ingredients_text_en || "No ingredients information available."}
              </Typography>
            </Card>
            <Card style={{ padding: "20px", marginTop: "10px" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Typography
                  align="left"
                  variant="h6"
                  style={{ color: "black", fontWeight: "bold", marginRight: "8px", fontSize: "1.5rem" }}
                >
                  Allergens
                </Typography>
                <img
                  src={allergyIcon || "/placeholder.svg"}
                  alt="allergens"
                  style={{ width: "70px", height: "70px", marginBottom: "1rem", alignSelf: "flex-start" }}
                  onError={(e) => {
                    console.error("Error loading allergy image:", e)
                    e.target.src = "/placeholder.svg?height=70&width=70"
                  }}
                />
              </div>
              <Typography align="left" marginBottom={2}>
                {productData.allergens || "N/A"}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card style={{ padding: "20px" }}>
              <Typography
                variant="h6"
                align="left"
                style={{
                  color: "black",
                  fontWeight: "bold",
                  marginRight: "8px",
                  marginBottom: "1rem",
                  fontSize: "1.5rem",
                }}
              >
                Nutrient Levels
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(productData.nutrient_levels || {}).map(([key, value]) => (
                  <Grid item xs={6} md={3} key={key}>
                    <Typography align="left">
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
            <Card style={{ padding: "20px" }}>
              <Typography align="left" variant="h6" style={{ marginBottom: "1rem" }}>
                Nutritional Quality
              </Typography>
              <Typography align="left">{getNutriScoreMessage(nutriGrade)}</Typography>
            </Card>
          </Grid>
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

