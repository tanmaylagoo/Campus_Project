import React, { useState } from "react";
import { User, Store, Eye, EyeOff, Utensils } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  // Backend expects 'customer' or 'admin'
  const [role, setRole] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  
  // Form States - updated to match backend 'username'
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        username, 
        email,
        password,
        role      
      }, {
        // Important if you are setting secure httpOnly cookies from backend
        withCredentials: true 
      });
      
      // 1. Save Token and User Data to localStorage (Auto-login)
      if(response.data.token) {
         localStorage.setItem("token", response.data.token);
      }
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // 2. Redirect straight to dashboard based on backend 'role'
      if (response.data.user.role === "admin") {
        navigate("/admin-dashboard"); 
      } else {
        navigate("/menu"); 
      }

    } catch (err) {
      // Safely handle errors sent from your express-validator array or custom messages
      if (err.response?.data?.errors) {
        setError(err.response.data.errors[0].msg);
      } else {
        setError(err.response?.data?.message || "Something went wrong during registration.");
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
            Create your account
          </h1>
          <p className="text-sm text-[#817d78]">
            Get started with automated canteen bookings
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role */}
          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-[#242424] mb-2">
              I want to use CanteenHub as:
            </label>
            <div className="grid grid-cols-2 h-[46px] p-[3px] rounded-[11px] border border-[#e5e2de] bg-[#faf9f7]">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`rounded-[8px] flex items-center justify-center gap-2 text-[13px] transition-all ${
                  role === "customer"
                    ? "bg-white text-[#222] font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
                    : "text-[#817d78] font-medium"
                }`}
              >
                <User size={17} className={role === "customer" ? "text-[#ff7a18]" : "text-[#817d78]"} />
                Hungry Eater
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`rounded-[8px] flex items-center justify-center gap-2 text-[13px] transition-all ${
                  role === "admin"
                    ? "bg-white text-[#222] font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
                    : "text-[#817d78] font-medium"
                }`}
              >
                <Store size={17} className={role === "admin" ? "text-[#ff7a18]" : "text-[#817d78]"} />
                Kitchen Admin
              </button>
            </div>
          </div>

          {/* Username */}
          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-[#242424] mb-2">Username</label>
            <input
              type="text"
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="alexrivera"
              className="w-full h-[46px] px-3.5 rounded-[11px] border border-[#e4e1dd] bg-[#faf9f7] text-sm outline-none placeholder:text-[#aaa6a1] focus:bg-white focus:border-[#14805f] focus:ring-[3px] focus:ring-[#14805f]/10"
            />
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-[#242424] mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full h-[46px] px-3.5 rounded-[11px] border border-[#e4e1dd] bg-[#faf9f7] text-sm outline-none placeholder:text-[#aaa6a1] focus:bg-white focus:border-[#14805f] focus:ring-[3px] focus:ring-[#14805f]/10"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-[13px] font-semibold text-[#242424] mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
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

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[47px] rounded-[11px] bg-[#14805f] text-white text-sm font-semibold shadow-[0_5px_15px_rgba(20,128,95,0.14)] hover:bg-[#106d50] hover:-translate-y-[1px] transition-all disabled:opacity-70"
          >
            {loading ? "Creating Account..." : "Create Free Account"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-5 text-[13px] text-[#817d78]">
          Already have an account?
          <Link to="/login" className="ml-1 text-[#ff7a18] font-semibold hover:underline">
            Log In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;