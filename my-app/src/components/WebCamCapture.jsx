"use client"

import { useRef, useState } from "react"
import Webcam from "react-webcam"
import axios from "axios"
import "../styles/webcam.css"

const WebcamCapture = () => {
  const webcamRef = useRef(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [mode, setMode] = useState("scan")
  const [extractedText, setExtractedText] = useState("")
  const [productData, setProductData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const capture = async () => {
    if (mode === "scan" && webcamRef.current) {
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
    setIsLoading(true)
    setError(null)

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
      const response = await axios.post("http://127.0.0.1:5000/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.extracted_text) {
        const text = response.data.extracted_text
        setExtractedText(text)
        // Don't automatically search - let user confirm the text first
      } else {
        setError("Failed to extract text from image.")
      }
    } catch (error) {
      console.error("Error processing the image:", error)
      setError("Error processing the image. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const searchProduct = async () => {
    if (!extractedText.trim()) {
      setError("No text to search. Please capture or upload an image first.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/product`, {
        params: { name: extractedText },
      })

      if (response.status === 204) {
        setError("No product found with that name. Please try again.")
        setProductData(null)
      } else if (response.data && response.data.product) {
        setProductData(response.data.product)
      } else {
        setError("Unexpected response format from server.")
      }
    } catch (error) {
      console.error("Error searching for product:", error)
      setError("Error searching for product. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container1">
      <h1>Product Scanner</h1>
      <div className="button-group">
        <button className={`button ${mode === "scan" ? "active" : ""}`} onClick={() => setMode("scan")}>
          Scan Image
        </button>
        <button className={`button ${mode === "upload" ? "active" : ""}`} onClick={() => setMode("upload")}>
          Upload Image
        </button>
      </div>

      {mode === "scan" && (
        <div className="webcam-container">
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="webcam" />
          <button onClick={capture} className="button capture-button" disabled={isLoading}>
            {isLoading ? "Processing..." : "Capture Image"}
          </button>
        </div>
      )}

      {mode === "upload" && (
        <div className="upload-container">
          <input type="file" accept="image/*" onChange={uploadImage} disabled={isLoading} />
        </div>
      )}

      {imagePreview && (
        <div className="preview-container">
          <h2>Image Preview:</h2>
          <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="image-preview" />
        </div>
      )}

      {extractedText && (
        <div className="extracted-text-container">
          <h2>Extracted Text:</h2>
          <div className="text-display">
            <p>{extractedText}</p>
            <button onClick={searchProduct} className="button search-button" disabled={isLoading}>
              {isLoading ? "Searching..." : "Search Product"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      )}

      {productData && (
        <div className="product-container">
          <h2>Product Information:</h2>
          <div className="product-info">
            <h3>{productData.product_name}</h3>
            <p>
              <strong>Brand:</strong> {productData.brands}
            </p>
            <p>
              <strong>Quantity:</strong> {productData.quantity}
            </p>
            <p>
              <strong>Nutri-Score:</strong> {productData.nutri_score}
            </p>
            <p>
              <strong>Eco-Score:</strong> {productData.eco_score}
            </p>

            <h4>Nutritional Values (per 100g):</h4>
            <ul>
              <li>Energy: {productData.nutritional_values.energy_kcal} kcal</li>
              <li>Carbohydrates: {productData.nutritional_values.carbohydrates}g</li>
              <li>Fat: {productData.nutritional_values.fat}g</li>
              <li>Proteins: {productData.nutritional_values.proteins}g</li>
              <li>Sugars: {productData.nutritional_values.sugars}g</li>
              <li>Salt: {productData.nutritional_values.salt}g</li>
            </ul>

            {productData.images.front_image && productData.images.front_image !== "No image available" && (
              <div className="product-image">
                <img src={productData.images.front_image || "/placeholder.svg"} alt={productData.product_name} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default WebcamCapture

