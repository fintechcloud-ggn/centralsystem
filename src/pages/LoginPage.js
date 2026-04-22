import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { setAdminToken, isAdminAuthenticated } from "../components/adminAuth";
import { apiUrl } from "../lib/api";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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
    if (isLoggingIn) return;

    setError("");
    setIsLoggingIn(true);

    try {
      const response = await axios.post(apiUrl("/api/admin/login"), {
        email,
        password,
      });

      setAdminToken(response.data.token);
      toast.success("Login Successful");
      navigate("/admin", { replace: true });
    } catch (loginError) {
      const responseError = loginError?.response?.data?.error;
      const message =
        typeof responseError === "string"
          ? responseError
          : responseError?.message || "Invalid Email or Password";
      setError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-[#f3f4f6] to-[#dbe7df] p-4 sm:p-6 2xl:p-10">
      {isLoggingIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center rounded-2xl border border-white/80 bg-white/90 px-8 py-7 text-center shadow-[0_20px_60px_rgba(31,45,42,0.18)]">
            <span className="h-12 w-12 animate-spin rounded-full border-4 border-[#cfe3d6] border-t-[#2f5d50]" />
            <p className="mt-4 text-base font-semibold text-[#1f2d2a]">
              Signing you in...
            </p>
            <p className="mt-1 text-sm text-slate-500">Please wait</p>
          </div>
        </div>
      )}
      <div className="mx-auto flex min-h-[min(620px,calc(100dvh-2rem))] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] sm:rounded-3xl 2xl:max-w-6xl">
        {/* LEFT SIDE - CAROUSEL */}
        <div className="hidden w-1/2 items-center justify-center overflow-hidden bg-[#cfe3d6] p-8 lg:flex xl:p-14">
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
                      className="w-full max-w-80 pointer-events-none select-none"
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
        <div className="flex flex-1 items-center justify-center bg-white p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center sm:mb-12">
              <h1 className="text-3xl font-semibold tracking-wide text-[#1f2d2a] sm:text-4xl">
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
                  disabled={isLoggingIn}
                  className="w-full h-12 px-4 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4a7c59] disabled:cursor-not-allowed disabled:opacity-70"
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
                  disabled={isLoggingIn}
                  className="w-full h-12 px-4 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4a7c59] disabled:cursor-not-allowed disabled:opacity-70"
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#2f5d50] to-[#1f3d35] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-80"
              >
                {isLoggingIn && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {isLoggingIn ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
