import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Footer from ".//Footer";
const MachineDetectionView = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [originalVideo, setOriginalVideo] = useState("");
  const [annotatedVideo, setAnnotatedVideo] = useState("");
  const [checkpoints, setCheckpoints] = useState([]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!file) return alert("Please upload a video first!");

  const formData = new FormData();
  formData.append("file", file);

  try {
    setLoading(true);

    const res = await axios.post(
      "http://localhost:8000/predict_machine/",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    const data = res.data;
    if (data.original) setOriginalVideo("http://localhost:8000" + data.original);
    if (data.annotated) setAnnotatedVideo("http://localhost:8000" + data.annotated);
    if (data.checkpoints) setCheckpoints(data.checkpoints);

  } catch (err) {
    console.error(err);
    alert("Something went wrong while processing the video.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex flex-col items-center mt-8 p-4 w-full">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">
          Machine Quality Analysis
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Upload a video to detect machine defects, lock issues, wiring faults,
          missing stickers, logo errors, and more.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-3"
        >
          <input
            type="file"
            accept="video/*"
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
  <div className="flex flex-col items-center mt-3">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
    <p className="text-center text-sm text-gray-600 mt-2">Processing...</p>
  </div>
)}
        </form>
      </div>

      {(originalVideo || annotatedVideo) && (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
          {originalVideo && (
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Original Video
              </h3>
              <video
                src={originalVideo}
                controls
                className="rounded-lg shadow-lg w-full max-h-[400px] object-contain"
              />
            </div>
          )}

          {annotatedVideo && (
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Detected Output
              </h3>
              <video
                src={annotatedVideo}
                controls
                className="rounded-lg shadow-lg w-full max-h-[400px] object-contain"
              />
            </div>
          )}
        </div>
      )}

      {checkpoints.length > 0 && (
        <div className="mt-10 w-full px-4 grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* PASS BOX */}
          <div className="w-full bg-green-100 border-l-8 border-green-600 rounded-xl p-6 shadow">
            <h3 className="text-2xl font-bold text-green-700 mb-4">PASS</h3>

            <div className="flex flex-wrap gap-3 max-h-40 overflow-y-auto pr-2">
              {checkpoints
                .filter((cp) => cp.passed)
                .map((cp, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 rounded-lg bg-green-200 text-green-800 
                              text-sm font-semibold shadow-sm"
                  >
                    {cp.name}
                  </div>
                ))}

              {checkpoints.filter((cp) => cp.passed).length === 0 && (
                <p className="text-green-600 italic">No checkpoints passed</p>
              )}
            </div>
          </div>

          {/* FAIL BOX */}
          <div className="w-full bg-red-100 border-l-8 border-red-600 rounded-xl p-6 shadow">
            <h3 className="text-2xl font-bold text-red-700 mb-4">FAIL</h3>

            <div className="flex flex-wrap gap-3 max-h-40 overflow-y-auto pr-2">
              {checkpoints
                .filter((cp) => !cp.passed)
                .map((cp, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 rounded-lg bg-red-200 text-red-800 
                              text-sm font-semibold shadow-sm"
                  >
                    {cp.name}
                  </div>
                ))}

              {checkpoints.filter((cp) => !cp.passed).length === 0 && (
                <p className="text-red-600 italic">No checkpoints failed</p>
              )}
            </div>
          </div>

        </div>
      )}
      
    </div>

  );
};

export default MachineDetectionView;
