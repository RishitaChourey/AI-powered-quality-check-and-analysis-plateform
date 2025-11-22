// src/views/CheckView.jsx
import React from "react";

const CheckView = () => {
  // --- Machine Quality Check Data ---
  const checkpoints = [
    { id: 1, name: "LOCK", status: "Passed", datetime: "2025-10-06 09:15" },
    { id: 2, name: "WIRES", status: "Not Passed", datetime: "2025-10-06 09:45" },
    { id: 3, name: "LOGO", status: "Passed", datetime: "2025-10-06 10:00" },
    { id: 4, name: "STICKERS", status: "Not Passed", datetime: "2025-10-06 10:30" },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
        Machine Quality Check
      </h2>

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
              <tr
                key={cp.id}
                className={cp.status === "Not Passed" ? "bg-red-100" : "bg-green-100"}
              >
                <td className="py-3 px-6">{cp.name}</td>
                <td
                  className={`py-3 px-6 font-semibold ${
                    cp.status === "Not Passed" ? "text-red-700" : "text-green-700"
                  }`}
                >
                  {cp.status}
                </td>
                <td className="py-3 px-6">{cp.datetime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CheckView;
