import React, { useState } from 'react';

// Components
import Header from './components/Header';
import TitleBanner from './components/TitleBanner';
import PPEDetectionView from './views/PPEDetectionView';

// Views
import LoginView from './views/LoginView';
import SignupView from './views/SignupView';
import ForgotPasswordView from './views/ForgotPasswordView';
import HomeView from './views/HomeView';

const App = () => {
  const [currentPage, setCurrentPage] = useState('Login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentPage('Home');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    if (page !== 'CheckPage') {
      setCheckType(null);
    }
  };

const handleSelectCheck = (type) => {
  if (type === 'PPE') {
    setCurrentPage('PPE'); // Go to PPEDetectionView
  } else {
    setCheckType(type);    // For other check types
    setCurrentPage('CheckPage');
  }
};
  
  // --- Render Content based on Auth State and Page ---
  
  };

  let content;

  // Render Authentication Views or public About View if not logged in
  if (!isLoggedIn || ['Login', 'Signup', 'ForgotPassword', 'About'].includes(currentPage)) {
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
            // Ensure that if the user somehow lands on a non-auth page while logged out, they are redirected to Login
            if (isLoggedIn === false && currentPage !== 'Login' && currentPage !== 'About') {
                content = <LoginView onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
            } else {
                 content = <LoginView onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
            }
            break;
      }
  } else {
      // Render Application Views if logged in
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
            content = <AboutView onNavigate={handleNavigate} />; // Logged in About view
            break;
        case 'PPE':
            content = <PPEDetectionView />;
            break;
        case 'Home':
        default:
          content = <HomeView onSelectCheck={handleSelectCheck} />;
          break;
      }
  switch (currentPage) {
    case 'Signup':
      content = <SignupView onNavigate={handleNavigate} />;
      break;
    case 'ForgotPassword':
      content = <ForgotPasswordView onNavigate={handleNavigate} />;
      break;
    case 'Home':
      content = <HomeView />;
      break;
    case 'Login':
    default:
      content = <LoginView onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
      break;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {content}
    </div>
  );
};

export default App;
