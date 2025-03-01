import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";

const Camera = () => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setExtractedText(""); // Reset extracted text
  };

  const extractText = async () => {
    if (!capturedImage) return;

    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/extract-text/", {
        image: capturedImage,
        prompt: "Extract the text in the image verbatim.",
      });
      setExtractedText(response.data.text || "No text found.");
    } catch (error) {
      console.error("Error extracting text:", error);
      setExtractedText("Failed to extract text.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Camera Capture</h1>

      {!capturedImage ? (
        <div className="relative">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="border rounded shadow-md"
          />
          <button
            onClick={capturePhoto}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded shadow"
          >
            Capture Photo
          </button>
        </div>
      ) : (
        <div className="text-center">
          <img
            src={capturedImage}
            alt="Captured"
            className="border rounded shadow-md"
          />
          <button
            onClick={extractText}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded shadow"
          >
            Extract Text
          </button>
          {loading && <p>Extracting text...</p>}
          {extractedText && (
            <div className="mt-4 p-4 border rounded shadow">
              <h2 className="text-lg font-bold">Extracted Text:</h2>
              <p>{extractedText}</p>
            </div>
          )}
          <button
            onClick={() => setCapturedImage(null)}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded shadow"
          >
            Retake Photo
          </button>
        </div>
      )}
    </div>
  );
};

export default Camera;
