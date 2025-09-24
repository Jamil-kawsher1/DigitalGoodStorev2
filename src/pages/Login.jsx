// import { useState } from "react";
// const API_BASE = "http://localhost:4002";
// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   async function handleSubmit(e) {
//     e.preventDefault();
//     try {
//       const res = await fetch(API_BASE + "/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       }).then((r) => console.log("Response:", r));

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Login failed");
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(data.user || null));
//       window.location.href = "/";
//     } catch (err) {
//       alert(err.message || err);
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit}>
//       <input
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         placeholder="Email"
//       />
//       <input
//         type="password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         placeholder="Password"
//       />
//       <button type="submit">Login</button>
//     </form>
//   );
// }

import { useState } from "react";
import { useAuth } from "../AuthContext"; // Adjust path as needed

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error, clearError, isLocalStorageEnabled } =
    useAuth();

  async function handleSubmit(e) {
    console.log("Login here is", login);
    e.preventDefault();
    // clearError();

    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    const result = await login(email, password);
    console.log("Login result email:", email, password);
    if (result.success) {
      // Success - redirect to home
      window.location.href = "/";
    } else {
      // Error is already set in context, you can display it
      console.error("Login failed:", result.error);
    }
  }

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>Login</h2>
      {isLocalStorageEnabled && (
        <div
          style={{
            background: "#fff3cd",
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "5px",
            fontSize: "14px",
          }}
        >
          <strong>Local Storage Mode:</strong> API failures will fall back to
          local authentication
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={{ width: "100%", padding: "10px", fontSize: "16px" }}
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{ width: "100%", padding: "10px", fontSize: "16px" }}
            disabled={loading}
          />
        </div>

        {error && (
          <div
            style={{
              color: "red",
              marginBottom: "15px",
              padding: "10px",
              background: "#ffe6e6",
              borderRadius: "5px",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            background: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
        <p>
          <strong>Authentication Mode:</strong>{" "}
          {isLocalStorageEnabled
            ? "API with Local Storage Fallback"
            : "API Only"}
        </p>
        {isLocalStorageEnabled && (
          <p>Test credentials: admin@site.test / admin123</p>
        )}
      </div>
    </div>
  );
}
