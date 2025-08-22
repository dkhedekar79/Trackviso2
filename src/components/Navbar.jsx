import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGamification } from "../context/GamificationContext";
import { Bell, User, LogOut, Menu, X, Star, Trophy, Flame } from 'lucide-react';
import ProfileDropdown from "./ProfileDropdown";

const Navbar = () => {
  const [opacity, setOpacity] = useState(1);
  const { user, logout } = useAuth();
  const { userStats, showRewards, rewardQueue } = useGamification();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const newOpacity = Math.max(0, 1 - scrollY / 60);
      setOpacity(newOpacity);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <nav
      className="w-full flex items-center justify-between px-8 py-4 bg-[#6C5DD3] shadow-md fixed top-0 left-0 z-50 h-20 transition-opacity duration-300"
      style={{ opacity }}
    >
      {/* Left: Logo */}
      <div className="flex-1 min-w-0">
        <Link to="/dashboard" className="text-2xl font-extrabold text-white whitespace-nowrap">
          Trackviso
        </Link>
      </div>
      
      {/* Center: Page Title & Date */}
      <div className="flex flex-col items-center flex-1 min-w-0">
        {(["/dashboard","/tasks","/schedule","/subjects","/study","/settings","/insights"].includes(location.pathname)) && (
          <>
            <span className="text-2xl font-extrabold tracking-widest bg-[linear-gradient(135deg,_#E0BBE4,_white)] text-transparent bg-clip-text">
              {location.pathname === "/dashboard" && "DASHBOARD"}
              {location.pathname === "/tasks" && "TASKS"}
              {location.pathname === "/schedule" && "SCHEDULE"}
              {location.pathname === "/subjects" && "SUBJECTS"}
              {location.pathname === "/study" && "STUDY"}
              {location.pathname === "/settings" && "SETTINGS"}
              {location.pathname === "/insights" && "INSIGHTS"}
            </span>
            <span className="text-sm font-medium text-[#EDE9FE] mt-1">
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </>
        )}
      </div>
      
      {/* Right: Auth links/buttons */}
      <div className="flex-1 flex justify-end gap-4 min-w-0">
        {!user && (
          <>
            <Link to="/login" className="px-4 py-2 rounded-lg text-[#6C5DD3] font-semibold hover:bg-[#EDE9FE] transition">Login</Link>
            <Link to="/signup" className="px-4 py-2 rounded-lg text-[#6C5DD3] font-semibold hover:bg-[#7A6AD9] transition">Sign Up</Link>
          </>
        )}
        {user && (
          <>
            {/* Gamification Status */}
            <div className="flex items-center gap-3 text-white">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-medium">{userStats?.level || 1}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <Flame className="w-4 h-4 text-orange-300" />
                <span className="text-sm font-medium">{userStats?.currentStreak || 0}</span>
              </div>
            </div>
            <ProfileDropdown />
          </>
        )}
      </div>

      {/* Gamification Notifications */}
      {showRewards && rewardQueue && Array.isArray(rewardQueue) && rewardQueue.length > 0 && (
        <div className="fixed top-24 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl shadow-2xl z-50 max-w-sm">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎉</div>
            <div>
              <h4 className="font-bold text-lg">{rewardQueue[rewardQueue.length - 1]?.title || "Session Complete!"}</h4>
              <p className="text-sm opacity-90">{rewardQueue[rewardQueue.length - 1]?.description || "Great work!"}</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
