import React, { useState } from "react";

const API_BASE = "http://localhost:4002";
import { useProducts } from "./ProductContext";
import { useAuth } from "./AuthContext";

function ManualPaymentOption({ title, info, method, onSubmit }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ trxId: "", sender: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!form.trxId || !form.sender) {
      alert("Please fill all fields");
      return;
    }
    onSubmit({ method, ...form });
    setShowForm(false);
    setForm({ trxId: "", sender: "" });
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {info.map((line, i) => (
        <p key={i} className="text-gray-600 mb-1">
          {line}
        </p>
      ))}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-2 mt-4 bg-[#2563EB] text-white rounded-lg hover:bg-[#1E40AF]"
        >
          I Have Paid
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <input
            type="text"
            name="trxId"
            value={form.trxId}
            onChange={handleChange}
            placeholder="Transaction ID / Hash"
            className="w-full border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            name="sender"
            value={form.sender}
            onChange={handleChange}
            placeholder="Sender Number / Wallet"
            className="w-full border rounded-lg px-3 py-2"
          />
          <button
            onClick={handleSubmit}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Submit Payment Info
          </button>
        </div>
      )}
    </div>
  );
}

function AutoPaymentOption({ title, description, onPay }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <button
        onClick={onPay}
        className="w-full py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1E40AF]"
      >
        Pay Now
      </button>
    </div>
  );
}

export default function PaymentPage({ country = "Bangladesh" }) {
  const { addManualPayment, settings, getOrdersForUser } = useProducts();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  const handleManualSubmit = (data) => {
    addManualPayment(data);
    setSubmitted(true);
    alert(
      "Your payment info has been submitted for review! Admin will confirm soon."
    );
  };

  const handleRedirect = (gateway) =>
    alert(`Redirecting to ${gateway} gateway...`);

  const myOrders = user ? getOrdersForUser(user.id) : [];

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-gray-900 font-inter">
      <section className="text-center py-12">
        <h2 className="text-3xl font-bold font-poppins mb-2">
          Choose Your Payment Method
        </h2>
        <p className="text-sm text-gray-600">
          You have {myOrders.length} order(s). Choose a method and submit your
          payment details for your pending order.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16 grid gap-6 sm:grid-cols-2">
        {country === "Bangladesh" ? (
          <>
            <ManualPaymentOption
              title="📱 Bkash"
              method="Bkash"
              info={["Send to: 017XXXXXXXX", "Reference: Order ID"]}
              onSubmit={handleManualSubmit}
            />
            <ManualPaymentOption
              title="💳 Nagad"
              method="Nagad"
              info={["Send to: 018XXXXXXXX", "Reference: Order ID"]}
              onSubmit={handleManualSubmit}
            />
            <ManualPaymentOption
              title="🚀 Rocket"
              method="Rocket"
              info={["Send to: 019XXXXXXXX", "Reference: Order ID"]}
              onSubmit={handleManualSubmit}
            />
            {settings.enableCryptoBD && (
              <ManualPaymentOption
                title="₿ Crypto"
                method="Crypto"
                info={["Wallet Address: 0x1234abcd5678efgh9012ijkl"]}
                onSubmit={handleManualSubmit}
              />
            )}
          </>
        ) : (
          <>
            <ManualPaymentOption
              title="₿ Crypto"
              method="Crypto"
              info={["Wallet Address: 0x1234abcd5678efgh9012ijkl"]}
              onSubmit={handleManualSubmit}
            />
            <AutoPaymentOption
              title="💳 Card"
              description="Pay instantly with Visa / MasterCard."
              onPay={() => handleRedirect("Card")}
            />
            <AutoPaymentOption
              title="🅿 PayPal"
              description="Checkout quickly with PayPal."
              onPay={() => handleRedirect("PayPal")}
            />
            <AutoPaymentOption
              title="💰 Payoneer"
              description="Pay securely via Payoneer."
              onPay={() => handleRedirect("Payoneer")}
            />
          </>
        )}
      </section>
    </div>
  );
}
