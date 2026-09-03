
import React, { useState } from "react";
import {
  User,
  Store,
  Eye,
  EyeOff,
  Utensils
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (username.trim() === "") {
      newErrors.username = "Username is required";
    } else if (username.trim().length < 3) {
      newErrors.username = "Username must contain at least 3 characters";
    }

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
      newErrors.password = "Password must contain at least 8 characters";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password =
        "Password must contain at least one number";
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
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          username,
          email,
          password,
          role
        },
        {
          withCredentials: true
        }
      );

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
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
          "Something went wrong during registration."
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
            Create your account
          </h1>

          <p className="text-sm text-[#817d78]">
            Get started with automated canteen bookings
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
                <User
                  size={17}
                  className={
                    role === "customer"
                      ? "text-[#ff7a18]"
                      : "text-[#817d78]"
                  }
                />
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
                <Store
                  size={17}
                  className={
                    role === "admin"
                      ? "text-[#ff7a18]"
                      : "text-[#817d78]"
                  }
                />
                Kitchen Admin
              </button>

            </div>
          </div>

          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-[#242424] mb-2">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full h-[46px] px-3.5 rounded-[11px] border border-[#e4e1dd] bg-[#faf9f7] text-sm outline-none focus:bg-white focus:border-[#14805f]"
            />

            {errors.username && (
              <p className="text-red-500 text-xs mt-1">
                {errors.username}
              </p>
            )}
          </div>

          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-[#242424] mb-2">
              Email Address
            </label>

            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full h-[46px] px-3.5 rounded-[11px] border border-[#e4e1dd] bg-[#faf9f7] text-sm outline-none focus:bg-white focus:border-[#14805f]"
            />

            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-[13px] font-semibold text-[#242424] mb-2">
              Password
            </label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full h-[46px] px-3.5 pr-11 rounded-[11px] border border-[#e4e1dd] bg-[#faf9f7] text-sm outline-none focus:bg-white focus:border-[#14805f]"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77736e]"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[47px] rounded-[11px] bg-[#14805f] text-white text-sm font-semibold shadow-[0_5px_15px_rgba(20,128,95,0.14)] hover:bg-[#106d50] hover:-translate-y-[1px] transition-all disabled:opacity-70"
          >
            {loading
              ? "Creating Account..."
              : "Create Free Account"}
          </button>

        </form>

        <div className="text-center mt-5 text-[13px] text-[#817d78]">
          Already have an account?

          <Link
            to="/login"
            className="ml-1 text-[#ff7a18] font-semibold hover:underline"
          >
            Log In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;

