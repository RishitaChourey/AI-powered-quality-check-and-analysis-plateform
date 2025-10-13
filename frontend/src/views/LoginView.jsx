import React, { useState } from 'react';

const LoginView = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // --- Client-side validations ---
    if (!email.includes('@gmail.com')) {
      setError('Email must be a valid @gmail.com address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        onLoginSuccess();
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center p-6 min-h-[60vh]">
      <div className="w-full max-w-md bg-indigo-700 text-white p-10 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-8 text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="login-email" className="block text-lg font-medium mb-2">
              Username/Email:
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Enter email address"
              required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-lg font-medium mb-2">
              Password:
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Enter password"
              required
            />
          </div>
          <div className="flex justify-between items-center text-sm">
            <button
              type="button"
              onClick={() => onNavigate('ForgotPassword')}
              className="text-white hover:text-indigo-200 transition duration-150"
            >
              Forget Password?
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-indigo-700 py-2 px-6 rounded-lg font-bold shadow-xl hover:bg-indigo-100 transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
          {error && <p className="text-red-300 text-center pt-2">{error}</p>}
        </form>
        <div className="text-center mt-6">
          <p>
            New member? 
            <button 
              onClick={() => onNavigate('Signup')}
              className="text-white font-semibold underline ml-1 hover:text-indigo-200 transition duration-150"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
