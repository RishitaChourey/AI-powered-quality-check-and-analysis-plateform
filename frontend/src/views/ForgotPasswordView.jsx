import React, { useState } from 'react';

const ForgotPasswordView = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // --- MOCK DATABASE ACTION ---
    if (!email) {
      setError('Please enter a valid email address.');
    } else {
      setMessage(`A password reset link has been simulated and sent to ${email}. Redirecting to login...`);
      console.log(`Mock Password Reset for: ${email}`);
      setTimeout(() => onNavigate('Login'), 3000); 
    }
    // --- END MOCK DATABASE ACTION ---

    setLoading(false);
  };

  const RequestForm = () => (
    <form onSubmit={handleRequestReset} className="space-y-6">
      <h3 className="text-2xl font-bold mb-4 text-center">Forgot Your Password?</h3>
      <p className="text-center text-indigo-200 text-sm">
        Please enter the email address you'd like your password reset information sent to
      </p>

      {/* Email Input */}
      <div>
        <label htmlFor="reset-email" className="block text-lg font-medium mb-2">Enter email address:</label>
        <input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="email@example.com"
          required
        />
      </div>

      <div className="pt-4 text-center">
        <button
          type="submit"
          disabled={loading}
          className="bg-white text-indigo-700 py-2 px-6 rounded-lg font-bold shadow-xl hover:bg-indigo-100 transition disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Request reset link'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="flex justify-center items-center p-6 min-h-[60vh]">
      <div className="w-full max-w-md bg-indigo-700 text-white p-10 rounded-xl shadow-2xl">
        <RequestForm />
        
        {message && (
            <p className="text-green-300 text-center pt-4 font-bold">{message}</p>
        )}
        {error && (
            <p className="text-red-300 text-center pt-4">{error}</p>
        )}
        
        <div className="text-center mt-6">
          <button 
            onClick={() => onNavigate('Login')}
            className="text-white font-semibold underline hover:text-indigo-200 transition duration-150"
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordView;