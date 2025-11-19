// src/views/CheckView.jsx

import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Download, Mail } from 'lucide-react'; 

const PPE_API = 'http://127.0.0.1:8000/api/check_ppe_image/'; // YOLO API
const EMAIL_API = "http://127.0.0.1:8000/send_email/";

const CheckView = ({ checkType }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [ppeViolations, setPpeViolations] = useState([]);


  // --- File selection ---
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
    setProcessedImageUrl(null);
    setPpeViolations([]);
    setError(null);
  };

  // --- Upload to YOLO API ---
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a file.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(PPE_API, {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        // Save detections
        setPpeViolations(data.violations || []);
        setProcessedImageUrl(data.processed_video || null);

        // Auto-email FASTAPI (like old code)
        if (data.violations?.length > 0) {
          await fetch(EMAIL_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: ["industryproject87@gmail.com"],
              subject: "PPE Violation Detected",
              body: `
                <p>Dear Employee,</p>
                <p>The following PPE violations were detected:
                <strong>${data.violations.join(", ")}</strong>.</p>
                <p>Please ensure compliance immediately.</p>
                <p>Regards,<br><b>TEIM Safety System</b></p>
              `,
            }),
          });
        }
      } else {
        // Image output (blob)
        const blob = await response.blob();
        setProcessedImageUrl(URL.createObjectURL(blob));
      }
    } catch (err) {
      console.error(err);
      setError("Error connecting to backend.");
    }

    setLoading(false);
  };

    alert("Email sent successfully!");
  };
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (processedImageUrl) URL.revokeObjectURL(processedImageUrl);
    };
  }, [previewUrl, processedImageUrl]);

  // --- PPE Check UI ---
  const renderPPECheck = () => (
    <div className="space-y-8 relative">
      <h2 className="text-3xl font-bold text-gray-800 text-center">
        PPE Compliance Check
      </h2>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="p-8 bg-white rounded-xl shadow-lg border border-indigo-200">
        <div className="flex flex-col items-center space-y-4">
          <label className="w-full">
          <input
            type="file"
              accept="image/jpeg,image/png,image/jpg" 
            onChange={handleFileChange}
              className="hidden"
          />
            <div className="cursor-pointer bg-indigo-100 border border-indigo-300 text-indigo-700 py-3 px-6 rounded-lg text-center font-semibold hover:bg-indigo-200 transition flex items-center justify-center">
              <ImageIcon className="w-5 h-5 mr-2" />
              {selectedFile ? selectedFile.name : "Choose Image File (JPG, PNG)"}
          </div>
        </label>
          
          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

        <button
          type="submit"
            disabled={loading || !selectedFile}
            className="w-full sm:w-1/2 mt-4 bg-indigo-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
        >
            {loading ? 'Analyzing Image...' : 'Run PPE Check'}
        </button>
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div className="text-center p-10">
          <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-indigo-600 font-medium">Processing image with YOLOv8...</p>
        </div>
      )}

      {/* Preview & Processed Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {previewUrl && (
          <div className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
            <h3 className="text-xl font-bold text-gray-700 mb-3 flex items-center">
              <Camera className="w-5 h-5 mr-2" /> Original Image
            </h3>
            <img src={previewUrl} alt="Original Upload" className="w-full max-h-96 object-contain rounded-lg shadow-inner" />
          </div>
        )}

        {processedImageUrl && (
          <div className="p-4 bg-white rounded-xl shadow-lg border-2 border-green-400">
            <h3 className="text-xl font-bold text-green-700 mb-3 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2" /> Detection Output
            </h3>
            <img src={processedImageUrl} alt="Processed Output" className="w-full max-h-96 object-contain rounded-lg shadow-md" />
            <a 
              href={processedImageUrl} 
              download="processed_ppe_detection.jpg" 
              className="mt-4 inline-flex items-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-medium"
            >
              <Download className="w-4 h-4 mr-2" /> Download Result
            </a>
          </div>
        )}
      </div>

      {/* Violations */}
      {ppeViolations.length > 0 && (
        <div className="text-center text-red-600 text-lg font-semibold">
          Violations Detected: {ppeViolations.join(", ")}
        </div>
      )}

      {/* Manual Email Button */}
      <button
        onClick={handleSendPPEEmail}
        className="fixed bottom-8 right-8 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition font-semibold flex items-center space-x-2"
      >
        <Mail className="w-5 h-5" />
        <span>Send PPE Email</span>
      </button>
    </div>
  );

  // --- Machine Quality Check UI ---
  const renderMachineCheck = () => {
    const checkpoints = [
      { id: 1, name: "LOCK", status: "Passed", datetime: "2025-10-06 09:15" },
      { id: 2, name: "WIRES", status: "Not Passed", datetime: "2025-10-06 09:45" },
      { id: 3, name: "LOGO", status: "Passed", datetime: "2025-10-06 10:00" },
      { id: 4, name: "STICKERS", status: "Not Passed", datetime: "2025-10-06 10:30" },
    ];

    return (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Machine Quality Check</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-md border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
                <th className="py-3 px-6 text-left font-medium text-gray-700">Checkpoint</th>
                <th className="py-3 px-6 text-left font-medium text-gray-700">Status</th>
                <th className="py-3 px-6 text-left font-medium text-gray-700">Date & Time</th>
          </tr>
        </thead>
            <tbody>
              {checkpoints.map((cp) => (
                <tr key={cp.id} className={cp.status === "Not Passed" ? "bg-red-100" : "bg-green-100"}>
                  <td className="py-3 px-6">{cp.name}</td>
                  <td className={`py-3 px-6 font-semibold ${cp.status === "Not Passed" ? "text-red-700" : "text-green-700"}`}>{cp.status}</td>
                  <td className="py-3 px-6">{cp.datetime}</td>
                </tr>
              ))}
            </tbody>
      </table>
        </div>

        {/* Send Machine Email Button */}
        <div className="text-center mt-6">
          <button
            onClick={handleSendMachineEmail}
            className="bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-red-700 transition"
          >
            Send Machine Warning Email
          </button>
        </div>
    </div>
  );
  

  return (
    <div className="max-w-6xl mx-auto py-8">
      {checkType === 'PPE' ? renderPPECheck() : renderMachineCheck()}
    </div>
  );
};

export default CheckView;
