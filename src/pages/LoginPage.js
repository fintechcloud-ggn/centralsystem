import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Fixed Admin
  const ADMIN_EMAIL = "admin@fintech.com";
  const ADMIN_PASSWORD = "admin123";

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      toast.success("Login Successful");
      navigate("/admin");  
    } else {
      setError("Invalid Email or Password");
    }
  };

return (
  <div className="flex min-h-screen">

    {/* Left Image Section */}
    <div 
      className="w-2/3 bg-cover bg-center"
      style={{ backgroundImage: `url("/Login.png")` }}
    ></div>

    {/* Right Login Section */}
    <div className="w-3/5 flex items-center justify-end pr-32 bg-opacity-90">
      <div className="bg-white w-96 p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6">
          Fintech Cloud
        </h2>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-gray-600 text-sm mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
);
}

export default Login;