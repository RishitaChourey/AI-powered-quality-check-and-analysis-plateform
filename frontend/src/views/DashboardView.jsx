import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// ---------------- DATASETS ---------------- //

const machineFailuresMonthly = [
  { month: "Jan", failures: 42 },
  { month: "Feb", failures: 58 },
  { month: "Mar", failures: 39 },
  { month: "Apr", failures: 71 },
  { month: "May", failures: 66 },
  { month: "Jun", failures: 52 },
  { month: "Jul", failures: 48 },
  { month: "Aug", failures: 63 },
  { month: "Sep", failures: 57 },
  { month: "Oct", failures: 40 },
  { month: "Nov", failures: 75 },
  { month: "Dec", failures: 69 },
];

const checkpointFrequency = [
  { checkpoint: "foam_sheets", count: 37 },
  { checkpoint: "battery", count: 30 },
  { checkpoint: "document_folder", count: 27 },
  { checkpoint: "alternator_nameplate", count: 16 },
  { checkpoint: "cpcb_sticker", count: 12 },
  { checkpoint: "danger_sticker", count: 11 },
  { checkpoint: "engine_numberplate", count: 10 },
  { checkpoint: "cable_entry_holes", count: 9 },
  { checkpoint: "genset_nameplate", count: 8 },
  { checkpoint: "control_panel_bidding", count: 7 },
];

const machineHealthTrend = [
  { month: "Jan", score: 82 },
  { month: "Feb", score: 79 },
  { month: "Mar", score: 85 },
  { month: "Apr", score: 76 },
  { month: "May", score: 88 },
  { month: "Jun", score: 91 },
  { month: "Jul", score: 87 },
  { month: "Aug", score: 90 },
  { month: "Sep", score: 84 },
  { month: "Oct", score: 80 },
  { month: "Nov", score: 78 },
  { month: "Dec", score: 86 },
];

const ppeViolationsData = [
  { name: "No Helmet", value: 2309 },
  { name: "No Gloves", value: 341 },
  { name: "No Shoes", value: 11 },
  { name: "No Goggles", value: 92 },
  { name: "Boots Not Worn", value: 52 },
];

const ppeDailyTrend = [
  { day: "Day 1", violations: 24 },
  { day: "Day 2", violations: 18 },
  { day: "Day 3", violations: 30 },
  { day: "Day 4", violations: 21 },
  { day: "Day 5", violations: 27 },
  { day: "Day 6", violations: 33 },
  { day: "Day 7", violations: 29 },
  { day: "Day 8", violations: 25 },
  { day: "Day 9", violations: 31 },
  { day: "Day 10", violations: 22 },
  { day: "Day 11", violations: 28 },
  { day: "Day 12", violations: 35 },
  { day: "Day 13", violations: 26 },
  { day: "Day 14", violations: 30 },
];

const failureSeverity = [
  { name: "Critical Failures", value: 41 },
  { name: "Non-Critical Failures", value: 143 },
];

const severityColors = ["#ef4444", "#60a5fa"];
const ppeColors = ["#1e3a8a", "#1d4ed8", "#3b82f6", "#93c5fd", "#bfdbfe"];

const DashboardView = () => {
  return (
    <div className="max-w-[1600px] mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-700 mb-6 border-b pb-3">
        Safety & Machine Quality Dashboard
      </h2>

      {/* ------- TOP METRICS ------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <MetricCard title="Total QC Failures (Monthly Avg)" value="56" />
        <MetricCard title="Critical Failures" value="41" />
        <MetricCard title="PPE Violations" value="2805+" />
        <MetricCard title="Avg Machine Health Score" value="86%" />
      </div>

      {/* ------- LARGE CHARTS ROW ------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card title="Monthly Machine QC Failures">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={machineFailuresMonthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="failures" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Machine Health Score Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={machineHealthTrend}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Line type="monotone" dataKey="score" stroke="#16a34a" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ------- PPE CHARTS ROW ------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card title="PPE Violations Breakdown">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ppeViolationsData}
                dataKey="value"
                outerRadius={110}
                label
              >
                {ppeViolationsData.map((entry, index) => (
                  <Cell key={index} fill={ppeColors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Daily PPE Violation Trend">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={ppeDailyTrend}>
              <defs>
                <linearGradient id="colorViolations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />

              <Area
                type="monotone"
                dataKey="violations"
                stroke="#2563eb"
                fillOpacity={1}
                fill="url(#colorViolations)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ------- CHECKPOINT FREQUENCIES & SEVERITY ------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Top Failed Machine Checkpoints">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={checkpointFrequency} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="checkpoint" width={140} />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Critical vs Non-Critical Machine Failures">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={failureSeverity}
                dataKey="value"
                outerRadius={110}
                label
              >
                {failureSeverity.map((entry, index) => (
                  <Cell key={index} fill={severityColors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

// ---------------- COMPONENTS ---------------- //

const Card = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
    <h3 className="text-lg font-semibold mb-4 text-gray-700">{title}</h3>
    {children}
  </div>
);

const MetricCard = ({ title, value }) => (
  <div className="bg-white p-5 rounded-xl shadow-md border text-center">
    <p className="text-gray-500 text-sm">{title}</p>
    <h3 className="text-3xl font-bold text-blue-600 mt-2">{value}</h3>
  </div>
);

export default DashboardView;
