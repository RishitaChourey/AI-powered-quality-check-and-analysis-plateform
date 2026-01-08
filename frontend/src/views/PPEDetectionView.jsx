import React, { useState, useRef, useEffect } from "react";
import { Camera, Image as ImageIcon, Download, Plus } from "lucide-react";
import axios from "axios";
import Webcam from "react-webcam";


const API_ENDPOINT = 'http://127.0.0.1:8000/predict/'; // match backend

const PPEDetectionView = () => {
  const [file, setFile] = useState(null);
  const [detections, setDetections] = useState([]);
  const [originalMedia, setOriginalMedia] = useState("");
  const [annotatedMedia, setAnnotatedMedia] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [useWebcam, setUseWebcam] = useState(false);
  const webcamRef = useRef(null);
  const [summary, setSummary] = useState({});
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [detectedFrames, setDetectedFrames] = useState([]);
  const [faceName, setFaceName] = useState("");
const [faceImage, setFaceImage] = useState(null);
const [facePreview, setFacePreview] = useState(null);
const [addingFace, setAddingFace] = useState(false);

  const handleFaceImageChange = (e) => {
    const img = e.target.files[0];
    if (!img) return;
    setFaceImage(img);
    setFacePreview(URL.createObjectURL(img));
  };

  const captureFaceFromWebcam = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return alert("Capture failed");
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "face.jpg", { type: "image/jpeg" });
        setFaceImage(file);
        setFacePreview(URL.createObjectURL(file));
      });
  };

  const handleAddFace = async () => {
    if (!faceName || !faceImage) {
      alert("Please provide both name and face image");
      return;
    }
    const formData = new FormData();
    formData.append("name", faceName);
    formData.append("image", faceImage);

    try {
      setAddingFace(true);
      await axios.post("http://127.0.0.1:8000/face/add_face/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Face added successfully!");
      // reset
      setFaceName("");
      setFaceImage(null);
      setFacePreview(null);
    } catch (err) {
      console.error(err);
      alert("Failed to add face");
    } finally {
      setAddingFace(false);
    }
  };

  // Handle file input
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setIsVideo(selectedFile && selectedFile.type.startsWith("video/"));
  };

  // Capture image from webcam
  const captureFromWebcam = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return alert("Unable to capture from webcam.");

    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const capturedFile = new File([blob], "webcam_capture.jpg", { type: "image/jpeg" });
        setFile(capturedFile);
        setIsVideo(false);
      });
  };

  // Upload file and detect PPE
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!file) return alert("Please upload an image or video first!");

  const formData = new FormData();
  formData.append("file", file);

  try {
    setLoading(true);

    const res = await axios.post(API_ENDPOINT, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const data = res.data;
    if (data.detected_frames) {
      setDetectedFrames(data.detected_frames.map(f => `http://127.0.0.1:8000${f}`));
    } else {
      setDetectedFrames([]);
    }

    setDetections([]);
    setSummary(data.violations || {});
    if (data.is_video && data.uploaded_file) {
      setOriginalMedia(`http://127.0.0.1:8000${data.uploaded_file}`);
      setAnnotatedMedia(null);
    } else {
      if (data.original_image) {
        setOriginalMedia(`http://127.0.0.1:8000${data.original_image}`);
      }
      if (data.annotated_image) {
        setAnnotatedMedia(`http://127.0.0.1:8000${data.annotated_image}`);
      }
    }
  } catch (err) {
    console.error("Prediction error:", err);
    alert("Something went wrong while detecting PPE.");
  } finally {
    setLoading(false);
  }
};

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (processedImageUrl) URL.revokeObjectURL(processedImageUrl);
    };
  }, [processedImageUrl]);

  return (
    <div className="flex flex-col items-center mt-8 p-4 w-full">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">PPE Detection System</h2>
        <p className="text-gray-600 mb-6 text-center">Upload an image or video to detect Personal Protective Equipment.</p>

        <div className="flex justify-center mb-4">
          <button
            onClick={() => setUseWebcam(!useWebcam)}
            className={`px-5 py-2 rounded font-semibold text-white transition-all duration-300 ${
              useWebcam ? "bg-gray-500 hover:bg-gray-600" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {useWebcam ? "Use File Upload" : "Use Webcam"}
          </button>
        </div>

        {!useWebcam ? (
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="p-2 border rounded w-full max-w-sm text-gray-700"
            />
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded font-semibold text-white transition-all duration-300 ${
                loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Processing..." : "Upload & Detect"}
            </button>

            {loading && (
  <div className="flex flex-col items-center mt-3">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
    <p className="text-center text-sm text-gray-600 mt-2">Processing...</p>
  </div>
)}
          </form>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="rounded-lg shadow-md w-full max-w-sm"
              videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
            />
            <div className="flex gap-3">
              <button
                onClick={captureFromWebcam}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold"
              >
                Capture
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !file}
                className={`px-6 py-2 rounded font-semibold text-white transition-all duration-300 ${
                  loading || !file ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Processing..." : "Detect from Capture"}
              </button>
            </div>
            {loading && (
    <div className="flex flex-col items-center mt-3">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      <p className="text-center text-sm text-gray-600 mt-2">Processing...</p>
    </div>
  )}

          </div>
        )}
      </div>
<div className="mt-10 bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
  <h3 className="text-2xl font-semibold mb-4 text-gray-800">
    Add New Face (Face Registration)
  </h3>
  <div className="flex flex-col gap-4">
    <input
      type="text"
      placeholder="Enter person's name"
      value={faceName}
      onChange={(e) => setFaceName(e.target.value)}
      className="p-2 border rounded text-gray-700"
    />
    <input
      type="file"
      accept="image/*"
      onChange={handleFaceImageChange}
      className="p-2 border rounded"
    />
    <div className="flex gap-3">
      <button
        onClick={captureFaceFromWebcam}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
      >
        Capture from Webcam
      </button>
      <button
        onClick={handleAddFace}
        disabled={addingFace}
        className={`px-4 py-2 rounded text-white ${
          addingFace ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {addingFace ? "Saving..." : "Save Face"}
      </button>
    </div>
    {facePreview && (
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-1">Preview</p>
        <img
          src={facePreview}
          alt="Face Preview"
          className="w-40 h-40 object-cover rounded-lg border"
        />
      </div>
    )}
  </div>
</div>
      {Object.keys(summary).length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Detections</h3>
          {Object.keys(summary).length > 0 && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
  PPE Violations Summary
</h4>

<div className="space-y-3">
  {Object.entries(summary).map(([person, violations]) => (
    <div
      key={person}
      className="border rounded-lg p-3 bg-red-50"
    >
      <p className="font-semibold text-gray-800">{person}</p>
      <ul className="list-disc list-inside text-red-600">
        {violations.map((v, idx) => (
          <li key={idx}>{v}</li>
        ))}
      </ul>
    </div>
  ))}
</div>

            </div>
          )}
        </div>
      )}

      {(originalMedia || annotatedMedia) && (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
          {originalMedia && (
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Original</h3>
              {isVideo ? (
                <video src={originalMedia} controls className="rounded-lg shadow-lg w-full max-h-[400px] object-contain" />
              ) : (
                <img src={originalMedia} alt="Original Upload" className="rounded-lg shadow-lg w-full max-h-[400px] object-contain" />
              )}
            </div>
          )}
          {annotatedMedia && (
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Detected PPE</h3>
              {isVideo ? (
                <video src={annotatedMedia} controls className="rounded-lg shadow-lg w-full max-h-[400px] object-contain" />
              ) : (
                <img src={annotatedMedia} alt="Detected PPE" className="rounded-lg shadow-lg w-full max-h-[400px] object-contain" />
              )}
            </div>
          )}
        </div>
      )}


      {detectedFrames.length > 0 && (
  <div className="mt-10 bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl">
    <h3 className="text-2xl font-semibold mb-4 text-gray-800">
      Detected Frames
    </h3>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {detectedFrames.map((src, idx) => (
        <div key={idx} className="border rounded-lg overflow-hidden">
          <img
            src={src}
            alt={`Frame ${idx}`}
            className="w-full h-40 object-cover hover:scale-105 transition-transform"
          />
        </div>
      ))}
    </div>
  </div>
)}

    </div>
  );
};

export default PPEDetectionView;
