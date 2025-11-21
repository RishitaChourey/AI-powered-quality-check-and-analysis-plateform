import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Webcam from "react-webcam";

const API_BASE = "http://127.0.0.1:8000";
const PPE_API = `${API_BASE}/predict/`;
const EMAIL_API = `${API_BASE}/send_email/`;

const PPEDetectionView = () => {
  const [file, setFile] = useState(null);
  const [detections, setDetections] = useState([]);
  const [summary, setSummary] = useState({});
  const [originalMedia, setOriginalMedia] = useState("");
  const [annotatedMedia, setAnnotatedMedia] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [progress, setProgress] = useState(0);
  const [useWebcam, setUseWebcam] = useState(false);
  const webcamRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setIsVideo(selectedFile ? selectedFile.type.startsWith("video/") : false);

    setDetections([]);
    setSummary({});
    setOriginalMedia("");
    setAnnotatedMedia("");
    setProgress(0);
  };

  const handleDownload = async () => {
    if (!annotatedMedia) return;

    try {
      const response = await fetch(annotatedMedia);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = annotatedMedia.split("/").pop() || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const captureFromWebcam = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return alert("Unable to capture from webcam.");

    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const capturedFile = new File([blob], "webcam_capture.jpg", {
        type: "image/jpeg",
      });
      setFile(capturedFile);
      setIsVideo(false);

      setOriginalMedia(URL.createObjectURL(capturedFile));
      setAnnotatedMedia("");
      setDetections([]);
      setSummary({});
    } catch (err) {
      console.error("Webcam capture error:", err);
      alert("Failed to capture from webcam.");
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!file) return alert("Please upload an image or video first!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setProgress(10);

      const res = await axios.post(PPE_API, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(Math.min(90, percent));
        },
        timeout: 120000,
      });

      setProgress(95);

      const data = res.data || {};
      setDetections(data.detections || []);
      setSummary(data.summary || {});

      if (data.original_image) {
        const orig = data.original_image.startsWith("/") ? `${API_BASE}${data.original_image}` : data.original_image;
        setOriginalMedia(orig);
      } else if (!originalMedia && file && !file.type.startsWith("video/")) {
        setOriginalMedia(URL.createObjectURL(file));
      }

      if (data.annotated_image) {
        const ann = data.annotated_image.startsWith("/") ? `${API_BASE}${data.annotated_image}` : data.annotated_image;
        setAnnotatedMedia(ann);
      }

      setIsVideo(Boolean(data.is_video) || (file && file.type?.startsWith("video/")));
      setProgress(100);
    } catch (err) {
      console.error("Prediction error:", err);
      alert("Something went wrong while detecting PPE. Check backend logs.");
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const sendPPEEmail = async (summaryObj) => {
    try {
      const subject = "⚠ PPE Violation Alert";
      const html = `
        <html>
          <body style="font-family:Arial,sans-serif;">
            <h3>PPE Violation Report</h3>
            <p>The system detected the following PPE violations:</p>
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#f8d7da;color:#721c24;">
                  <th style="padding:8px;text-align:left">PPE Item</th>
                  <th style="padding:8px;text-align:right">Count</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(summaryObj).map(([k, v]) => `
                  <tr>
                    <td style="padding:8px;border-bottom:1px solid #eee">${k}</td>
                    <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${v}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
            <p>Regards,<br/>TEIM Safety Monitoring</p>
          </body>
        </html>
      `;
      const recipients = ["industryproject87@gmail.com"];

      await fetch(EMAIL_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: recipients, subject, body: html }),
      });

      console.log("Email requested to backend.");
    } catch (err) {
      console.error("Email send error:", err);
    }
  };

  useEffect(() => {
    if (!summary || Object.keys(summary).length === 0) return;
    const total = Object.values(summary).reduce((s, v) => s + Number(v || 0), 0);
    if (total > 0) sendPPEEmail(summary);
  }, [summary]);

  return (
    <div className="flex flex-col items-center mt-8 p-4 w-full">
      {/* Main upload/capture panel */}
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">
          PPE Detection System
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Upload an image or video to detect Personal Protective Equipment.
        </p>

        <div className="flex justify-center mb-4">
          <button
            onClick={() => {
              setUseWebcam((s) => !s);
              setFile(null);
              setDetections([]);
              setSummary({});
              setOriginalMedia("");
              setAnnotatedMedia("");
              setProgress(0);
            }}
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
              {loading ? `Processing... ${progress}%` : "Upload & Detect"}
            </button>

            {loading && (
              <div className="w-full max-w-sm mt-3">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
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
          </div>
        )}
      </div>

      {/* Summary Panel */}
      {Object.keys(summary).length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Detections</h3>
          <div className="mt-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Summary</h4>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(summary).map(([cls, count]) => (
                <li key={cls} className="bg-gray-100 px-3 py-1 rounded flex justify-between">
                  <span className="font-medium text-gray-700">{cls}</span>
                  <span className="text-blue-600 font-semibold">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Media Panel */}
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
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold"
                >
                  Download
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PPEDetectionView;
