import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { User, Mail, Calendar, Save, AlertCircle, CheckCircle } from "lucide-react";

export default function Settings() {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (userProfile?.name) {
      setName(userProfile.name);
    }
  }, [userProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: "error", text: "Please enter your name" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await updateUserProfile({ name: name.trim() });
      setMessage({ type: "success", text: "Name updated successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update name. Please try again." });
      console.error("Error updating name:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] mt-20 flex">
      <Sidebar />
      <div className="flex-1 ml-16 transition-all duration-300 ease-in-out [body>div>aside:hover_+_div&]:ml-64">
        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
            
            {/* Profile Section */}
            <div className="bg-[#23234a] rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-[#1a1a2e] border border-[#6C5DD3] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#6C5DD3] focus:border-transparent transition"
                    disabled={loading}
                  />
                </div>

                {/* Email Field (Read-only) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      readOnly
                      className="w-full px-4 py-3 bg-[#1a1a2e] border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                    />
                    <Mail className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Email address cannot be changed</p>
                </div>

                {/* Account Created */}
                {user?.created_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Account Created
                    </label>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {/* Message */}
                {message.text && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${
                    message.type === 'success' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {message.type === 'success' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {message.text}
                  </div>
                )}

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={loading || !name.trim() || name === userProfile?.name}
                  className="flex items-center gap-2 bg-[#6C5DD3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#7A6AD9] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Save className="w-4 h-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>

            {/* Additional Settings Sections */}
            <div className="bg-[#23234a] rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Account Actions</h2>
              <div className="space-y-4">
                <p className="text-gray-300 text-sm">
                  Need to make other changes to your account? More settings will be available soon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
