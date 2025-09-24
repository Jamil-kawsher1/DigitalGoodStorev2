import { useProducts } from "./ProductContext";
import { useAuth } from "./AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function HomePage() {
  const { products, placeOrder } = useProducts();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Debug user state - can be removed in production
  useEffect(() => {
    console.log("Current user state:", user);
  }, [user]);

  const handleBuy = (p) => {
    if (!user) {
      // Store the product info for after login
      navigate("/login", {
        state: {
          from: `/product/${p.id}/buy`,
          productId: p.id,
        },
      });
      return;
    }

    const order = placeOrder(p);
    if (order) {
      navigate("/payment");
    }
  };

  const handleShopNow = () => {
    const productsSection = document.querySelector("#products-section");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-gray-900 font-inter">
      <header className="w-full bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
          <Link
            to="/"
            className="text-2xl font-bold text-[#2563EB] font-poppins hover:opacity-90 transition"
          >
            DigiStore
          </Link>

          <nav className="hidden md:flex space-x-6 font-medium">
            <Link to="/" className="hover:text-[#2563EB] transition">
              Home
            </Link>
            <Link to="/products" className="hover:text-[#2563EB] transition">
              Products
            </Link>
            <Link to="/support" className="hover:text-[#2563EB] transition">
              Support
            </Link>
            <Link to="/faq" className="hover:text-[#2563EB] transition">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-700 font-medium hidden md:inline">
                  Welcome, {user.name || user.email}
                </span>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 rounded-lg bg-[#2563EB] text-white hover:bg-[#1E40AF] transition"
                  >
                    Admin Panel
                  </Link>
                )}
                {user.role === "customer" && (
                  <Link
                    to="/customer"
                    className="px-4 py-2 rounded-lg bg-[#2563EB] text-white hover:bg-[#1E40AF] transition"
                  >
                    My Orders
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg bg-[#2563EB] text-white hover:bg-[#1E40AF] transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                >
                  Signup
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="text-center py-16 px-6">
        <h2 className="text-4xl font-bold font-poppins mb-4">
          Instant Digital Goods
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Windows Keys, Gift Cards & Virtual Cards delivered instantly to your
          email.
        </p>
        <button
          onClick={handleShopNow}
          className="px-6 py-3 rounded-lg bg-[#2563EB] text-white font-semibold hover:bg-[#1E40AF] transition"
        >
          Shop Now
        </button>
      </section>

      <section id="products-section" className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-xl transition"
            >
              <div className="text-5xl mb-4">{p.logo}</div>
              <h3 className="text-xl font-semibold font-poppins mb-2">
                {p.name}
              </h3>
              <p className="text-lg text-gray-700 mb-4">${p.price}</p>
              <button
                onClick={() => handleBuy(p)}
                className="w-full py-2 rounded-lg bg-[#2563EB] text-white font-medium hover:bg-[#1E40AF] transition"
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-around text-center gap-6">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-green-500">✅</span>
            <span className="font-medium">Instant Delivery</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span>🔒</span>
            <span className="font-medium">Secure Payment</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span>💬</span>
            <span className="font-medium">24/7 Support</span>
          </div>
        </div>
      </section>

      <footer className="bg-[#111827] text-gray-300 text-sm py-6 mt-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-6 space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} DigiStore. All rights reserved.</p>
          <div className="flex space-x-4">
            <span className="hover:text-white cursor-pointer transition">
              Visa
            </span>
            <span className="hover:text-white cursor-pointer transition">
              MasterCard
            </span>
            <span className="hover:text-white cursor-pointer transition">
              PayPal
            </span>
            <span className="hover:text-white cursor-pointer transition">
              Crypto
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
