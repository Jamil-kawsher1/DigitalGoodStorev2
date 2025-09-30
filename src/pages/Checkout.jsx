import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useProducts } from "../ProductContext";

export default function Checkout() {
  const { user } = useAuth();
  const { placeOrder, addManualPayment } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({
    method: "bkash",
    trxId: "",
    sender: "",
  });

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    // Get product from location state
    if (location.state?.product) {
      setProduct(location.state.product);
    } else {
      // If no product in state, redirect to products page
      navigate("/products");
    }
  }, [location.state, navigate]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      showNotification("Please login to continue", "error");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    if (!paymentInfo.trxId || !paymentInfo.sender) {
      showNotification("Please fill in all payment details", "error");
      return;
    }

    setLoading(true);

    try {
      // Create the order using placeOrder from ProductContext (now async)
      const order = await placeOrder(product);
      
      if (order) {
        // Add payment information to the order (now async)
        await addManualPayment({
          method: paymentInfo.method,
          trxId: paymentInfo.trxId,
          sender: paymentInfo.sender,
        });
        
        showNotification("Order placed successfully! Please wait for confirmation.");
        // Redirect to customer dashboard after successful order
        setTimeout(() => {
          navigate("/customer");
        }, 2000);
      } else {
        showNotification("Failed to place order", "error");
      }
    } catch (error) {
      showNotification("An error occurred while placing your order", "error");
      console.error("Order creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-2xl font-bold text-gradient">DigiStore</span>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600">
                    Welcome, <span className="font-semibold text-gray-900">{user.name || user.email}</span>
                  </div>
                  <a
                    href="/customer"
                    className="btn-primary text-sm"
                  >
                    My Orders
                  </a>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <a
                    href="/login"
                    className="btn-primary text-sm"
                  >
                    Login
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {notification.message}
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a
                href="/"
                className="text-gray-700 hover:text-blue-600 inline-flex items-center text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Home
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <a
                  href="/products"
                  className="text-gray-700 hover:text-blue-600 ml-1 md:ml-2 text-sm font-medium"
                >
                  Products
                </a>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-500 ml-1 md:ml-2 text-sm font-medium">Checkout</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Summary */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-4xl">{product.logo || "🎁"}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                {product.description && (
                  <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                )}
              </div>
            </div>

            <div className="space-y-4 border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Product Price</span>
                <span className="text-lg font-semibold text-gray-900">${product.price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Quantity</span>
                <span className="text-gray-900">1</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">${product.price}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Important Information</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Digital products will be delivered via email after payment confirmation</li>
                    <li>Please ensure your payment information is correct</li>
                    <li>Processing time may vary depending on payment method</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h2>
            
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="relative">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bkash"
                      checked={paymentInfo.method === "bkash"}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, method: e.target.value })}
                      className="sr-only peer"
                    />
                    <div className="cursor-pointer rounded-lg border-2 border-gray-200 peer-checked:border-blue-600 peer-checked:bg-blue-50 p-4 text-center transition-all">
                      <div className="text-pink-600 font-semibold">bKash</div>
                    </div>
                  </label>
                  
                  <label className="relative">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="nagad"
                      checked={paymentInfo.method === "nagad"}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, method: e.target.value })}
                      className="sr-only peer"
                    />
                    <div className="cursor-pointer rounded-lg border-2 border-gray-200 peer-checked:border-blue-600 peer-checked:bg-blue-50 p-4 text-center transition-all">
                      <div className="text-orange-600 font-semibold">Nagad</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Transaction ID */}
              <div>
                <label htmlFor="trxId" className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID *
                </label>
                <input
                  id="trxId"
                  type="text"
                  value={paymentInfo.trxId}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, trxId: e.target.value })}
                  placeholder="Enter your transaction ID"
                  className="input-field"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is the transaction ID from your payment app
                </p>
              </div>

              {/* Sender Number */}
              <div>
                <label htmlFor="sender" className="block text-sm font-medium text-gray-700 mb-2">
                  Sender Number *
                </label>
                <input
                  id="sender"
                  type="text"
                  value={paymentInfo.sender}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, sender: e.target.value })}
                  placeholder="Enter your mobile number"
                  className="input-field"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  The mobile number used to send the payment
                </p>
              </div>

              {/* Payment Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Payment Instructions</h4>
                <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                  <li>Send <span className="font-semibold">${product.price}</span> to our {paymentInfo.method} number</li>
                  <li>Use the transaction ID as the reference</li>
                  <li>Fill in the payment details above</li>
                  <li>Click "Place Order" to complete your purchase</li>
                </ol>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg text-white font-semibold text-lg transition-all duration-200 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner w-5 h-5 mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  "Place Order"
                )}
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel and Return to Shopping
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
