import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Trash2, Edit3, X, Check } from "lucide-react";

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { user, userProfile, logout, updateUserName, deleteUserAccount } = useAuth();
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
        setIsEditingName(false);
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

  const handleEditName = () => {
    setNewName(userProfile?.name || "");
    setIsEditingName(true);
    setError("");
  };

  const handleSaveName = async () => {
    if (!newName.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await updateUserName(newName.trim());
      setIsEditingName(false);
    } catch (error) {
      setError("Failed to update name");
    } finally {
      setLoading(false);
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

  const cancelEdit = () => {
    setIsEditingName(false);
    setNewName("");
    setError("");
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
                {isEditingName ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-2 py-1 border rounded text-sm"
                      placeholder="Enter your name"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={handleSaveName}
                        disabled={loading}
                        className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:opacity-50"
                      >
                        <Check className="w-3 h-3" />
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-gray-800">
                      {userProfile?.name || "No name set"}
                    </p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                )}
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-xs mt-2">{error}</p>
            )}
          </div>

          <div className="p-2">
            {!isEditingName && (
              <button
                onClick={handleEditName}
                className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50 rounded text-sm"
              >
                <Edit3 className="w-4 h-4" />
                Change Name
              </button>
            )}

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
