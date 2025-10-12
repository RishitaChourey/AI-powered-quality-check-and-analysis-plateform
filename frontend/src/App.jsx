import React, { useState } from 'react';

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
  };

  let content;
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
