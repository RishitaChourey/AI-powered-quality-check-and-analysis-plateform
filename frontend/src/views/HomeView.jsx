// src/views/HomeView.jsx
import React from 'react';

/**
 * Card Component for selecting checks
 */
const Card = ({ title, image, type, onSelectCheck }) => (
  <button
    onClick={() => onSelectCheck(type)}
    className="w-full max-w-2xl mx-auto mb-8 transform transition duration-300 hover:scale-[1.02] hover:shadow-2xl rounded-xl overflow-hidden shadow-xl"
  >
    <div className="flex flex-col md:flex-row bg-white border-4 border-indigo-700 rounded-xl">
      <div className="w-full md:w-1/3 p-2 bg-white rounded-l-lg flex items-center justify-center overflow-hidden">
        <img
          src={image}
          alt={title}
          className="rounded-lg object-cover w-full h-40 md:h-full"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/200x150/e0e7ff/3730a3?text=${type}`;
          }}
        />
      </div>
      <div className="w-full md:w-2/3 bg-indigo-700 text-white p-6 flex items-center justify-center rounded-r-lg">
        <h3 className="text-2xl font-bold tracking-wider">{title}</h3>
      </div>
    </div>
  </button>
);

/**
 * Home Page View
 */
const HomeView = ({ onSelectCheck }) => {
  return (
    <div className="pt-8 space-y-8">
      <Card
        title="Machine Quality Check"
        type="Machine"
        image="https://placehold.co/400x300/e0e7ff/3730a3?text=Machine+Image"
        onSelectCheck={onSelectCheck}
      />
      <Card
        title="PPE Checking"
        type="PPE"
        image="https://placehold.co/400x300/e0e7ff/3730a3?text=PPE+Image"
        onSelectCheck={onSelectCheck}
      />
    </div>
  );
};

export default HomeView;
