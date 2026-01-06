// src/views/DashboardView.jsx
import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const DashboardView = () => {
  const [classSummary, setClassSummary] = useState([]);
  const [checkpointSummary, setCheckpointSummary] = useState([]);
  const [compliance, setCompliance] = useState(100);
  const [violations, setViolations] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("http://127.0.0.1:8000/api/dashboard");
      const data = await res.json();
      setClassSummary(data.class_summary || []);
      setCheckpointSummary(data.checkpoint_summary || []);
      setCompliance(data.compliance ?? 100);
      setViolations(data.violations ?? 0);
      setTotal(data.total ?? 0);
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const StatCircle = ({ value, title, color }) => (
    <div className="flex flex-col items-center p-4">
      <div className={`relative w-28 h-28 flex items-center justify-center rounded-full border-4 ${color}`}>
        <span className="text-xl font-bold text-gray-800">{value}</span>
      </div>
      <p className="mt-2 text-sm text-gray-500">{title}</p>
    </div>
  );

  // Split PPE classes into positives vs negatives
  const positiveClasses = classSummary.filter((c) => !c.class_name.startsWith("no_"));
  const negativeClasses = classSummary.filter((c) => c.class_name.startsWith("no_"));

  // Pie chart data (positive PPE)
  const positivePieData = {
    labels: positiveClasses.map((c) => c.class_name),
    datasets: [
      {
        data: positiveClasses.map((c) => c.count),
        backgroundColor: [
          "rgba(34, 197, 94, 0.9)", // green shades
          "rgba(22, 163, 74, 0.8)",
          "rgba(134, 239, 172, 0.8)",
          "rgba(187, 247, 208, 0.8)",
          "rgba(16, 185, 129, 0.8)",
        ],
      },
    ],
  };

  // Pie chart data (negative PPE)
  const negativePieData = {
    labels: negativeClasses.map((c) => c.class_name),
    datasets: [
      {
        data: negativeClasses.map((c) => c.count),
        backgroundColor: [
          "rgba(239, 68, 68, 0.9)", // red shades
          "rgba(220, 38, 38, 0.8)",
          "rgba(252, 165, 165, 0.8)",
          "rgba(254, 202, 202, 0.8)",
          "rgba(153, 27, 27, 0.8)",
        ],
      },
    ],
  };

  // Bar chart data (machine checkpoint failures)
  const checkpointBarData = {
    labels: checkpointSummary.map((cp) => cp.checkpoint_name),
    datasets: [
      {
        label: "Failed Count",
        data: checkpointSummary.map((cp) => cp.failed_count),
        backgroundColor: "rgba(239, 68, 68, 0.7)", // red bars
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h3 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-2">Statistic Graphs</h3>

      {/* Metric Circles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCircle value={`${compliance}%`} title="Compliance %" color="border-green-500 text-green-700" />
        <StatCircle value={violations} title="Violations" color="border-red-500 text-red-700" />
        <StatCircle value={total} title="Total Detections" color="border-blue-500 text-blue-700" />
      </div>

      {/* PPE Pie Charts side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h4 className="text-lg font-semibold mb-4 text-gray-700">Positive PPE Usage</h4>
          <Pie data={positivePieData} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h4 className="text-lg font-semibold mb-4 text-gray-700">Negative PPE Violations</h4>
          <Pie data={negativePieData} />
        </div>
      </div>

      {/* Machine Checkpoint Failures Bar Chart */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h4 className="text-lg font-semibold mb-4 text-gray-700">Machine Checkpoint Failures</h4>
        <Bar data={checkpointBarData} />
      </div>
    </div>
  );
};

export default DashboardView;