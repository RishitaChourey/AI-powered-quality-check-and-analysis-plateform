import React, { useState } from 'react';

// Components
import Header from './components/Header';
import TitleBanner from './components/TitleBanner';

// Views
import HomeView from './views/HomeView';
import DashboardView from './views/DashboardView';
import NotificationsView from './views/NotificationsView';
import CheckView from './views/CheckView';
import AboutView from './views/AboutView'; // Import new About View

// Authentication Views
import LoginView from './views/LoginView';
import SignupView from './views/SignupView';
import ForgotPasswordView from './views/ForgotPasswordView';

/**
 * Main App Component: Handles routing and local authentication state.
 */
const App = () => {
  // Start on Login page
  const [currentPage, setCurrentPage] = useState('Login'); 
  const [checkType, setCheckType] = useState(null); 
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Local authentication state

  // Navigate to Home upon successful login
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentPage('Home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('Login');
  };

  // Navigation Handlers
  const handleNavigate = (page) => {
    // If not logged in, only allow Auth and About pages
    if (!isLoggedIn && !['Login', 'Signup', 'ForgotPassword', 'About'].includes(page)) {
        setCurrentPage('Login');
        return;
    }
    setCurrentPage(page);
    if (page !== 'CheckPage') {
      setCheckType(null);
    }
  };

  const handleSelectCheck = (type) => {
    setCheckType(type);
    setCurrentPage('CheckPage');
  };
  
  // --- Render Content based on Auth State and Page ---
  
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
        case 'Home':
        default:
          content = <HomeView onSelectCheck={handleSelectCheck} />;
          break;
      }
  }

  const isAuthView = ['Login', 'Signup', 'ForgotPassword'].includes(currentPage);
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header 
        onNavigate={handleNavigate} 
        currentPage={currentPage} 
        checkType={checkType} 
        user={null} // Mock user for now
        isAuthenticated={isLoggedIn}
        onLogout={handleLogout}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Only show TitleBanner if not on an auth/about page */}
        {!isAuthView && currentPage !== 'About' && <TitleBanner />} 
        <div className="pb-12">
          {content}
        </div>
      </main>
    </div>
  );
};

export default App;