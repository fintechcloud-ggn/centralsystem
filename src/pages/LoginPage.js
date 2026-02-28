import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { setAdminToken, isAdminAuthenticated } from "../components/adminAuth";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const API_BASE_URL = "http://localhost:5001";

  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/login`,
        { email, password }
      );

      setAdminToken(response.data.token);
      toast.success("Login Successful");
      navigate("/admin", { replace: true });
    } catch (loginError) {
      const message =
        loginError?.response?.data?.error || "Invalid Email or Password";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      
      {/* LEFT SECTION */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#f4f6fb] items-center justify-center p-10">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold text-[#3b49df] mb-6">
            Admin Panel
          </h1>
          <p className="text-gray-600 mb-8">
            Control your fintech ecosystem with real-time insights and secure administration.
          </p>

          {/* Illustration Placeholder */}
          <img
            src="illustration.svg"
            alt="illustration"
            className="w-full"
          />
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex flex-1 items-center justify-center bg-[#cfd3f3] px-6 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          
          <h2 className="text-3xl font-bold text-[#3b49df] mb-2">
            Sign In
          </h2>
          <p className="text-gray-500 mb-8">
            to your Admin Panel
          </p>

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#3b49df]"
                required
              />
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#3b49df]"
                required
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            {/* Forgot */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-[#3b49df]"
              >
                Forgot password?
              </button>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full h-12 bg-[#3b49df] text-white rounded-lg font-semibold hover:bg-[#2f3bc7] transition"
            >
              Sign In
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;