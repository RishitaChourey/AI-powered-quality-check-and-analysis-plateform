import React, { useState } from "react";
import axios from "axios";

const MachineDetectionView = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

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
      setProgress(20);

      const res = await axios.post(
        "http://localhost:8000/predict_machine/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (event) => {
            const percent = Math.round((event.loaded * 100) / event.total);
            setProgress(percent);
          },
        }
      );

      setProgress(90);

      const data = res.data;
      if (data.original) setOriginalVideo("http://localhost:8000" + data.original);
      if (data.annotated) setAnnotatedVideo("http://localhost:8000" + data.annotated);
      if (data.checkpoints) setCheckpoints(data.checkpoints);

      setProgress(100);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while processing the video.");
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div className="flex flex-col items-center mt-8 p-4 w-full">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">
          Machine Quality Detection
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
        <div className="mt-8 w-full max-w-2xl bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Checkpoints</h3>
          <ul className="space-y-2">
            {checkpoints.map((cp, idx) => (
              <li
                key={idx}
                className={`flex justify-between p-3 rounded border ${
                  cp.passed
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-red-500 bg-red-50 text-red-700"
                }`}
              >
                <span className="font-medium">{cp.name}</span>
                <span>{cp.passed ? "PASS" : "FAIL"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MachineDetectionView;
