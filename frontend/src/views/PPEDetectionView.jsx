import React, { useState } from "react";
import axios from "axios";

const PPEDetectionView = () => {
  const [file, setFile] = useState(null);
  const [detections, setDetections] = useState([]);
  const [originalMedia, setOriginalMedia] = useState("");
  const [annotatedMedia, setAnnotatedMedia] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setIsVideo(selectedFile && selectedFile.type.startsWith("video/"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please upload an image or video first!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setProgress(30); // Initial progress state

      const res = await axios.post("http://127.0.0.1:8000/predict/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percent);
        },
      });

      setProgress(90); // Close to completion

      const data = res.data;
      setDetections(data.detections || []);
      if (data.original_image) {
        setOriginalMedia(`http://127.0.0.1:8000${data.original_image}`);
      }
      if (data.annotated_image) {
        setAnnotatedMedia(`http://127.0.0.1:8000${data.annotated_image}`);
      }

      setProgress(100);
    } catch (err) {
      console.error("Prediction error:", err);
      alert("Something went wrong while detecting PPE.");
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  return (
    <div className="flex flex-col items-center mt-8 p-4 w-full">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">
          PPE Detection System
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Upload an image or video to detect Personal Protective Equipment.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-3"
        >
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
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing..." : "Upload & Detect"}
          </button>

          {loading && (
            <div className="w-full max-w-sm mt-3">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-1">
                Processing... {progress}%
              </p>
            </div>
          )}
        </form>
      </div>

      {detections.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">
            Detections
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {detections.map((d, i) => (
              <li
                key={i}
                className="bg-gray-100 rounded-lg px-3 py-2 flex items-center justify-between shadow-sm hover:shadow-md transition-all"
              >
                <span className="font-medium text-gray-800">{d.class}</span>
                <span className="text-sm font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {(d.confidence * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(originalMedia || annotatedMedia) && (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
          {originalMedia && (
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Original
              </h3>
              {isVideo ? (
                <video
                  src={originalMedia}
                  controls
                  className="rounded-lg shadow-lg w-full max-h-[400px] object-contain"
                />
              ) : (
                <img
                  src={originalMedia}
                  alt="Original Upload"
                  className="rounded-lg shadow-lg w-full max-h-[400px] object-contain"
                />
              )}
            </div>
          )}
          {annotatedMedia && (
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Detected PPE
              </h3>
              {isVideo ? (
                <video
                  src={annotatedMedia}
                  controls
                  className="rounded-lg shadow-lg w-full max-h-[400px] object-contain"
                />
              ) : (
                <img
                  src={annotatedMedia}
                  alt="Detected PPE"
                  className="rounded-lg shadow-lg w-full max-h-[400px] object-contain"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PPEDetectionView;
