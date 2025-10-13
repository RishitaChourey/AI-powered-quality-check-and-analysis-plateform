import React, { useState } from "react";
import axios from "axios";

const PPEDetectionView = () => {
  const [file, setFile] = useState(null);
  const [detections, setDetections] = useState([]);
  const [originalImage, setOriginalImage] = useState("");
  const [annotatedImage, setAnnotatedImage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please upload an image first!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await axios.post("http://127.0.0.1:8000/predict/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res.data;
      setDetections(data.detections);
      setOriginalImage(`http://127.0.0.1:8000${data.original_image}`);
      setAnnotatedImage(`http://127.0.0.1:8000${data.annotated_image}`);
    } catch (err) {
      console.error("Prediction error:", err);
      alert("Something went wrong while detecting PPE.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">PPE Detection</h2>

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Detecting..." : "Upload & Detect"}
        </button>
      </form>

      {detections.length > 0 && (
        <div className="mt-6 bg-gray-100 p-4 rounded shadow-md w-80">
          <h3 className="text-lg font-semibold mb-2">Detections:</h3>
          <ul className="text-left">
            {detections.map((d, i) => (
              <li key={i}>
                <span className="font-medium">{d.class}</span> —{" "}
                {(d.confidence * 100).toFixed(1)}%
              </li>
            ))}
          </ul>
        </div>
      )}

      {(originalImage || annotatedImage) && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {originalImage && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Original Image:</h3>
              <img
                src={originalImage}
                alt="Original Upload"
                className="rounded-lg shadow-lg max-w-md"
              />
            </div>
          )}
          {annotatedImage && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Detected PPE:</h3>
              <img
                src={annotatedImage}
                alt="Detected PPE"
                className="rounded-lg shadow-lg max-w-md"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PPEDetectionView;
