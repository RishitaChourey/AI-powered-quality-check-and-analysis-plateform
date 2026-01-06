// src/views/HomeView.jsx
import React from "react";
import { CheckCircle, Shield, Cpu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from ".//Footer"; 

const Card = ({ title, image, type, route }) => {
  const navigate = useNavigate(); // CHANGED: use navigate instead of onSelectCheck
  return (
    <button
      onClick={() => navigate(route)} // CHANGED: navigate using route prop
      className="w-full max-w-2xl mx-auto transform transition duration-300 
                 hover:scale-[1.03] hover:shadow-xl rounded-2xl overflow-hidden 
                 shadow-lg bg-white h-56"
    >
      <div className="flex flex-row h-full border-2 border-indigo-700 rounded-2xl">

        {/* Image Section */}
        <div className="w-1/3 bg-white h-full flex items-center justify-center overflow-hidden">
          <img
            src={image}
            alt={title}
            className="object-cover w-full h-full"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://placehold.co/300x300/e0e7ff/3730a3?text=${type}`;
            }}
          />
        </div>

        {/* Text Section */}
        <div className="w-2/3 bg-indigo-700 text-white p-6 flex justify-center items-center">
          <h3 className="text-2xl font-bold tracking-wider text-center">{title}</h3>
        </div>
      </div>
    </button>
  );
};

const HomeView = () => { // CHANGED: removed onSelectCheck prop
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-white to-indigo-50">

      {/* Cards Section */}
      <div className="pt-16 flex flex-col items-center space-y-10 pb-10">
        <Card
          title="Machine Quality Check"
          type="Machine"
          image="/checklist.jpg"
          route="/home/machine" // CHANGED: added route prop
        />

        <Card
          title="Employee Safety Check"
          type="PPE"
          image="/safetykit.jpg"
          route="/home/ppe" // CHANGED: added route prop
        />
      </div>

      {/* Features Section */}
      <section className="py-14 bg-white shadow-inner">
        <h2 className="text-center text-3xl font-bold text-indigo-800 mb-10">
          Why Choose Our System?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 md:px-20">

          <div className="bg-indigo-50 p-6 rounded-2xl shadow hover:shadow-lg transition">
            <Cpu className="w-12 h-12 text-indigo-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-center">AI-Powered Analytics</h3>
            <p className="text-gray-600 text-center mt-2">
              Detect faults, patterns, and anomalies instantly using machine learning.
            </p>
          </div>

          <div className="bg-indigo-50 p-6 rounded-2xl shadow hover:shadow-lg transition">
            <Shield className="w-12 h-10 text-indigo-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-center">Improved Workplace Safety</h3>
            <p className="text-gray-600 text-center mt-2">
              Monitor PPE compliance to ensure employee safety at all times.
            </p>
          </div>

          <div className="bg-indigo-50 p-6 rounded-2xl shadow hover:shadow-lg transition">
            <CheckCircle className="w-12 h-12 text-indigo-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-center">Reliable Quality Checks</h3>
            <p className="text-gray-600 text-center mt-2">
              Maintain consistent machine performance and reduce downtime.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomeView;