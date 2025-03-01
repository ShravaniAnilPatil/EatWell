import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import '../styles/webcam.css'

const WebcamCapture = () => {
  const webcamRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null); 
  const [mode, setMode] = useState("scan");

  const capture = async () => {
    if (mode === "scan" && webcamRef.current) {
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
    const byteString = atob(imageSrc.split(",")[1]);
    const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([arrayBuffer], { type: mimeString });
    const formData = new FormData();
    formData.append("image", blob, "image.jpeg");

    try {
      const response = await axios.post("http://127.0.0.1:5000/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.extracted_text) {
        alert("Extracted Text:\n" + response.data.extracted_text);
      } else {
        alert("Failed to extract text.");
      }
    } catch (error) {
      console.error(error);
      alert("Error processing the image.");
    }
  };

  return (
    <div className="container1">
      <h1>Image Text Extractor</h1>
      <div className="button-group">
        <button
          className={`button ${mode === "scan" ? "active" : ""}`}
          onClick={() => setMode("scan")}
        >
          Scan Image
        </button>
        <button
          className={`button ${mode === "upload" ? "active" : ""}`}
          onClick={() => setMode("upload")}
        >
          Upload Image
        </button>
      </div>

      {mode === "scan" && (
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

      {mode === "upload" && (
        <div className="upload-container">
          <input type="file" accept="image/*" onChange={uploadImage} />
        </div>
      )}

      {imagePreview && (
        <div className="preview-container">
          <h2>Image Preview:</h2>
          <img src={imagePreview} alt="Preview" className="image-preview" />
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
