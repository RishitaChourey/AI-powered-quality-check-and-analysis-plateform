// src/components/Footer.jsx
import React from "react";

const Footer = () => (
  <footer className="bg-indigo-50 border-t border-indigo-200 py-6 text-center">
    <p className="text-sm text-gray-600">
      © {new Date().getFullYear()} <span className="font-semibold text-indigo-700">
        Surveillance & Quality Assurance
      </span> — All Rights Reserved.
    </p>
  </footer>
);

export default Footer;