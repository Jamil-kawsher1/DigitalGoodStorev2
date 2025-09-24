// src/Signup.jsx
import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";

export default function Signup() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Get redirect path from state or default to customer dashboard
  const from = location.state?.from?.pathname || "/customer";
  const productId = location.state?.productId;

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: "",
    name: "", // Added name field
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validation
      if (!form.email || !form.password) {
        throw new Error("Email and password are required");
      }
      if (form.password !== form.confirm) {
        throw new Error("Passwords do not match");
      }
      if (form.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Register user
      const registerResult = await register({
        email: form.email,
        password: form.password,
        name: form.name,
      });

      if (!registerResult.success) {
        throw new Error(registerResult.error || "Registration failed");
      }

      // Auto login after successful registration
      const loginResult = await login(form.email, form.password);

      if (!loginResult.success) {
        throw new Error("Auto-login failed after registration");
      }

      // Handle redirect based on previous action
      if (productId) {
        navigate(`/product/${productId}/buy`);
      } else {
        navigate(from);
      }
    } catch (err) {
      setError(err.message);
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Create Account ✨
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name (optional)"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password (min 6 characters)"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
            minLength={6}
          />
          <input
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            placeholder="Confirm Password"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg bg-blue-600 text-white font-semibold 
              ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
              } 
              transition`}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            state={{ from: location.state?.from, productId }}
            className="text-blue-600 hover:underline"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
