import React from "react";
import { Utensils, ArrowRight, Clock, ChefHat, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 bg-[#f7f5f1]">
      <div className="w-full max-w-md bg-white rounded-[20px] border border-[#eeeae5] px-9 py-10 shadow-[0_8px_30px_rgba(30,30,30,0.04)]">
        
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-[38px] h-[38px] rounded-[8px] bg-[#14805f] text-white flex items-center justify-center shadow-sm">
            <Utensils size={22} />
          </div>
          <span className="text-[22px] font-bold text-[#172033]">CanteenHub</span>
        </div>

        {/* Hero Text */}
        <div className="text-center mb-8">
          <h1 className="text-[28px] leading-[1.2] font-bold text-[#1d1d1d] mb-3">
            Skip the line.<br />Order in seconds.
          </h1>
          <p className="text-[15px] text-[#817d78] px-2">
            The smartest way to manage your campus cravings. Real-time updates, fresh meals, zero waiting.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="flex flex-col gap-4 mb-10">
          <div className="flex items-center gap-4 p-3.5 rounded-[12px] bg-[#faf9f7] border border-[#eeeae5]">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#e4e1dd] text-[#ff7a18]">
              <Zap size={18} />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-[#242424]">Lightning Fast</h3>
              <p className="text-[12px] text-[#817d78]">Pre-order your meals instantly</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3.5 rounded-[12px] bg-[#faf9f7] border border-[#eeeae5]">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#e4e1dd] text-[#14805f]">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-[#242424]">Live Tracking</h3>
              <p className="text-[12px] text-[#817d78]">Know exactly when food is ready</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3.5 rounded-[12px] bg-[#faf9f7] border border-[#eeeae5]">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#e4e1dd] text-[#ff7a18]">
              <ChefHat size={18} />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-[#242424]">Vendor Portal</h3>
              <p className="text-[12px] text-[#817d78]">Seamless kitchen management</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            to="/register"
            className="w-full h-[47px] flex items-center justify-center gap-2 rounded-[11px] bg-[#14805f] text-white text-sm font-semibold shadow-[0_5px_15px_rgba(20,128,95,0.14)] hover:bg-[#106d50] hover:-translate-y-[1px] transition-all"
          >
            Get Started <ArrowRight size={16} />
          </Link>
          
          <Link
            to="/login"
            className="w-full h-[47px] flex items-center justify-center rounded-[11px] bg-[#faf9f7] border border-[#e4e1dd] text-[#242424] text-sm font-semibold hover:bg-white hover:border-[#d6d3ce] transition-all"
          >
            Log In to Existing Account
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Landing;