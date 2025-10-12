// src/views/CheckView.jsx - Updated for Image Input/Output

import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Download } from 'lucide-react'; 

// Configuration: MUST match your FastAPI server address
const API_ENDPOINT = 'http://127.00.0.1:8000/api/check_ppe_image/'; 

const CheckView = ({ checkType }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  // processedImageUrl will store the URL of the blob for display
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // To show the uploaded image

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setProcessedImageUrl(null); 
    setError(null);
    
    // Create preview URL for the uploaded image
    if (file) {
        setPreviewUrl(URL.createObjectURL(file));
    } else {
        setPreviewUrl(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select an image file to upload.");
      return;
    }

    // Clean up previous blob URL
    if (processedImageUrl) {
      URL.revokeObjectURL(processedImageUrl);
    }
    
    setLoading(true);
    setError(null);
    setProcessedImageUrl(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // 1. Get the image content as a Blob
        const imageBlob = await response.blob();
        
        // 2. Create a local URL for the blob
        // The media type must match what the server returned (image/jpeg)
        const url = URL.createObjectURL(imageBlob);
        setProcessedImageUrl(url);

      } else {
        // Handle server errors
        const errorText = await response.text();
        let errorMessage = `Server responded with status ${response.status}.`;
        
        try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
            // If response is not JSON, use the status text
            console.error('Non-JSON error response:', errorText);
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Upload Error:', err);
      setError("Network error: Could not connect to the Python backend server. Is it running on port 8000?");
    } finally {
      setLoading(false);
    }
  };

  // Ensure to revoke preview URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (processedImageUrl) URL.revokeObjectURL(processedImageUrl);
    };
  }, [previewUrl, processedImageUrl]);


  const renderPPECheck = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800 text-center">
        PPE Compliance Image Analysis
      </h2>
      
      {/* 1. Upload Form */}
      <form onSubmit={handleUpload} className="p-8 bg-white rounded-xl shadow-lg border border-indigo-200">
        <div className="flex flex-col items-center space-y-4">
          <label className="w-full">
            <input
              type="file"
              // Accept image file types only
              accept="image/jpeg,image/png,image/jpg" 
              onChange={handleFileChange}
              className="hidden"
              id="image-upload"
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

      {/* 2. Results and Preview Display */}
      {loading && (
        <div className="text-center p-10">
          <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-indigo-600 font-medium">Processing image with YOLOv8...</p>
        </div>
      )}

      {/* Comparison View (Input vs Output) */}
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

    </div>
  );

  const renderMachineCheck = () => (
    // Placeholder for Machine Check UI
    <div className="text-center py-20">
      <h2 className="text-3xl font-bold text-gray-800">Machine Quality Check</h2>
      <p className="text-gray-600 mt-2">Machine Check UI and logic will be implemented here.</p>
    </div>
  );

  // Render content based on the checkType prop
  return (
    <div className="max-w-6xl mx-auto py-8">
      {checkType === 'PPE' ? renderPPECheck() : renderMachineCheck()}
    </div>
  );
};

export default CheckView;