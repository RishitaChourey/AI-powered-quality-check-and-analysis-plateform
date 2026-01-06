// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import Header from './components/Header';
import TitleBanner from './components/TitleBanner';

// Views
import HomeView from './views/HomeView';
import DashboardView from './views/DashboardView';
import NotificationsView from './views/NotificationsView';
import AboutView from './views/AboutView';
import PPEDetectionView from './views/PPEDetectionView';
import MachineDetectionView from './views/MachineDetectionView';
import LandingPage from "./views/LandingPage";

// Authentication Views
import LoginView from './views/LoginView';
import SignupView from './views/SignupView';
import ForgotPasswordView from './views/ForgotPasswordView';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div className='min-h-screen bg-gray-50 font-sans'>
        <Header
          user={user}
          isAuthenticated={isLoggedIn}
          onLogout={handleLogout}
        />
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <TitleBanner />
          <div className='pb-12'>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route
                path='/login'
                element={
                  isLoggedIn ? <Navigate to='/home' /> : (
                    <LoginView onLoginSuccess={handleLoginSuccess} />
                  )
                }
              />
              <Route path='/signup' element={<SignupView />} />
              <Route path='/forgot-password' element={<ForgotPasswordView />} />
              <Route path='/about' element={<AboutView />} />

              {/* Protected Routes */}
              <Route
                path='/home'
                element={isLoggedIn ? <HomeView /> : <Navigate to='/' />}
              />
              <Route
                path='/dashboard'
                element={isLoggedIn ? <DashboardView /> : <Navigate to='/' />}
              />
              <Route
                path='/notifications'
                element={isLoggedIn ? <NotificationsView /> : <Navigate to='/' />}
              />
              <Route
                path='/home/ppe'
                element={isLoggedIn ? <PPEDetectionView /> : <Navigate to='/' />}
              />
              <Route
                path='/home/machine'
                element={isLoggedIn ? <MachineDetectionView /> : <Navigate to='/' />}
              />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};
export default App;