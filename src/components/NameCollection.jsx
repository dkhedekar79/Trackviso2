import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function NameCollection({ onComplete }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, updateUserProfile } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Saving name to Supabase:", name.trim(), "for user:", user.id);

      // Save user profile to Supabase
      await updateUserProfile({
        name: name.trim(),
        created_at: new Date().toISOString()
      });

      console.log("Name saved successfully!");
      onComplete();
    } catch (err) {
      setError("Failed to save your name. Please try again.");
      console.error("Error saving name:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Trackviso!</h2>
          <p className="text-gray-600">What should we call you?</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
              autoFocus
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
