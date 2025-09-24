import { useState } from "react";
const API_BASE = "http://localhost:4002";

export default function Checkout() {
  const [productId, setProductId] = useState("");

  async function handleBuy(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_BASE + "/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },

        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");
      alert("Order placed");
    } catch (err) {
      alert(err.message || err);
    }
  }

  return (
    <form onSubmit={handleBuy}>
      <input
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        placeholder="Product ID"
      />
      <button type="submit">Buy</button>
    </form>
  );
}
