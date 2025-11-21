// frontend/src/pages/CheckView.js
import React, { useState, useRef } from "react";
import Webcam from "react-webcam";

const MACHINE_API = "http://127.0.0.1:8000/predict_machine/";

const CheckView = () => {
  const [file, setFile] = useState(null);
  const [originalMedia, setOriginalMedia] = useState("");
  const [processedMedia, setProcessedMedia] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [useWebcam, setUseWebcam] = useState(false);

  const webcamRef = useRef(null);

  // File Upload Handler
  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setOriginalMedia(selected ? URL.createObjectURL(selected) : "");
    setProcessedMedia("");
    setProgress(0);
  };

  // Webcam Capture
  const captureFromWebcam = async () => {
    const shot = webcamRef.current?.getScreenshot();
    if (!shot) return alert("Unable to capture.");

    const res = await fetch(shot);
    const blob = await res.blob();

    const webcamImage = new File([blob], "webcam_machine.jpg", {
      type: "image/jpeg",
    });

    setFile(webcamImage);
    setOriginalMedia(URL.createObjectURL(webcamImage));
    setProcessedMedia("");
  };

  // Submit to Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please upload or capture an image!");

    setLoading(true);
    setProgress(20);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const response = await fetch(MACHINE_API, { method: "POST", body: fd });
      setProgress(70);

      const data = await response.json();
      if (data.processed_image) {
        setProcessedMedia(`http://127.0.0.1:8000${data.processed_image}`);
      }

      setProgress(100);
    } catch (err) {
      console.error(err);
      alert("Processing failed!");
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 700);
    }
  };

  return (
    <div className="flex flex-col items-center mt-8 p-4 w-full">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">
          Machine Quality Check
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Upload an image or capture via webcam to run machine quality analysis.
        </p>

        {/* Webcam Toggle */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => {
              setUseWebcam((v) => !v);
              setFile(null);
              setOriginalMedia("");
              setProcessedMedia("");
            }}
            className={`px-5 py-2 rounded font-semibold text-white ${
              useWebcam
                ? "bg-gray-500 hover:bg-gray-600"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {useWebcam ? "Use File Upload" : "Use Webcam"}
          </button>
        </div>

        {!useWebcam ? (
          /* File Upload */
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
              className={`px-6 py-2 rounded text-white font-semibold ${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? `Processing... ${progress}%` : "Upload & Analyze"}
            </button>

            {loading && (
              <div className="w-full max-w-sm mt-3">
                <div className="bg-gray-200 h-3 rounded-full">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-gray-600 mt-1">
                  Processing... {progress}%
                </p>
              </div>
            )}
          </form>
        ) : (
          /* Webcam */
          <div className="flex flex-col items-center gap-3">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="rounded-lg shadow-md w-full max-w-sm"
            />

            <div className="flex gap-3">
              <button
                onClick={captureFromWebcam}
                className="px-6 py-2 bg-green-600 text-white rounded"
              >
                Capture
              </button>

              <button
                onClick={handleSubmit}
                disabled={!file || loading}
                className="px-6 py-2 bg-blue-600 text-white rounded"
              >
                {loading ? "Processing..." : "Analyze"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Section */}
      {(originalMedia || processedMedia) && (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {originalMedia && (
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-3">Original</h3>
              <img src={originalMedia} alt="original" className="rounded-lg w-full" />
            </div>
          )}

          {processedMedia && (
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-3">Processed Output</h3>
              <img src={processedMedia} alt="processed" className="rounded-lg w-full" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckView;
