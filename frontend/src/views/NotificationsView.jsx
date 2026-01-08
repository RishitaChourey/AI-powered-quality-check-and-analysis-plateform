// src/views/NotificationsView.jsx
import React, { useEffect, useState } from "react";
import { Bell, AlertTriangle, CheckCircle, X } from "lucide-react";
import Footer from ".//Footer"; // fixed import path

const NotificationsView = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await fetch("http://127.0.0.1:8000/api/notifications");
      const data = await res.json();
      setNotifications(data);
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    await fetch(`http://127.0.0.1:8000/api/notifications/${id}/read`, {
      method: "POST",
    });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-5xl mx-auto px-8 py-10 flex-grow">
        <h2 className="text-3xl font-bold text-gray-800 mb-10 flex items-center gap-3">
          <Bell className="text-blue-600" size={32} />
          Notifications
        </h2>

        <div className="space-y-6">
          {notifications.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-xl shadow-md border transition-all w-full
                ${
                  note.type === "ppe"
                    ? note.failed_items && note.failed_items.length > 0
                      ? "bg-purple-100 border-purple-300"
                      : "bg-purple-50 border-purple-200"
                    : note.type === "machine"
                    ? note.failed_items && note.failed_items.length > 0
                      ? "bg-yellow-100 border-yellow-300"
                      : "bg-yellow-50 border-yellow-200"
                    : "bg-gray-50 border-gray-200"
                }
              `}
            >
              {/* HEADER */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  {note.type === "machine" && (
                    <AlertTriangle className="text-yellow-600" />
                  )}
                  {note.type === "ppe" && (
                    <CheckCircle className="text-purple-600" />
                  )}
                  {note.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{note.time}</span>
                  <button onClick={() => markAsRead(note.id)}>
                    <X
                      className="text-gray-400 hover:text-gray-600"
                      size={18}
                    />
                  </button>
                </div>
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
              {note.failed_items && note.failed_items.length > 0 && (
                <div className="mt-3">
                  <p className="font-semibold text-red-700 mb-2">
                    Failed Checkpoints:
                  </p>
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
                — Monitoring System
              </p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotificationsView;