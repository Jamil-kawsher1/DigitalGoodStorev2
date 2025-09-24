import { useState } from "react";
const API_BASE = "http://localhost:4002";
export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");

  async function handle(e) {
    e.preventDefault();
    try {
      const res = await fetch(API_BASE + "/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      alert("Password reset successful");
    } catch (err) {
      alert(err.message || err);
    }
  }

  return (
    <form onSubmit={handle}>
      <input
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Token"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
      />
      <button type="submit">Reset</button>
    </form>
  );
}
