// src/views/LandingPage.jsx
import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Footer from ".//Footer";

const LandingPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-gray-50">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          AI-Powered Safety Monitoring
        </h1>
        <p className="text-lg text-gray-800 max-w-2xl mx-auto">
          Bridging the gap between manual safety checks and fully autonomous
          industrial monitoring. Real-time responsiveness, industrial-scale
          accuracy.
        </p>
        {/* Hero Image Placeholder */}
        <div className="mt-8 bg-blue-100 h-64 flex items-center justify-center rounded-lg overflow-hidden">
            <img
                src="/hero1.jpeg"
                alt="Factory safety monitoring"
                className="h-full w-full object-cover"
            />
        </div>

      </section>

      {/* Why PPE Matters */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-teal-600 mb-4">
          Why PPE Matters
        </h2>
        <p className="text-gray-800 leading-relaxed">
          Personal Protective Equipment is the frontline of workplace safety.
          Helmets, gloves, vests, and goggles aren’t just compliance items —
          they’re what stand between workers and hazards. A safe workforce is a
          productive workforce, and PPE is the foundation of that safety
          culture.
        </p>
      </section>

      {/* AI-Powered Safety Checks */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-teal-600 mb-4">
          AI-Powered Safety Checks
        </h2>
        <p className="text-gray-800 leading-relaxed">
          Our platform brings automation and intelligence to industrial
          monitoring. With computer vision and real-time analytics, machinery
          and worker interactions are continuously observed. Early signs of
          failure or unsafe behavior are flagged instantly, reducing downtime
          and preventing accidents before they happen.
        </p>
      </section>

      {/* Features Carousel */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-teal-600 mb-6">
          Salient Features
        </h2>
        <Carousel
          showThumbs={false}
          infiniteLoop
          autoPlay
          interval={4000}
          showStatus={false}
        >
          <div className="p-6 bg-blue-50 rounded-lg">
            <h3 className="text-xl font-bold text-blue-600 mb-2">
              Real-time Monitoring
            </h3>
            <p className="text-gray-700">25–30 FPS with YOLOv11 + DeepSORT</p>
            <div className="mt-4 bg-gray-200 h-48 flex items-center justify-center rounded-lg overflow-hidden">
                <img
                    src="/yolo.jpg"
                    alt="Factory safety monitoring"
                    className="h-full w-full object-cover"
                />
                </div>
          </div>
          <div className="p-6 bg-blue-50 rounded-lg">
            <h3 className="text-xl font-bold text-blue-600 mb-2">
              Multi-Camera Coverage
            </h3>
            <p className="text-gray-700">
              Parallel monitoring across factory zones
            </p>
            <div className="mt-4 bg-gray-200 h-48 flex items-center justify-center rounded-lg">
              <img
                    src="/cctv.jpg"
                    alt="Factory safety monitoring"
                    className="h-full w-full object-cover"
                />
            </div>
          </div>
          <div className="p-6 bg-blue-50 rounded-lg">
            <h3 className="text-xl font-bold text-blue-600 mb-2">
              Worker Tracking
            </h3>
            <p className="text-gray-700">
              Up to 20 identities tracked simultaneously
            </p>
            <div className="mt-4 bg-gray-200 h-48 flex items-center justify-center rounded-lg">
              <img
                    src="/worker.png"
                    alt="Factory safety monitoring"
                    className="h-full w-full object-cover"
                />
            </div>
          </div>
        </Carousel>
      </section>

      {/* Operational Impact */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-teal-600 mb-4">
          Operational Impact
        </h2>
        <p className="text-gray-800 leading-relaxed">
          Instant violation alerts, predictive maintenance, and reduced downtime
          combine to create safer, smarter industrial ecosystems. By minimizing
          human error and maximizing responsiveness, the system delivers
          accuracy, speed, and scalability where it matters most.
        </p>
      </section>
      <Footer/>
    </div>
  );
};

export default LandingPage;