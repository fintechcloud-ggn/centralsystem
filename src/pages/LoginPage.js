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
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/login`, {
        email,
        password
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
  <div className="relative min-h-screen overflow-hidden bg-[#87A9DC] flex items-center justify-center px-4 py-8">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute -left-32 top-0 h-[55%] w-[75%] bg-[#95B4E3] rotate-[-24deg] origin-top-left opacity-80" />
      <div className="absolute -right-24 bottom-[-120px] h-[55%] w-[70%] bg-[#9AB8E7] rotate-[-24deg] origin-bottom-right opacity-80" />
    </div>

    <div className="relative w-full max-w-[420px] rounded-2xl bg-[#243D69]/95 border border-[#35558d] shadow-[0_24px_40px_rgba(13,28,54,0.45)] backdrop-blur-sm px-6 md:px-8 py-7 md:py-9">
      <h2 className="text-center text-white text-3xl md:text-4xl font-light tracking-[0.15em] mb-9">
        ADMIN LOGIN
      </h2>

      <form className="space-y-5" onSubmit={handleLogin}>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Username"
            className="w-full h-12 rounded-lg bg-white text-[#1f2937] placeholder:text-[#6b7280] text-base px-4 pr-12 border border-[#57a978] focus:outline-none focus:ring-2 focus:ring-[#9fe1b8]"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d9f1e2] text-lg">
            &#128100;
          </span>
        </div>

        <div className="relative">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full h-12 rounded-lg bg-white text-[#1f2937] placeholder:text-[#6b7280] text-base px-4 pr-12 border border-[#57a978] focus:outline-none focus:ring-2 focus:ring-[#9fe1b8]"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d9f1e2] text-lg">
            &#128274;
          </span>
        </div>

        <div className="text-right -mt-1">
          <button
            type="button"
            className="text-[#dff3e6] text-sm hover:text-white transition-colors"
          >
            Forget Password
          </button>
        </div>

        {error && (
          <p className="text-red-300 text-sm font-medium">{error}</p>
        )}

        <button
          type="submit"
          className="mt-2 h-11 w-28 bg-[#4B75B6] text-white text-base rounded-lg hover:bg-[#5b88ce] transition-colors"
        >
          Login
        </button>
      </form>
    </div>
  </div>
);
}

export default Login;
