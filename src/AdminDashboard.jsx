import { useState, useEffect } from "react";
import { useProducts } from "./ProductContext";
import { useAuth } from "./AuthContext";
import { fetchJSON } from "./apiBase";

export default function AdminDashboard() {
  const {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
  } = useProducts();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);
  const [lastOrderCount, setLastOrderCount] = useState(0);

  const [form, setForm] = useState({
    name: "",
    description: "",
    instructions: "",
    price: "",
    quantity: "",
    logo: "",
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [notification, setNotification] = useState(null);
  
  // Key management states
  const [editingKey, setEditingKey] = useState(null);
  const [keyEditValue, setKeyEditValue] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [modalMode, setModalMode] = useState(""); // "add", "edit", "bulk", "remove"
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newKeyValue, setNewKeyValue] = useState("");
  const [bulkKeys, setBulkKeys] = useState("");

  // Keys management states
  const [allKeys, setAllKeys] = useState([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [keysError, setKeysError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [newKeyForm, setNewKeyForm] = useState({ productId: "", keys: "" });
  
  // Filtering states
  const [filterProduct, setFilterProduct] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredKeys, setFilteredKeys] = useState([]);

  // Fetch orders from API and localStorage
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError(null);
      
      // Fetch orders from API
      const apiOrders = await fetchJSON("/orders");
      
      // Get orders from localStorage (for recent orders not yet in database)
      const localOrdersStr = localStorage.getItem("orders");
      const localOrders = localOrdersStr ? JSON.parse(localOrdersStr) : [];
      
      // Combine and deduplicate orders
      const allOrders = [...apiOrders];
      const existingIds = new Set(apiOrders.map(o => o.id));
      
      // Add local orders that aren't already in API orders
      localOrders.forEach(localOrder => {
        if (!existingIds.has(localOrder.id)) {
          allOrders.push(localOrder);
        }
      });
      
      // Sort by creation date (newest first)
      allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Check for new orders and show notification
      if (allOrders.length > lastOrderCount && lastOrderCount > 0) {
        const newOrdersCount = allOrders.length - lastOrderCount;
        showNotification(`${newOrdersCount} new order${newOrdersCount > 1 ? 's' : ''} received!`, "success");
      }
      
      setOrders(allOrders);
      setLastOrderCount(allOrders.length);
    } catch (err) {
      console.error("Error loading orders:", err);
      setOrdersError(err.message || "Failed to fetch orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  // Load orders on component mount and when switching to orders tab
  useEffect(() => {
    fetchOrders();
  }, []);

  // Auto-refresh orders every 15 seconds when on orders tab
  useEffect(() => {
    let interval;
    if (activeTab === "orders") {
      interval = setInterval(() => {
        fetchOrders();
      }, 15000); // 15 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab]);

  // Listen for localStorage changes (for real-time updates from checkout)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "orders" && activeTab === "orders") {
        fetchOrders();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [activeTab]);

  // Fetch all keys from API
  const fetchKeys = async () => {
    try {
      setKeysLoading(true);
      setKeysError(null);
      const data = await fetchJSON("/keys");
      setAllKeys(data);
    } catch (err) {
      console.error("Error loading keys:", err);
      setKeysError(err.message || "Failed to fetch keys");
    } finally {
      setKeysLoading(false);
    }
  };

  // Load keys when switching to keys tab
  useEffect(() => {
    if (activeTab === "keys") {
      fetchKeys();
    }
  }, [activeTab]);

  // Filter keys based on selected criteria
  useEffect(() => {
    if (allKeys.length === 0) {
      setFilteredKeys([]);
      return;
    }

    let filtered = [...allKeys];

    // Filter by product
    if (filterProduct !== "all") {
      filtered = filtered.filter(key => key.productId === parseInt(filterProduct));
    }

    // Filter by status
    if (filterStatus !== "all") {
      if (filterStatus === "available") {
        filtered = filtered.filter(key => !key.isAssigned);
      } else if (filterStatus === "assigned") {
        filtered = filtered.filter(key => key.isAssigned);
      }
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(key => 
        key.keyValue.toLowerCase().includes(searchLower) ||
        (key.product?.name && key.product.name.toLowerCase().includes(searchLower)) ||
        (key.order?.user?.name && key.order.user.name.toLowerCase().includes(searchLower)) ||
        (key.order?.user?.email && key.order.user.email.toLowerCase().includes(searchLower))
      );
    }

    setFilteredKeys(filtered);
  }, [allKeys, filterProduct, filterStatus, searchTerm]);

  // Copy key to clipboard
  const copyToClipboard = async (keyValue) => {
    try {
      await navigator.clipboard.writeText(keyValue);
      showNotification("Key copied to clipboard!");
    } catch (err) {
      showNotification("Failed to copy key", "error");
    }
  };

  // Add new keys to product
  const handleAddKeysToProduct = async () => {
    if (!newKeyForm.productId || !newKeyForm.keys.trim()) {
      showNotification("Please select a product and enter keys", "error");
      return;
    }

    try {
      const keyArray = newKeyForm.keys.split(",").map(k => k.trim()).filter(k => k);
      await fetchJSON(`/products/${newKeyForm.productId}/keys`, {
        method: "POST",
        body: { keys: keyArray },
      });
      showNotification("Keys added successfully!");
      setNewKeyForm({ productId: "", keys: "" });
      fetchKeys(); // Refresh keys
    } catch (err) {
      showNotification("Failed to add keys", "error");
    }
  };

  // Revoke/release a key
  const handleRevokeKey = async (keyId) => {
    if (window.confirm("Are you sure you want to revoke this key? It will become available for reassignment.")) {
      try {
        await fetchJSON(`/keys/${keyId}/revoke`, {
          method: "PUT",
        });
        showNotification("Key revoked successfully!");
        fetchKeys(); // Refresh keys
      } catch (err) {
        showNotification("Failed to revoke key", "error");
      }
    }
  };

  // Confirm payment (without assigning keys)
  const handleConfirmPayment = async (orderId) => {
    try {
      await fetchJSON(`/orders/${orderId}/confirm-payment`, {
        method: "POST",
      });
      showNotification("Payment confirmed successfully!");
      fetchOrders(); // Refresh orders
    } catch (err) {
      showNotification("Failed to confirm payment", "error");
    }
  };

  // Mark as paid and assign keys
  const handleMarkPaid = async (orderId) => {
    const keys = prompt("Enter digital keys (comma-separated):");
    if (keys) {
      try {
        const keyArray = keys.split(",").map(k => k.trim());
        await fetchJSON(`/orders/${orderId}/mark-paid`, {
          method: "POST",
          body: { keys: keyArray },
        });
        showNotification("Payment confirmed and keys assigned successfully!");
        fetchOrders(); // Refresh orders
      } catch (err) {
        showNotification("Failed to mark as paid", "error");
      }
    }
  };

  // Assign keys to already paid order
  const handleAssignKeys = async (orderId) => {
    setSelectedOrder(orderId);
    setModalMode("bulk");
    setBulkKeys("");
    setShowKeyModal(true);
  };

  // Add single key to order
  const handleAddSingleKey = async (orderId) => {
    setSelectedOrder(orderId);
    setModalMode("add");
    setNewKeyValue("");
    setShowKeyModal(true);
  };

  // Edit existing key
  const handleEditKey = async (orderId, keyId, currentValue) => {
    setSelectedOrder(orderId);
    setEditingKey(keyId);
    setKeyEditValue(currentValue);
    setModalMode("edit");
    setShowKeyModal(true);
  };

  // Remove key
  const handleRemoveKey = async (orderId, keyId) => {
    if (window.confirm("Are you sure you want to remove this key?")) {
      try {
        // Use the revoke endpoint to remove the key
        await fetchJSON(`/keys/${keyId}/revoke`, {
          method: "PUT",
        });
        showNotification("Key removed successfully!");
        fetchOrders(); // Refresh orders
      } catch (err) {
        showNotification("Failed to remove key", "error");
      }
    }
  };

  // Reassign all keys (bulk replacement)
  const handleReassignKeys = async (orderId) => {
    setSelectedOrder(orderId);
    setModalMode("bulk");
    setBulkKeys("");
    setShowKeyModal(true);
  };

  // Handle modal key operations
  const handleModalSubmit = async () => {
    try {
      if (modalMode === "add") {
        // Add single key
        await fetchJSON(`/orders/${selectedOrder}/assign-keys`, {
          method: "POST",
          body: { keys: [newKeyValue.trim()] },
        });
        showNotification("Key added successfully!");
      } else if (modalMode === "edit") {
        // For editing, we need to remove the old key and add the new one
        await fetchJSON(`/keys/${editingKey}/revoke`, {
          method: "PUT",
        });
        await fetchJSON(`/orders/${selectedOrder}/assign-keys`, {
          method: "POST",
          body: { keys: [keyEditValue.trim()] },
        });
        showNotification("Key updated successfully!");
      } else if (modalMode === "bulk") {
        // Bulk assign/replace keys
        const keyArray = bulkKeys.split(",").map(k => k.trim()).filter(k => k);
        await fetchJSON(`/orders/${selectedOrder}/assign-keys`, {
          method: "POST",
          body: { keys: keyArray },
        });
        showNotification("Keys assigned successfully!");
      }
      
      setShowKeyModal(false);
      fetchOrders(); // Refresh orders
    } catch (err) {
      showNotification("Operation failed", "error");
    }
  };

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Add product
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      showNotification("Please fill in required fields", "error");
      return;
    }

    try {
      await addProduct({
        ...form,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity) || 0,
      });
      showNotification("Product added successfully!");
      setForm({ name: "", description: "", instructions: "", price: "", quantity: "", logo: "" });
    } catch (err) {
      showNotification("Failed to add product", "error");
    }
  };

  // Save edited product
  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      await updateProduct(editingProduct.id, {
        name: editingProduct.name,
        description: editingProduct.description,
        instructions: editingProduct.instructions,
        price: parseFloat(editingProduct.price),
        quantity: parseInt(editingProduct.quantity) || 0,
        logo: editingProduct.logo,
      });
      showNotification("Product updated successfully!");
      setEditingProduct(null);
    } catch (err) {
      showNotification("Failed to update product", "error");
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        showNotification("Product deleted successfully!");
      } catch (err) {
        showNotification("Failed to delete product", "error");
      }
    }
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
                <span className="text-2xl font-bold text-gradient">DigiStore Admin</span>
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
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("products")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "products"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "orders"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab("keys")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "keys"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Keys
              </button>
            </nav>
          </div>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="space-y-8">
            {/* Add Product Form */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Add New Product</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter product name"
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="0"
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo (emoji)
                  </label>
                  <input
                    value={form.logo}
                    onChange={(e) => setForm({ ...form, logo: e.target.value })}
                    placeholder="🎁"
                    className="input-field"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Product description"
                    className="input-field"
                    rows={3}
                  />
                </div>
                
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions
                  </label>
                  <textarea
                    value={form.instructions}
                    onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                    placeholder="Installation instructions"
                    className="input-field"
                    rows={3}
                  />
                </div>
                
                <div className="md:col-span-2 lg:col-span-3">
                  <button type="submit" className="btn-primary">
                    Add Product
                  </button>
                </div>
              </form>
            </div>

            {/* Products List */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Manage Products</h3>
                <button
                  onClick={refreshProducts}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="spinner w-8 h-8"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-600 mb-4">Error loading products</div>
                  <button className="btn-primary" onClick={refreshProducts}>
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {products.map((p) => (
                    <div key={p.id} className="card p-6">
                      {editingProduct?.id === p.id ? (
                        // Edit Mode
                        <form onSubmit={handleEditSave} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <input
                              type="text"
                              className="input-field"
                              value={editingProduct.name}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Product Name"
                            />
                            <input
                              type="number"
                              step="0.01"
                              className="input-field"
                              value={editingProduct.price}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  price: e.target.value,
                                })
                              }
                              placeholder="Price"
                            />
                            <input
                              type="number"
                              className="input-field"
                              value={editingProduct.quantity}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  quantity: e.target.value,
                                })
                              }
                              placeholder="Quantity"
                            />
                            <input
                              type="text"
                              className="input-field"
                              value={editingProduct.logo}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...editingProduct,
                                  logo: e.target.value,
                                })
                              }
                              placeholder="Logo"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="btn-primary"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingProduct(null)}
                              className="btn-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        // View Mode
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex items-center space-x-4">
                            <div className="text-3xl">{p.logo || "🎁"}</div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{p.name}</h4>
                              <p className="text-gray-600">{p.description}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-xl font-bold text-blue-600">${p.price}</span>
                                <span className={`badge ${p.quantity > 0 ? 'badge-success' : 'badge-danger'}`}>
                                  {p.quantity} in stock
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h3 className="text-xl font-semibold text-gray-900">Orders Management</h3>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-500">
                    Total Orders: <span className="font-semibold text-blue-600">{orders.length}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Auto-refresh: <span className="text-green-600">Active (15s)</span>
                  </div>
                  {orders.some(o => o.status === "awaiting_confirmation") && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-yellow-600 font-medium">
                        {orders.filter(o => o.status === "awaiting_confirmation").length} awaiting confirmation
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={fetchOrders}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Refresh Orders
              </button>
            </div>

            {ordersLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="spinner w-8 h-8"></div>
              </div>
            ) : ordersError ? (
              <div className="text-center py-12">
                <div className="text-red-600 mb-4">Error loading orders</div>
                <button className="btn-primary" onClick={fetchOrders}>
                  Try Again
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">No orders found</div>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map((o) => (
                  <div key={o.id} className={`card p-6 transition-all duration-300 ${
                    o.status === "awaiting_confirmation" ? "border-l-4 border-l-yellow-500 bg-yellow-50" : ""
                  }`}>
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            Order #{o.id}
                          </h4>
                          <span className={`badge ${
                            o.status === "paid" ? "badge-success" :
                            o.status === "awaiting_confirmation" ? "badge-warning animate-pulse" :
                            o.status === "pending" ? "badge-warning" :
                            "badge-danger"
                          }`}>
                            {o.status === "awaiting_confirmation" ? "⏰ Awaiting Confirmation" : 
                             o.status === "pending" ? "⏳ Pending" : 
                             o.status === "paid" ? "✅ Paid" : o.status}
                          </span>
                          {o.status === "awaiting_confirmation" && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 animate-pulse">
                              New Order
                            </span>
                          )}
                        </div>
                        
                        <div className="text-gray-600 space-y-1">
                          <p><strong>Product:</strong> {o.product?.name || `Product #${o.productId}`}</p>
                          <p><strong>Price:</strong> ${o.product?.price || '0.00'}</p>
                          <p><strong>Customer:</strong> {o.user?.name || o.user?.email || `User #${o.userId}`}</p>
                          <p><strong>Created:</strong> {new Date(o.createdAt).toLocaleDateString()} at {new Date(o.createdAt).toLocaleTimeString()}</p>
                          
                          {/* Payment Information */}
                          {o.paymentMethod && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="font-medium text-blue-900 mb-1">Payment Information:</p>
                              <p><strong>Method:</strong> {o.paymentMethod}</p>
                              {o.transactionId && <p><strong>Transaction ID:</strong> {o.transactionId}</p>}
                              {o.paymentSender && <p><strong>Sender:</strong> {o.paymentSender}</p>}
                            </div>
                          )}
                          
                          {/* Digital Keys */}
                          <div className="mt-3">
                            <div className="flex justify-between items-center mb-2">
                              <p className="font-medium text-gray-900">
                                Assigned Keys {o.keys && o.keys.length > 0 && `(${o.keys.length})`}
                              </p>
                              <div className="flex gap-2">
                                {o.status === "paid" && (
                                  <>
                                    <button
                                      onClick={() => handleAddSingleKey(o.id)}
                                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                                    >
                                      Add Key
                                    </button>
                                    <button
                                      onClick={() => handleReassignKeys(o.id)}
                                      className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs transition-colors"
                                    >
                                      Reassign All
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {o.keys && o.keys.length > 0 ? (
                              <div className="bg-gray-100 rounded p-2">
                                {o.keys.map((k, idx) => (
                                  <div key={k.id || idx} className="flex items-center justify-between bg-white p-2 rounded mb-1">
                                    <code className="text-sm font-mono flex-1">
                                      {k.keyValue || k}
                                    </code>
                                    {o.status === "paid" && (
                                      <div className="flex gap-1 ml-2">
                                        <button
                                          onClick={() => handleEditKey(o.id, k.id, k.keyValue || k)}
                                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => handleRemoveKey(o.id, k.id)}
                                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-gray-500 text-sm italic">
                                No keys assigned yet
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 lg:ml-4">
                        {/* Payment confirmation buttons */}
                        {o.status === "awaiting_confirmation" && (
                          <>
                            <button
                              onClick={() => handleConfirmPayment(o.id)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                            >
                              Confirm Payment
                            </button>
                            <button
                              onClick={() => handleMarkPaid(o.id)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                            >
                              Confirm & Assign Keys
                            </button>
                          </>
                        )}
                        
                        {/* Assign keys button for paid orders without keys */}
                        {o.status === "paid" && (!o.keys || o.keys.length === 0) && (
                          <button
                            onClick={() => handleAssignKeys(o.id)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                          >
                            Assign Keys
                          </button>
                        )}
                        
                        {/* Additional key management for paid orders with keys */}
                        {o.status === "paid" && o.keys && o.keys.length > 0 && (
                          <button
                            onClick={() => handleReassignKeys(o.id)}
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm"
                          >
                            Reassign Keys
                          </button>
                        )}
                        
                        {/* Refresh single order */}
                        <button
                          onClick={() => fetchOrders()}
                          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Refresh
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Keys Tab */}
        {activeTab === "keys" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Keys Management</h3>
              <button
                onClick={fetchKeys}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Refresh Keys
              </button>
            </div>

            {/* Add Keys Form */}
            <div className="card p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Keys to Product</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Product
                  </label>
                  <select
                    value={newKeyForm.productId}
                    onChange={(e) => setNewKeyForm({ ...newKeyForm, productId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Choose a product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.logo} {p.name} (${p.price})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keys (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newKeyForm.keys}
                    onChange={(e) => setNewKeyForm({ ...newKeyForm, keys: e.target.value })}
                    placeholder="KEY-001, KEY-002, KEY-003"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleAddKeysToProduct}
                  className="btn-primary"
                  disabled={!newKeyForm.productId || !newKeyForm.keys.trim()}
                >
                  Add Keys to Product
                </button>
              </div>
            </div>

            {/* Keys List */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900">All Keys</h4>
                <div className="text-sm text-gray-600">
                  <span className="inline-flex items-center mr-4">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                    Available
                  </span>
                  <span className="inline-flex items-center">
                    <span className="w-3 h-3 bg-gray-400 rounded-full mr-1"></span>
                    Assigned
                  </span>
                </div>
              </div>

              {/* Filtering Controls */}
              <div className="card p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Product Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Product
                    </label>
                    <select
                      value={filterProduct}
                      onChange={(e) => setFilterProduct(e.target.value)}
                      className="input-field text-sm"
                    >
                      <option value="all">All Products</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.logo} {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="input-field text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="available">Available</option>
                      <option value="assigned">Assigned</option>
                    </select>
                  </div>

                  {/* Search */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Keys
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by key, product, or customer..."
                        className="input-field text-sm w-full pr-10"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(filterProduct !== "all" || filterStatus !== "all" || searchTerm.trim()) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-gray-600">Active filters:</span>
                      {filterProduct !== "all" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          Product: {products.find(p => p.id === parseInt(filterProduct))?.name || filterProduct}
                          <button
                            onClick={() => setFilterProduct("all")}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {filterStatus !== "all" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Status: {filterStatus === "available" ? "Available" : "Assigned"}
                          <button
                            onClick={() => setFilterStatus("all")}
                            className="ml-1 text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {searchTerm.trim() && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                          Search: "{searchTerm}"
                          <button
                            onClick={() => setSearchTerm("")}
                            className="ml-1 text-purple-600 hover:text-purple-800"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setFilterProduct("all");
                          setFilterStatus("all");
                          setSearchTerm("");
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </div>
                )}

                {/* Results Count */}
                <div className="mt-4 text-sm text-gray-600">
                  Showing {filteredKeys.length} of {allKeys.length} keys
                  {filteredKeys.length !== allKeys.length && (
                    <span className="text-gray-500">
                      {" "}(filters applied)
                    </span>
                  )}
                </div>
              </div>

              {keysLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="spinner w-8 h-8"></div>
                </div>
              ) : keysError ? (
                <div className="text-center py-12">
                  <div className="text-red-600 mb-4">Error loading keys</div>
                  <button className="btn-primary" onClick={fetchKeys}>
                    Try Again
                  </button>
                </div>
              ) : filteredKeys.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    {allKeys.length === 0 ? "No keys found" : "No keys match your filters"}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {allKeys.length === 0 
                      ? "Add keys using the form above" 
                      : "Try adjusting your filters or search terms"
                    }
                  </p>
                  {(filterProduct !== "all" || filterStatus !== "all" || searchTerm.trim()) && (
                    <button
                      onClick={() => {
                        setFilterProduct("all");
                        setFilterStatus("all");
                        setSearchTerm("");
                      }}
                      className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm transition-colors"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredKeys.map((k) => (
                    <div key={k.id} className="card p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Status indicator */}
                          <div className={`w-4 h-4 rounded-full ${
                            k.isAssigned ? 'bg-gray-400' : 'bg-green-500'
                          }`}></div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                {k.keyValue}
                              </code>
                              <span className="text-sm text-gray-600">
                                {k.product?.name || `Product #${k.productId}`}
                              </span>
                              {k.product?.logo && (
                                <span className="text-lg">{k.product.logo}</span>
                              )}
                            </div>
                            
                            {k.isAssigned && k.order && (
                              <div className="text-xs text-gray-500 mt-1">
                                Assigned to Order #{k.assignedToOrderId} - {k.order.user?.name || k.order.user?.email}
                              </div>
                            )}
                            
                            <div className="text-xs text-gray-400 mt-1">
                              Created: {new Date(k.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* Copy button */}
                          <button
                            onClick={() => copyToClipboard(k.keyValue)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                          >
                            Copy
                          </button>
                          
                          {/* Revoke button (only for assigned keys) */}
                          {k.isAssigned && (
                            <button
                              onClick={() => handleRevokeKey(k.id)}
                              className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs transition-colors"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Key Management Modal */}
        {showKeyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {modalMode === "add" && "Add New Key"}
                {modalMode === "edit" && "Edit Key"}
                {modalMode === "bulk" && "Assign Keys"}
              </h3>
              
              {modalMode === "add" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Value
                    </label>
                    <input
                      type="text"
                      value={newKeyValue}
                      onChange={(e) => setNewKeyValue(e.target.value)}
                      placeholder="Enter key value"
                      className="input-field w-full"
                    />
                  </div>
                </div>
              )}

              {modalMode === "edit" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Value
                    </label>
                    <input
                      type="text"
                      value={keyEditValue}
                      onChange={(e) => setKeyEditValue(e.target.value)}
                      placeholder="Enter new key value"
                      className="input-field w-full"
                    />
                  </div>
                </div>
              )}

              {modalMode === "bulk" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Digital Keys (comma-separated)
                    </label>
                    <textarea
                      value={bulkKeys}
                      onChange={(e) => setBulkKeys(e.target.value)}
                      placeholder="Enter keys separated by commas"
                      className="input-field w-full"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Example: KEY-001, KEY-002, KEY-003
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end mt-6">
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleModalSubmit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  disabled={
                    (modalMode === "add" && !newKeyValue.trim()) ||
                    (modalMode === "edit" && !keyEditValue.trim()) ||
                    (modalMode === "bulk" && !bulkKeys.trim())
                  }
                >
                  {modalMode === "add" && "Add Key"}
                  {modalMode === "edit" && "Update Key"}
                  {modalMode === "bulk" && "Assign Keys"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
