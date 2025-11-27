import React from 'react';
import { Mail, Shield, Zap, Info, Cpu, Camera, Bell, CheckCircle2 } from 'lucide-react';

const AboutView = ({ onNavigate }) => {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white p-8 sm:p-12 rounded-xl shadow-2xl">

        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-indigo-700 mb-4 flex items-center justify-center">
            <Info className="w-10 h-10 mr-3" />
            About TEIM
          </h1>
          <p className="text-xl text-gray-600">
            The Entrepreneur In Me – Driving AI Innovation Across Industries
          </p>
        </header>

        <section className="space-y-10">

          {/* Mission */}
          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6 p-6 bg-indigo-50 rounded-lg border-l-4 border-indigo-500 shadow-sm">
            <Zap className="w-10 h-10 text-indigo-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Who We Are</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                <strong>TEIM (The Entrepreneur In Me)</strong> is a visionary initiative dedicated to
                fostering innovative AI-driven solutions across industries. We develop multiple projects
                that leverage cutting-edge technology for enhanced operational efficiency, safety, and quality assurance.
              </p>
            </div>
          </div>

          {/* This Project */}
          <div className="p-6 bg-gray-50 rounded-lg border shadow-sm">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              This Project – AI Safety & Quality Platform
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              One of TEIM’s AI initiatives focuses on industrial safety and machine quality monitoring.
              The platform provides:
            </p>
            <ul className="list-disc ml-6 text-gray-700 space-y-2 text-lg">
              <li>Automated PPE detection and compliance monitoring for workers</li>
              <li>Machine quality checkpoint verification across 40+ visual indicators</li>
              <li>Real-time alerts for missing components, safety breaches, and anomalies</li>
              <li>Detailed inspection dashboards with summary reports, trends, and failure logs</li>
            </ul>
          </div>

          {/* Technology Stack */}
          <div className="p-6 bg-gray-50 rounded-lg border shadow-sm">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
              <Cpu className="w-7 h-7 mr-3 text-purple-600" />
              Technology Behind the Platform
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
              <li className="p-4 bg-white rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-800">YOLOv11 Object Detection</h3>
                <p className="text-sm">Detects PPE and machine checkpoints in real-time video.</p>
              </li>
              <li className="p-4 bg-white rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-800">DeepSORT Tracking</h3>
                <p className="text-sm">Tracks workers and objects through the workflow.</p>
              </li>
              <li className="p-4 bg-white rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-800">Custom Vision Models</h3>
                <p className="text-sm">Trained for industry-specific machinery and safety standards.</p>
              </li>
              <li className="p-4 bg-white rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-800">Real-Time Analytics</h3>
                <p className="text-sm">Fast GPU-powered analysis for immediate insights and alerts.</p>
              </li>
            </ul>
          </div>

          {/* Platform Capabilities */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4 border-b pb-2">Platform Capabilities</h2>
            <ul className="space-y-6">

              <li className="flex items-start">
                <Shield className="w-7 h-7 text-green-600 mt-1 flex-shrink-0 mr-4" />
                <div>
                  <h3 className="text-2xl font-semibold text-gray-700">PPE Compliance Monitoring</h3>
                  <p className="text-gray-600">
                    Detects helmets, gloves, vests, goggles, and boots with violation alerts.
                  </p>
                </div>
              </li>

              <li className="flex items-start">
                <Camera className="w-7 h-7 text-indigo-600 mt-1 flex-shrink-0 mr-4" />
                <div>
                  <h3 className="text-2xl font-semibold text-gray-700">Machine Quality Verification</h3>
                  <p className="text-gray-600">
                    Validates stickers, wiring, panel assembly, leaks, and other critical checkpoints.
                  </p>
                </div>
              </li>

              <li className="flex items-start">
                <Bell className="w-7 h-7 text-red-600 mt-1 flex-shrink-0 mr-4" />
                <div>
                  <h3 className="text-2xl font-semibold text-gray-700">Real-Time Alerts</h3>
                  <p className="text-gray-600">
                    Notifies operators immediately for failed checkpoints or safety risks.
                  </p>
                </div>
              </li>

              <li className="flex items-start">
                <CheckCircle2 className="w-7 h-7 text-blue-600 mt-1 flex-shrink-0 mr-4" />
                <div>
                  <h3 className="text-2xl font-semibold text-gray-700">Automated Reporting</h3>
                  <p className="text-gray-600">
                    Generates dashboards, failure summaries, PPE violation stats, and compliance trends.
                  </p>
                </div>
              </li>

            </ul>
          </div>

          {/* Workflow */}
          <div className="p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500 shadow-sm">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">How It Works</h2>
            <ol className="list-decimal ml-6 text-lg text-gray-700 space-y-2">
              <li>Upload video or connect a live camera feed.</li>
              <li>YOLOv11 detects PPE and machine checkpoints in each frame.</li>
              <li>DeepSORT tracks objects and workers across time.</li>
              <li>The system identifies violations, missing components, and anomalies.</li>
              <li>Results are visualized in the dashboard with real-time alerts and reports.</li>
            </ol>
          </div>

          {/* Contact */}
          <div className="text-center pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-indigo-700 mb-3">Get Started</h3>
            <p className="text-gray-600 mb-4">
              Explore this project and other AI innovations developed by TEIM.
            </p>
            <button
              onClick={() => onNavigate('Login')}
              className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
            >
              Go to Login
            </button>
          </div>

        </section>
      </div>
    </div>
  );
};

export default AboutView;