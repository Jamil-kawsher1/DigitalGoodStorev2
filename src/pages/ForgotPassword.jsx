import { useState } from "react";
const API_BASE = "http://localhost:4002";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  async function handle(e) {
    e.preventDefault();
    try {
      const res = await fetch(API_BASE + "/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      alert("Reset link sent (check backend logs in dev)");
    } catch (err) {
      alert(err.message || err);
    }
  }
  return (
    <form onSubmit={handle}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button type="submit">Send</button>
    </form>
  );
}
