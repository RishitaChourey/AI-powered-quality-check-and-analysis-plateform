import React, { useState } from 'react';

// Components
import Header from './components/Header';
import TitleBanner from './components/TitleBanner';

// Views
import LoginView from './views/LoginView';
import SignupView from './views/SignupView';
import ForgotPasswordView from './views/ForgotPasswordView';
import HomeView from './views/HomeView';
import PPEDetectionView from './views/PPEDetectionView';
import CheckView from './views/CheckView';
import DashboardView from './views/DashboardView';
import NotificationsView from './views/NotificationsView';
import AboutView from './views/AboutView';

const App = () => {
const [isLoggedIn, setIsLoggedIn] = useState(true);
const [currentPage, setCurrentPage] = useState('Home');
  const [checkType, setCheckType] = useState(null);

  // Handle successful login
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentPage('Home');
  };

  // Handle navigation between pages
  const handleNavigate = (page) => {
    setCurrentPage(page);
    if (page !== 'CheckPage') {
      setCheckType(null);
    }
  };

  // Handle selection of different check types
  const handleSelectCheck = (type) => {
    if (type === 'PPE') {
      setCurrentPage('PPE'); // Go to PPEDetectionView
    } else {
      setCheckType(type);
      setCurrentPage('CheckPage');
    }
  };

  // --- Render Content based on Auth State and Page ---
  let content;

  if (!isLoggedIn || ['Login', 'Signup', 'ForgotPassword', 'About'].includes(currentPage)) {
    // Public or Auth views
    switch (currentPage) {
      case 'Signup':
        content = <SignupView onNavigate={handleNavigate} />;
        break;
      case 'ForgotPassword':
        content = <ForgotPasswordView onNavigate={handleNavigate} />;
        break;
      case 'About':
        content = <AboutView onNavigate={handleNavigate} />;
        break;
      case 'Login':
      default:
        content = (
          <LoginView
            onNavigate={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
          />
        );
        break;
    }
  } else {
    // Authenticated views
    switch (currentPage) {
      case 'Dashboard':
        content = <DashboardView />;
        break;
      case 'Notifications':
        content = <NotificationsView />;
        break;
      case 'CheckPage':
        content = <CheckView checkType={checkType} />;
        break;
      case 'About':
        content = <AboutView onNavigate={handleNavigate} />;
        break;
      case 'PPE':
        content = <PPEDetectionView />;
        break;
      case 'Home':
      default:
        content = <HomeView onSelectCheck={handleSelectCheck} />;
        break;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Optional header and banner for logged-in users */}
      {isLoggedIn && <Header onNavigate={handleNavigate} />}
      {isLoggedIn && <TitleBanner />}
      {content}
    </div>
  );
};

export default App;
