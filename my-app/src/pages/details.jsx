"use client"

import React, { useRef, useState, useEffect } from "react"
import axios from "axios"
import Webcam from "react-webcam"
import { Bar } from "react-chartjs-2"
import "chart.js/auto"
import "../styles/details.css"
import PredictForm from "../components/predict"
import { Link } from "react-router-dom"
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
  ListItemAvatar,
  Avatar,
  Fade,
  Rating,
  Box,
  Divider,
} from "@mui/material"
import { Mic, User, MessageSquare, Send, Search } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import "../styles/details.css"
import NutritionalQualityCard from "../components/NutritionalQualityCard"
import { color } from "framer-motion"

const ProductScan = () => {
  const [productName, setProductName] = useState("")
  const [scannedText, setScannedText] = useState("")
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
  const [searchAttempted, setSearchAttempted] = useState(false)
  const [processedNutritionalData, setProcessedNutritionalData] = useState(null)

  // Review system state variables
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState("")
  const [openReviewDialog, setOpenReviewDialog] = useState(false)
  const [newReview, setNewReview] = useState({
    text: "",
    rating: 0,
    username: "Anonymous",
  })

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  // Process product data when it changes
  useEffect(() => {
    if (productData) {
      processProductData(productData)
    }
  }, [productData])

  // Function to process and normalize product data
  const processProductData = (data) => {
    console.log("Processing product data:", data)

    // Create a normalized structure for the nutritional data
    // Based on the dataset structure, these values are directly in the root object
    const processedData = {
      Protein: Number.parseFloat(data.Protein || 0),
      Fat: Number.parseFloat(data.Fat || 0),
      Sodium: Number.parseFloat(data.Sodium || 0),
      Carbohydrates: Number.parseFloat(data.Carbohydrates || 0),
      Fiber: Number.parseFloat(data.Fiber || 0),
      Sugar: Number.parseFloat(data.Sugar || 0),
    }

    console.log("Processed nutritional data:", processedData)
    setProcessedNutritionalData(processedData)
  }

  const fetchUserData = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/user/profile/${user}`)
      if (!response.ok) {
        throw new Error("User not found")
      }
      const data = await response.json()
      setUserData(data)
      if (data?.data?.username) {
        setNewReview((prev) => ({ ...prev, username: data.data.username }))
      }
    } catch (error) {
      setError(error.message)
    }
  }

  const resetScan = () => {
    setProductName("")
    setScannedText("")
    setConfirmedProductName("")
    setProductData(null)
    setProcessedNutritionalData(null)
    setError("")
    setImagePreview(null)
    setIsCameraOn(false)
    setSearchAttempted(false)
  }

  // Function to fetch reviews for a product
  const fetchReviews = async (productName) => {
    if (!productName) return

    setReviewsLoading(true)
    setReviewsError("")

    try {
      const response = await axios.get(`http://localhost:5050/reviews/${encodeURIComponent(productName)}`)
      setReviews(response.data)
    } catch (err) {
      console.error("Error fetching reviews:", err)
      setReviewsError("Failed to load reviews. Please try again later.")
      setReviews([]) // Reset reviews on error
    } finally {
      setReviewsLoading(false)
    }
  }

  // Function to submit a new review
  const handleSubmitReview = async () => {
    if (!newReview.text.trim() || !productData) {
      return
    }

    try {
      const reviewData = {
        username: newReview.username || "Anonymous",
        text: newReview.text,
        product_name: productData.product_name || productData.name,
        review: newReview.rating.toString(), // Convert rating to string for compatibility
        timestamp: new Date().toISOString(),
      }

      await axios.post("http://localhost:5050/messages", reviewData)
      setOpenReviewDialog(false)

      // Reset review form
      setNewReview({
        text: "",
        rating: 0,
        username: userData?.data?.username || "Anonymous",
      })

      // Refresh reviews
      fetchReviews(productData.product_name || productData.name)
    } catch (err) {
      console.error("Error posting review:", err)
      setReviewsError("Failed to post your review. Please try again.")
    }
  }

  // Modified function to search for both scanned text and product name
  const fetchProductData = async () => {
    if (!confirmedProductName.trim() && !scannedText.trim()) {
      setError("Please confirm the product name or scan a product before searching.")
      return
    }

    setLoading(true)
    setError("")
    setSearchAttempted(true)
    setProductData(null)
    setProcessedNutritionalData(null)

    // Try with confirmed product name first
    if (confirmedProductName.trim()) {
      try {
        console.log("Fetching product data for:", confirmedProductName)
        const response = await axios.get("http://127.0.0.1:5010/api/products", {
          params: { name: confirmedProductName },
        })

        if (response.data.products && response.data.products.length > 0) {
          const product = response.data.products[0]
          console.log("Product data received:", product)
          setProductData(product)
          fetchReviews(product.name || product.product_name)
          setLoading(false)
          return
        }
      } catch (err) {
        console.error("Error searching by confirmed name:", err)
      }
    }

    // If confirmed name search failed or wasn't attempted, try with scanned text
    if (scannedText.trim()) {
      try {
        console.log("Fetching product data for scanned text:", scannedText)
        const response = await axios.get("http://127.0.0.1:5010/api/products", {
          params: { name: scannedText },
        })

        if (response.data.products && response.data.products.length > 0) {
          const product = response.data.products[0]
          console.log("Product data received:", product)
          setProductData(product)
          fetchReviews(product.name || product.product_name)
          setLoading(false)
          return
        }
      } catch (err) {
        console.error("Error searching by scanned text:", err)
      }
    }

    // If both searches failed
    setError("Product not found. Please try a different name or scan again.")
    setProductData(null)
    setProcessedNutritionalData(null)
    setLoading(false)
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
        setScannedText(response.data.extracted_text)
        setProductName(response.data.extracted_text) // Also set as product name for user to confirm
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
  const mapNutriScoreToGrade = (score) => {
    const map = {
      1: "A",
      2: "B",
      3: "C",
      4: "D",
      5: "E",
    }
    return map[score?.toString()] || "N/A"
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
    if (!productData) return null

    // Extract nutritional values directly from the product data
    const nutrientEntries = [
      ["Protein", productData.Protein],
      ["Carbohydrates", productData.Carbohydrates],
      ["Sugar", productData.Sugar],
      ["Fat", productData.Fat],
      ["Fiber", productData.Fiber],
      ["Sodium", productData.Sodium],
    ]

    const significantNutrients = nutrientEntries
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
          text: "Top Nutrients",
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
         return "This product has a good nutritional quality. Consume in moderation as part of a balanced diet."
      case "C":
        return "This product has a moderate nutritional quality. Consume in moderation as per need as part of a balanced diet."
      case "D":
         return "This product has a poor nutritional quality. It's advisable to limit its consumption and look for healthier alternatives."
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
        marginBottom: "30px",
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

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <Paper elevation={3} style={{ padding: "20px", margin: "20px", color: "#2f524d" }}>
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
            disabled={(!confirmedProductName && !scannedText) || loading}
            startIcon={<Search />}
          >
            {loading ? <CircularProgress size={24} /> : "Search"}
          </Button>
        </Grid>
        <Grid item>
          <IconButton onClick={startVoiceRecognition} color="primary">
            <Mic />
          </IconButton>
        </Grid>
      </Grid>

      {/* Scanning section */}
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
            {scannedText && (
              <Typography variant="body1" style={{ margin: "10px 0" }}>
                <strong>Scanned Text:</strong> {scannedText}
              </Typography>
            )}
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

      {/* No results message */}
      {searchAttempted && !productData && !loading && !error && (
        <Box textAlign="center" my={4}>
          <Typography variant="h6" color="text.secondary">
            No product found. Please try a different name or scan again.
          </Typography>
        </Box>
      )}

      {/* Product data display */}
      {productData && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography align="left" variant="h5" marginTop={6}>
              <strong>Product:</strong> {productData.product_name || productData.name || "N/A"}
            </Typography>
          </Grid>

          {/* Nutri-Score and Health Class
          <Grid item xs={12} md={6}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", color: "#2f524d" }}>
              {/* <ScoreCard
                title="Nutri-Score"
                grade={mapNutriScoreToGrade(productData.calculated_nutriscore)}
                style={getStyle("nutriScore", mapNutriScoreToGrade(productData.calculated_nutriscore))}
              /> */}

              {/* <Card style={{ padding: "20px", height: "150px" }}>
                <Typography variant="h6">Health Class</Typography>
                <Typography variant="body1" style={{ marginTop: "10px", color: "#2f524d" }}>
                  {productData.health_class || "N/A"}
                </Typography>
              </Card>
            </div>
          </Grid> */} 

          <Grid item xs={12}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", color: "#2f524d" }}>
            <Fade in={true} timeout={1000}>
            <Card style={{ padding: "20px", height: "150px" }}>
              <div>
                <NutritionalQualityCard
                  nutriScore={mapNutriScoreToGrade(productData.calculated_nutriscore)}
                  getMessage={getNutriScoreMessage}
                />
              </div>
              </Card>
            </Fade>
            </div>
          </Grid>

          {productData.low_nutrient_warnings && productData.low_nutrient_warnings.length > 0 && (
            <Grid item xs={12}>
              <Card style={{ padding: "20px" }}>
                <Typography align="left" variant="h6" style={{ marginBottom: "1rem", color: "black" }}>
                  Low Nutrient Warnings
                </Typography>
                <List>
                  {productData.low_nutrient_warnings.map((warning, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={<span style={{ color: "black" }}>{warning}</span>} />
                    </ListItem>
                  ))}
                </List>
              </Card>
            </Grid>
          )}
            
          {/* Pass the processed nutritional data to PredictForm */}
          {processedNutritionalData && <PredictForm prefillData={processedNutritionalData} />}
          <Link to='/alternatives' state={{ productName: productData.product_name || productData.name || "N/A" }}><button style={{"margin-left":"565px"}}>See Healthier Alternatives</button></Link>
          {/* Reviews section */}
          <Grid item xs={12}>
            <Card style={{ padding: "20px", display: "flex", flexDirection: "column" }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  <MessageSquare size={20} style={{ marginRight: "8px", verticalAlign: "middle" }} />
                  Product Reviews
                </Typography>
                <Button variant="contained" color="primary" size="small" onClick={() => setOpenReviewDialog(true)}>
                  Write Review
                </Button>
              </Box>

              {reviewsError && (
                <Typography color="error" variant="body2" mb={2}>
                  {reviewsError}
                </Typography>
              )}
             
              <Box sx={{ overflowY: "auto", flexGrow: 1 }}>
                {reviewsLoading ? (
                  <Box display="flex" justifyContent="center" py={3}>
                    <CircularProgress />
                  </Box>
                ) : reviews.length > 0 ? (
                  <List>
                    {reviews.map((review, index) => (
                      <React.Fragment key={index}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar>
                              <User />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {review.username || "Anonymous"}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {review.timestamp ? formatDate(review.timestamp) : "Unknown date"}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <>
                                <Rating
                                  value={Number.parseFloat(review.review) || 0}
                                  readOnly
                                  size="small"
                                  precision={0.5}
                                  sx={{ my: 0.5 }}
                                />
                                <Typography variant="body2" color="text.primary">
                                  {review.text}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                        {index < reviews.length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="150px">
                    <Typography variant="body1" color="text.secondary">
                      No reviews yet for this product.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>

          
        </Grid>
      )}

      {/* Review Dialog */}
      <Dialog open={openReviewDialog} onClose={() => setOpenReviewDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your Name"
            fullWidth
            variant="outlined"
            value={newReview.username}
            onChange={(e) => setNewReview({ ...newReview, username: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box mb={2}>
            <Typography component="legend">Rating</Typography>
            <Rating
              name="rating"
              value={newReview.rating}
              onChange={(_, newValue) => {
                setNewReview({ ...newReview, rating: newValue })
              }}
              precision={0.5}
              size="large"
            />
          </Box>
          <TextField
            margin="dense"
            label="Your Review"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newReview.text}
            onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReviewDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            color="primary"
            startIcon={<Send size={16} />}
            disabled={!newReview.text.trim()}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Speech Recognition Dialog */}
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
