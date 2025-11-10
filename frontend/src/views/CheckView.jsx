// src/views/CheckView.jsx

import React, { useState } from "react";
import { Camera } from "lucide-react";
import emailjs from "@emailjs/browser";

const PPE_API = "http://127.0.0.1:8000/api/check_ppe_image/";

const CheckView = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [processedVideo, setProcessedVideo] = useState(null);
  const [ppeViolations, setPpeViolations] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Automatically send email if violations are found
  const sendPPEEmail = async (violations) => {
    try {
      await emailjs.send(
        "service_4ku5fmq", // ✅ Your EmailJS service ID
        "template_tx1k3b5", // ✅ Your template ID
        {
          message: `PPE Violations Detected: ${violations.join(", ")}`,
          to_email: "recipient@example.com", // change to recipient email
        },
        "M3qxulbWtcwpbhfQS" // ✅ Your EmailJS public key
      );
      console.log("✅ PPE Warning Email Sent Automatically!");
    } catch (error) {
      console.error("❌ Error Sending PPE Email:", error);
    }
  };

  // ✅ Upload and detect PPE
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(PPE_API, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setProcessedVideo(data.processed_video || null);
      setPpeViolations(data.violations || []);

      // Send email automatically
      if (data.violations && data.violations.length > 0) {
        await sendPPEEmail(data.violations);
      }
    } catch (error) {
      console.error("Error while checking PPE:", error);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 flex flex-col items-center space-y-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">PPE Detection</h1>

      {/* File Upload Section */}
      <div className="flex flex-col items-center space-y-3">
        <label
          htmlFor="file-upload"
          className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-xl cursor-pointer"
        >
          <Camera size={20} />
          <span>Select Video/Image</span>
        </label>
        <input
          id="file-upload"
          type="file"
          accept="video/*,image/*"
          className="hidden"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium"
        >
          {loading ? "Processing..." : "Upload & Detect"}
        </button>
      </div>

      {/* Processed Video */}
      {processedVideo && (
        <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-4">
          <video
            src={processedVideo}
            controls
            className="w-full rounded-xl shadow-md"
          />
        </div>
      )}

      {/* Violations List */}
      {ppeViolations.length > 0 && (
        <div className="text-center text-red-600 font-semibold mt-4">
          Violations Detected: {ppeViolations.join(", ")}
        </div>
      )}
    </div>
  );
};

export default CheckView;
