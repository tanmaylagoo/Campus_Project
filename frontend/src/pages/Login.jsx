
import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Utensils
} from "lucide-react";
import {
  useNavigate,
  Link
} from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      newErrors.email = "Enter a valid email address";
    }

    if (password === "") {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password =
        "Password must contain at least 8 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          email,
          password
        },
        {
          withCredentials: true
        }
      );

      if (response.data.token) {
        localStorage.setItem(
          "token",
          response.data.token
        );
      }

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      if (response.data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/menu");
      }

    } catch (err) {
      if (err.response?.data?.errors) {
        setServerError(
          err.response.data.errors[0].msg
        );
      } else {
        setServerError(
          err.response?.data?.message ||
          "Invalid credentials"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 bg-[#f7f5f1]">

      <div className="w-full max-w-md bg-white rounded-[20px] border border-[#eeeae5] px-9 py-10 shadow-[0_8px_30px_rgba(30,30,30,0.04)]">

        <div className="flex items-center justify-center gap-2.5 mb-6">

          <div className="w-[30px] h-[30px] rounded-[5px] bg-[#14805f] text-white flex items-center justify-center">
            <Utensils size={19} />
          </div>

          <span className="text-[19px] font-bold text-[#172033]">
            CanteenHub
          </span>

        </div>

        <div className="text-center mb-8">

          <h1 className="text-[27px] leading-tight font-bold text-[#1d1d1d] mb-2">
            Welcome back
          </h1>

          <p className="text-sm text-[#817d78]">
            Log in to order fresh meals from your canteen
          </p>

        </div>

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="mb-5">

            <label className="block text-[13px] font-semibold text-[#242424] mb-2">
              Email Address
            </label>

            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full h-[46px] px-3.5 rounded-[11px] border border-[#e4e1dd] bg-[#faf9f7] text-sm outline-none placeholder:text-[#aaa6a1] focus:bg-white focus:border-[#14805f] focus:ring-[3px] focus:ring-[#14805f]/10"
            />

            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email}
              </p>
            )}

          </div>

          <div className="mb-2">

            <label className="block text-[13px] font-semibold text-[#242424] mb-2">
              Password
            </label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full h-[46px] px-3.5 pr-11 rounded-[11px] border border-[#e4e1dd] bg-[#faf9f7] text-sm outline-none placeholder:text-[#aaa6a1] focus:bg-white focus:border-[#14805f] focus:ring-[3px] focus:ring-[#14805f]/10"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77736e] hover:text-[#333]"
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>

            </div>

            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password}
              </p>
            )}

          </div>

          <div className="flex items-center justify-between mt-1 mb-5">

            <label className="flex items-center gap-2 text-xs text-[#817d78] cursor-pointer">

              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(e.target.checked)
                }
                className="w-4 h-4 accent-[#ff7a18] cursor-pointer"
              />

              Remember me

            </label>

            <button
              type="button"
              className="text-xs text-[#ff7a18] hover:underline"
            >
              Forgot password?
            </button>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[47px] rounded-[11px] bg-[#14805f] text-white text-sm font-semibold shadow-[0_5px_15px_rgba(20,128,95,0.14)] hover:bg-[#106d50] hover:-translate-y-[1px] transition-all disabled:opacity-70"
          >
            {loading
              ? "Logging in..."
              : "Log In to Dashboard"}
          </button>

        </form>

        <div className="text-center mt-5 text-[13px] text-[#817d78]">

          Don't have an account?

          <Link
            to="/register"
            className="ml-1 text-[#ff7a18] font-semibold hover:underline"
          >
            Register
          </Link>

        </div>

      </div>

    </div>
  );
};

export default Login;

