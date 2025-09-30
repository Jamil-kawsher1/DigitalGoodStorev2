import { useState, useEffect } from "react";
import { useProducts } from "./ProductContext";
import { useAuth } from "./AuthContext";

export default function CustomerDashboard() {
  const { orders, loading, error } = useProducts();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");
  const [notification, setNotification] = useState(null);

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter orders for current user
  const myOrders = orders.filter(
    (o) => o.userId && user && o.userId === user.id
  );

  // Copy key to clipboard
  const copyToClipboard = (key) => {
    navigator.clipboard.writeText(key).then(() => {
      showNotification("Key copied to clipboard!");
    }).catch(() => {
      showNotification("Failed to copy key", "error");
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <span className="text-2xl font-bold text-gradient">My DigiStore</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-semibold text-gray-900">{user?.name || user?.email}</span>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                Logout
              </button>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Manage your orders and digital products</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{myOrders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {myOrders.filter(o => o.status === "paid").length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {myOrders.filter(o => o.status !== "paid").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("orders")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "orders"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                My Orders
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "products"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Browse Products
              </button>
            </nav>
          </div>
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="spinner w-8 h-8"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600 mb-4">Error loading orders</div>
                <button className="btn-primary" onClick={() => window.location.reload()}>
                  Try Again
                </button>
              </div>
            ) : myOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
                <button
                  onClick={() => setActiveTab("products")}
                  className="btn-primary"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {myOrders.map((order) => (
                  <div key={order.id} className="card p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.id}
                          </h3>
                          <span className={`badge ${
                            order.status === "paid" ? "badge-success" :
                            order.status === "awaitingconfirmation" ? "badge-warning" :
                            order.status === "pending" ? "badge-warning" :
                            "badge-danger"
                          }`}>
                            {order.status === "paid" ? "Completed" :
                             order.status === "awaitingconfirmation" ? "Awaiting Confirmation" :
                             order.status === "pending" ? "Pending" :
                             order.status}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-gray-600">
                          <p><strong>Product:</strong> {order.product}</p>
                          <p><strong>Price:</strong> <span className="text-lg font-semibold text-blue-600">${order.price}</span></p>
                          <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                          
                          {order.paymentInfo && (
                            <div className="bg-gray-50 rounded-lg p-3 mt-3">
                              <p className="font-medium text-gray-900 mb-1">Payment Information</p>
                              <p><strong>Method:</strong> {order.paymentInfo.method}</p>
                              <p><strong>Transaction ID:</strong> {order.paymentInfo.trxId}</p>
                              <p><strong>Sender:</strong> {order.paymentInfo.sender}</p>
                            </div>
                          )}
                          
                          {order.keys && order.keys.length > 0 && (
                            <div className="bg-green-50 rounded-lg p-3 mt-3">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium text-green-900">Digital Keys</p>
                                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                  {order.keys.length} key(s)
                                </span>
                              </div>
                              <div className="space-y-1">
                                {order.keys.map((key, index) => (
                                  <div key={index} className="flex items-center justify-between bg-white rounded p-2">
                                    <code className="text-sm font-mono text-gray-800 break-all">
                                      {key}
                                    </code>
                                    <button
                                      onClick={() => copyToClipboard(key)}
                                      className="ml-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                      Copy
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Browse Products</h2>
              <button
                onClick={() => window.location.href = "/"}
                className="btn-primary"
              >
                View All Products
              </button>
            </div>
            
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Browse Our Products</h3>
              <p className="text-gray-600 mb-6">
                Discover our wide range of digital products including Windows keys, Office keys, gift cards, and more.
              </p>
              <button
                onClick={() => window.location.href = "/"}
                className="btn-primary"
              >
                Start Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
