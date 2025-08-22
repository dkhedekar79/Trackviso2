// src/pages/Signup.jsx
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import NameCollection from "../components/NameCollection";

export default function Signup() {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showNameCollection, setShowNameCollection] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signup(email, password);
      setShowNameCollection(true);
    } catch (err) {
      setError("Failed to sign up. " + err.message);
    }
  };

  const handleNameCollectionComplete = () => {
    navigate("/dashboard");
  };

  return (
    <>
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 via-purple-100 to-green-100">
        <form onSubmit={handleSubmit} className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
          {error && <p className="text-red-500">{error}</p>}
          <input
            className="block w-full border p-2 mb-3"
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="block w-full border p-2 mb-4"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-green-600 text-white py-2 rounded">Sign Up</button>
        </form>
        
        <div className="text-center mt-4">
          <span>Have an account? </span>
          <a href="/login" className="text-blue-500 underline">Log in</a>
        </div>
      </div>
      

      {showNameCollection && (
        <NameCollection onComplete={handleNameCollectionComplete} />
      )}
    </>
  );
}
