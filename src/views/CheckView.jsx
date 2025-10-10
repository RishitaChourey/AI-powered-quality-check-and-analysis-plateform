// src/views/CheckView.jsx

import React from 'react';

/**
 * Check Page View (Designs a1.jpg and a5.jpg)
 */
const CheckView = ({ checkType }) => {
  const isMachineCheck = checkType === 'Machine';

  const MachineCheckForm = () => (
    <div>
      <h3 className="text-3xl font-bold mb-2 text-center">Upload Your Video</h3>
      <p className="text-sm text-center mb-8 text-indigo-200">File should be a video (eg:mp4)</p>

      <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        <label
          htmlFor="video-upload"
          className="cursor-pointer bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold shadow-lg hover:bg-gray-400 transition"
        >
          Choose File
        </label>
        <input type="file" id="video-upload" accept="video/*" className="hidden" />
        <div className="bg-gray-300 text-gray-600 py-3 px-6 rounded-lg shadow-inner flex-grow text-center">
          No File Chosen
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button className="bg-white text-indigo-700 py-2 px-6 rounded-lg font-bold shadow-xl hover:bg-indigo-100 transition">
          Submit
        </button>
      </div>
    </div>
  );

  const PPECheckForm = () => (
    <div>
      <h3 className="text-3xl font-bold mb-8 text-center">PPE Checking</h3>

      <div className="space-y-6 max-w-sm mx-auto">
        <div>
          <label className="block text-lg font-medium mb-2">Username:</label>
          <input
            type="text"
            className="w-full p-3 rounded-lg bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Enter username"
          />
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">Password:</label>
          <input
            type="password"
            className="w-full p-3 rounded-lg bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Enter password"
          />
        </div>
      </div>

      <div className="flex justify-end mt-8 max-w-sm mx-auto">
        <button className="bg-white text-indigo-700 py-2 px-6 rounded-lg font-bold shadow-xl hover:bg-indigo-100 transition">
          Login
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <p className="text-center text-lg text-gray-600 mb-8">
        {isMachineCheck
          ? 'This system monitors machine quality and detects if it passes all checkpoints.'
          : 'This system ensures worker safety by automatically detecting PPE compliance.'}
      </p>

      <div className="bg-indigo-700 text-white p-10 rounded-xl shadow-2xl">
        {isMachineCheck ? <MachineCheckForm /> : <PPECheckForm />}
      </div>
    </div>
  );
};

export default CheckView;