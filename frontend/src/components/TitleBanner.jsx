// src/components/TitleBanner.jsx
import React from "react";

const TitleBanner = () => (
  <section className="relative h-[600px] w-full overflow-hidden">
    {/* Background image fills entire banner */}
    <img
      src="/hero1.jpeg"
      alt="Factory safety monitoring"
      className="absolute inset-0 h-full w-full object-cover"
    />

    {/* Diagonal overlay on top of image */}
    <div
      className="absolute top-0 left-0 h-full w-2/3 flex flex-col justify-end items-start p-12 text-left text-white"
      style={{
        backgroundColor: "#1e3a8a",
        clipPath: "polygon(0 0, 100% 0, 80% 100%, 0% 100%)",
      }}
    >
      <h2 className="text-6xl md:text-7xl font-extrabold text-gray-200 mb-6">
        Surveillance & Quality Assurance Hub
      </h2>
      <p className="max-w-lg text-xl text-white mb-12">
        Smart AI-powered monitoring for machines, safety compliance, and workplace efficiency.
      </p>
    </div>
  </section>
);

export default TitleBanner;