import React, { useState } from "react";
import { Eye, EyeOff, Utensils } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password
      }, {
        // Important if you are setting secure httpOnly cookies from backend
        withCredentials: true 
      });

      // 1. Save Token and User Data to localStorage 
      // (Even though cookies are used, keeping it here helps frontend routing checks)
      if(response.data.token) {
         localStorage.setItem("token", response.data.token);
      }
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // 2. Redirect based on backend 'role'
      if (response.data.user.role === "admin") {
        navigate("/admin-dashboard"); 
      } else {
        navigate("/menu"); 
      }
      
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors[0].msg);
      } else {
        setError(err.response?.data?.message || "Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 bg-[#f7f5f1]">
      <div className="w-full max-w-md bg-white rounded-[20px] border border-[#eeeae5] px-9 py-10 shadow-[0_8px_30px_rgba(30,30,30,0.04)]">
        
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-[30px] h-[30px] rounded-[5px] bg-[#14805f] text-white flex items-center justify-center">
            <Utensils size={19} />
          </div>
          <span className="text-[19px] font-bold text-[#172033]">CanteenHub</span>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-[27px] leading-tight font-bold text-[#1d1d1d] mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-[#817d78]">
            Log in to order fresh meals from your canteen
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-[#242424] mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full h-[46px] px-3.5 rounded-[11px] border border-[#e4e1dd] bg-[#faf9f7] text-sm outline-none placeholder:text-[#aaa6a1] focus:bg-white focus:border-[#14805f] focus:ring-[3px] focus:ring-[#14805f]/10"
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="block text-[13px] font-semibold text-[#242424] mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full h-[46px] px-3.5 pr-11 rounded-[11px] border border-[#e4e1dd] bg-[#faf9f7] text-sm outline-none placeholder:text-[#aaa6a1] focus:bg-white focus:border-[#14805f] focus:ring-[3px] focus:ring-[#14805f]/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77736e] hover:text-[#333]"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between mt-1 mb-5">
            <label className="flex items-center gap-2 text-xs text-[#817d78] cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-[#ff7a18] cursor-pointer"
              />
              Remember me
            </label>
            <button type="button" className="text-xs text-[#ff7a18] hover:underline">
              Forgot password?
            </button>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[47px] rounded-[11px] bg-[#14805f] text-white text-sm font-semibold shadow-[0_5px_15px_rgba(20,128,95,0.14)] hover:bg-[#106d50] hover:-translate-y-[1px] transition-all disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Log In to Dashboard"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-5 text-[13px] text-[#817d78]">
          Don't have an account?
          <Link to="/register" className="ml-1 text-[#ff7a18] font-semibold hover:underline">
            Register
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;