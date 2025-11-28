// src/views/NotificationsView.jsx

import React from "react";
import { Bell, AlertTriangle, CheckCircle } from "lucide-react";

// ---- Random Time Generator ----
const getRandomTime = () => {
  const times = [
    "5 minutes ago",
    "12 minutes ago",
    "30 minutes ago",
    "1 hour ago",
    "2 hours ago",
    "3 hours ago",
    "Yesterday",
    "2 days ago",
    "3 days ago",
  ];
  return times[Math.floor(Math.random() * times.length)];
};

// ---- Notification Data ----
const notifications = [
  {
    title: "PPE Detection Completed",
    summary: { no_helmet: 2278, no_shoes: 8, no_goggles: 79, no_glove: 301, boots: 43 },
    message: "Please take immediate action to ensure workplace safety and compliance.",
    type: "danger",
    time: getRandomTime(),
  },
  {
    title: "PPE Detection Completed",
    summary: { no_helmet: 23, no_shoes: 1, no_glove: 35, no_goggles: 13, boots: 4 },
    message: "Please take immediate action to ensure workplace safety and compliance.",
    type: "warning",
    time: getRandomTime(),
  },
  {
    title: "Machine Checkpoint Failure",
    failed_items: [
      'CTR_CTY_CTB_sticker', 'R1_R2_R3_sticker', 'alarm_hooter', 'alternator_nameplate', 'battery',
      'battery_barcode', 'cable_entry_holes', 'combination_unit', 'control_panel_barcode',
      'control_panel_bidding', 'control_panel_knob', 'coolant_filling_cap', 'coolant_filling_pipe',
      'coolant_filling_sticker', 'coolant_tank', 'cpcb_sticker', 'danger_sticker',
      'do_and_dont_sticker', 'document_folder', 'door_bidding', 'door_handle', 'door_key',
      'door_stopper', 'earthing_stud', 'earthing_wire', 'efficient_power_sticker',
      'emergency_button', 'emergency_button_backside', 'engine_numberplate', 'exhaust_pipe',
      'foam_sheets', 'hinges', 'lifting_hook', 'mahindra_sticker', 'mcb_sticker',
      'ok_tested_fuel_tank', 'panel_number', 'panel_wiring_sticker', 'phone_number',
      'powerol_sticker', 'raingaurd', 'shyam_global_sticker', 'supply_to_load_sticker',
      'warning_sticker', 'water_oil_level_check_sticker', 'yellow_mark'
    ],
    summary: { genset_nameplate: 8 },
    message: "Please take immediate action to ensure workplace safety and compliance.",
    type: "danger",
    time: getRandomTime(),
  },
];

const NotificationsView = () => {
  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-10 flex items-center gap-3">
        <Bell className="text-blue-600" size={32} />
        Notifications
      </h2>

      <div className="space-y-6">
        {notifications.map((note, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl shadow-md border transition-all w-full
              ${
                note.type === "danger"
                  ? "bg-red-50 border-red-300"
                  : note.type === "warning"
                  ? "bg-yellow-50 border-yellow-300"
                  : "bg-green-50 border-green-300"
              }
            `}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                {note.type === "danger" && <AlertTriangle className="text-red-600" />}
                {note.type === "warning" && <AlertTriangle className="text-yellow-600" />}
                {note.type === "success" && <CheckCircle className="text-green-600" />}
                {note.title}
              </h3>

              <span className="text-sm text-gray-500">{note.time}</span>
            </div>

            {/* SUMMARY */}
            {note.summary && (
              <div className="mt-2 grid grid-cols-3 lg:grid-cols-5 gap-3 text-sm">
                {Object.entries(note.summary).map(([key, val]) => (
                  <div
                    key={key}
                    className="bg-white shadow-sm p-2 rounded border text-gray-700 text-center"
                  >
                    <p className="font-semibold">{key}</p>
                    <p className="text-lg font-bold">{val}</p>
                  </div>
                ))}
              </div>
            )}

            {/* FAILED CHECKPOINTS */}
            {note.failed_items && (
              <div className="mt-3">
                <p className="font-semibold text-red-700 mb-2">Failed Checkpoints:</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-2">
                  {note.failed_items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded border border-red-300"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MESSAGE */}
            <p className="mt-3 text-gray-700 text-sm">{note.message}</p>

            <p className="mt-1 text-right italic text-gray-500 text-xs">
              — PPE Monitoring System
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsView;
