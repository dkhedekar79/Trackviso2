import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Trash2 } from "lucide-react";

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { user, userProfile, logout, deleteUserAccount } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Debug logging
  useEffect(() => {
    console.log("ProfileDropdown - Current user:", user);
    console.log("ProfileDropdown - Current userProfile:", userProfile);
  }, [user, userProfile]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowDeleteConfirm(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await deleteUserAccount();
      navigate("/");
    } catch (error) {
      setError("Failed to delete account");
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-full text-white hover:bg-white/30 transition"
      >
        <User className="w-4 h-4" />
        <span className="text-sm font-medium">
          {userProfile?.name ? `Hey, ${userProfile.name}` : `Hey, ${user?.email?.split('@')[0] || "there"}`}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <div>
                  <p className="font-semibold text-gray-800">
                    {userProfile?.name || user?.email?.split('@')[0] || "User"}
                  </p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-xs mt-2">{error}</p>
            )}
          </div>

          <div className="p-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50 rounded text-sm"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>

            <button
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-red-50 rounded text-sm text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>

            {showDeleteConfirm && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-800 mb-2">
                  Are you sure? This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? "Deleting..." : "Yes, Delete"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
