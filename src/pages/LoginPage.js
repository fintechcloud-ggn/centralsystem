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
  const [currentSlide, setCurrentSlide] = useState(0);

  const API_BASE_URL = "http://localhost:5001";

  const slides = [
    "Illustration2.png",
    "Illustration3.svg",
    "illustration1.svg",
  ];

  // Redirect if already logged in
  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  // Auto Slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/login`, {
        email,
        password,
      });

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
    <div className="min-h-screen bg-[#cfe3d6] flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden flex">
        {/* LEFT SIDE - CAROUSEL */}
        <div className="hidden lg:flex w-1/2 bg-[#cfe3d6] items-center justify-center p-14 overflow-hidden">
          <div className="text-center max-w-md w-full">
            {/* Carousel */}
            <div className="relative w-full overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${currentSlide * 100}%)`,
                }}
              >
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    className="min-w-full flex items-center justify-center"
                  >
                    <img
                      src={slide}
                      alt={`slide-${index}`}
                      className="w-80 pointer-events-none select-none"
                      draggable="false"
                    />
                  </div>
                ))}
              </div>
            </div>

            <h2 className="text-3xl font-semibold text-[#1f2d2a] mt-8 mb-4">
              Admin Panel
            </h2>

            <p className="text-gray-600 text-sm leading-relaxed">
              Securely manage and monitor your system with powerful admin
              controls.
            </p>

            {/* Dots */}
            <div className="flex justify-center mt-8 space-x-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "bg-[#2f5d50] scale-110"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-1 items-center justify-center bg-white p-14">
          <div className="w-full max-w-md">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-semibold tracking-wide text-[#1f2d2a]">
                Fintech <span className="text-[#4a7c59]">Cloud</span>
              </h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Username
                </label>
                <input
                  type="email"
                  placeholder="Username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4a7c59]"
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#2f5d50] to-[#1f3d35] text-white rounded-lg font-semibold hover:opacity-90 transition"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
