import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/verify-otp?email=${email}&otp=${otp}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Verification failed");
      } else {
        alert("Email verified successfully!");
        navigate("/login");
      }
    } catch {
      setError("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleVerify}
        className="bg-indigo-700 text-white p-8 rounded-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6">
          Verify Email
        </h2>

        <input
          type="email"
          value={email}
          readOnly
          className="w-full p-3 mb-4 rounded text-gray-700"
        />

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-3 mb-4 rounded text-gray-700"
          required
        />

        {error && <p className="text-red-300 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-indigo-700 font-bold py-2 rounded"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
};

export default VerifyOtp;
