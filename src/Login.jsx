import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login({ switchToSignup }) {
  const { login, error, clearError, loading, user } = useAuth(); // Add user from useAuth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  // Add useEffect to check if user is already logged in
  useEffect(() => {
    if (user) {
      // Redirect based on user role if already logged in
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/customer");
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    clearError?.();

    try {
      const result = await login(email, password);

      if (result.success) {
        // Redirect based on user role
        if (result.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/customer");
        }
      } else {
        setLoginError(result.error || "Invalid email or password");
      }
    } catch (err) {
      setLoginError(err.message || "An error occurred during login");
      console.error("Login error:", err);
    }
  };

  // If user is already logged in, don't render the login form
  if (user) {
    return null; // or return a loading spinner
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Welcome Back 👋
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(loginError || error) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {loginError || error}
            </div>
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            disabled={loading}
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            disabled={loading}
            required
          />

          <button
            type="submit"
            className={`w-full py-2 rounded-lg bg-blue-600 text-white font-semibold 
              ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
              } transition`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex justify-between items-center mt-4 text-sm">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => {
              /* Add forgot password handler */
            }}
          >
            Forgot Password?
          </button>
          <button
            className="text-blue-600 hover:underline"
            onClick={switchToSignup}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
