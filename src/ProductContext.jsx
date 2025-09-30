// import { createContext, useContext, useEffect, useState } from "react";

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4002";
// import { useAuth } from "./AuthContext";

// const ProductContext = createContext();

// export function ProductProvider({ children }) {
//   const { user } = useAuth();
//   const [products, setProducts] = useState(() => {
//     // const saved = localStorage.getItem("products");
//     // return saved
//     //   ? JSON.parse(saved)
//     //   : [
//     //       {
//     //         id: 1,
//     //         name: "Windows 11 Pro Key",
//     //         price: 15.99,
//     //         quantity: 10,
//     //         logo: "💻",
//     //       },
//     //       {
//     //         id: 2,
//     //         name: "Amazon $50 Gift Card",
//     //         price: 48,
//     //         quantity: 20,
//     //         logo: "🎁",
//     //       },
//     //     ];
//   });

//   const [orders, setOrders] = useState(() => {
//     const saved = localStorage.getItem("orders");
//     return saved ? JSON.parse(saved) : [];
//   });

//   const [settings, setSettings] = useState(() => {
//     const saved = localStorage.getItem("settings");
//     return saved ? JSON.parse(saved) : { enableCryptoBD: true };
//   });
//   useEffect(() => {
//     async function loadProducts() {
//       try {
//         const data = await fetchJSON("/products");
//         setProducts(data);
//       } catch (err) {
//         console.error("Error loading products:", err);
//         setError(err.error || "Failed to fetch products");
//       } finally {
//         setLoading(false);
//       }
//     }
//     let fetchProduct = loadProducts();
//     setProducts(fetchProduct);
//   }, [products]);

//   useEffect(() => {
//     localStorage.setItem("products", JSON.stringify(products));
//   }, [products]);
//   useEffect(() => {
//     localStorage.setItem("orders", JSON.stringify(orders));
//   }, [orders]);
//   useEffect(() => {
//     localStorage.setItem("settings", JSON.stringify(settings));
//   }, [settings]);

//   const addProduct = (product) =>
//     setProducts([...products, { ...product, id: Date.now() }]);
//   const updateProduct = (id, updated) =>
//     setProducts(products.map((p) => (p.id === id ? { ...p, ...updated } : p)));
//   const deleteProduct = (id) =>
//     setProducts(products.filter((p) => p.id !== id));

//   const placeOrder = (product) => {
//     if (!user) {
//       // UI should redirect to login; keep this guard
//       return null;
//     }
//     const order = {
//       id: Date.now(),
//       userId: user.id,
//       productId: product.id,
//       product: product.name,
//       price: product.price,
//       status: "Pending",
//       keys: [],
//       paymentInfo: null,
//       createdAt: new Date().toISOString(),
//     };
//     setOrders([...orders, order]);
//     return order;
//   };

//   const addManualPayment = ({ method, trxId, sender }) => {
//     if (!user) return;
//     // find the oldest pending order for this user
//     const lastOrder = orders.find(
//       (o) => o.userId === user.id && o.status === "Pending"
//     );
//     if (!lastOrder) return;
//     const updated = {
//       ...lastOrder,
//       paymentInfo: { method, trxId, sender },
//       status: "AwaitingConfirmation",
//     };
//     setOrders(orders.map((o) => (o.id === lastOrder.id ? updated : o)));
//   };

//   const addKeysToOrder = (orderId, keys) => {
//     setOrders(
//       orders.map((o) => (o.id === orderId ? { ...o, status: "Paid", keys } : o))
//     );
//   };

//   const getOrdersForUser = (uid) => orders.filter((o) => o.userId === uid);
//   const getAllOrders = () => orders;

//   return (
//     <ProductContext.Provider
//       value={{
//         products,
//         addProduct,
//         updateProduct,
//         deleteProduct,
//         orders,
//         placeOrder,
//         addManualPayment,
//         addKeysToOrder,
//         settings,
//         setSettings,
//         getOrdersForUser,
//         getAllOrders,
//       }}
//     >
//       {children}
//     </ProductContext.Provider>
//   );
// }

// export const useProducts = () => useContext(ProductContext);

import { createContext, useContext, useEffect, useState } from "react";
import { fetchJSON } from "./apiBase";

const API_BASE = "http://localhost:4002";
import { useAuth } from "./AuthContext";

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("orders");
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("settings");
    return saved ? JSON.parse(saved) : { enableCryptoBD: true };
  });

  // Helper function for API calls
  // async function fetchJSON(endpoint, options = {}) {
  //   try {
  //     const response = await fetch(`${API_BASE}${endpoint}`, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         ...options.headers,
  //       },
  //       ...options,
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     return await response.json();
  //   } catch (err) {
  //     console.error("API call failed:", err);
  //     throw err;
  //   }
  // }

  // Fetch products on component mount
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchJSON("/products");
        setProducts(data);
      } catch (err) {
        console.error("Error loading products:", err);
        setError(err.message || "Failed to fetch products");
        // Optionally set fallback products if API fails
        setProducts(getFallbackProducts());
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []); // Remove products from dependency array to avoid infinite loops

  // Fallback products in case API fails
  function getFallbackProducts() {
    return [
      {
        id: 1,
        name: "Windows 11 Pro Key",
        price: 15.99,
        quantity: 10,
        logo: "💻",
      },
      {
        id: 2,
        name: "Amazon $50 Gift Card",
        price: 48,
        quantity: 20,
        logo: "🎁",
      },
    ];
  }

  // Save to localStorage whenever products change
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem("products", JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  // Product CRUD operations
  const addProduct = async (product) => {
    try {
      // If you want to save to API first
      const newProduct = await fetchJSON("/products", {
        method: "POST",
        body: JSON.stringify(product),
      });

      // Then update local state
      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      console.error("Error adding product:", err);
      // Fallback to local state if API fails
      const localProduct = { ...product, id: Date.now() };
      setProducts((prev) => [...prev, localProduct]);
      return localProduct;
    }
  };

  const updateProduct = async (id, updated) => {
    try {
      // Update in API first
      const updatedProduct = await fetchJSON(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(updated),
      });

      // Then update local state
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? updatedProduct : p))
      );
      return updatedProduct;
    } catch (err) {
      console.error("Error updating product:", err);
      // Fallback to local state update
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
      );
    }
  };

  const deleteProduct = async (id) => {
    try {
      // Delete from API first
      await fetchJSON(`/products/${id}`, {
        method: "DELETE",
      });

      // Then update local state
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
      // Fallback to local state deletion
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Refresh products function
  const refreshProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchJSON("/products");
      setProducts(data);
    } catch (err) {
      console.error("Error refreshing products:", err);
      setError(err.message || "Failed to refresh products");
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async (product) => {
    if (!user) {
      return null;
    }
    
    // Create order object
    const order = {
      id: Date.now(),
      userId: user.id,
      productId: product.id,
      product: product.name,
      price: product.price,
      status: "Pending",
      keys: [],
      paymentInfo: null,
      createdAt: new Date().toISOString(),
    };
    
    try {
      // Save to database first - API expects only productId
      console.log("Creating order with productId:", product.id);
      const dbOrder = await fetchJSON("/orders", {
        method: "POST",
        body: {
          productId: parseInt(product.id), // Ensure productId is a number
        },
      });
      
      // Update order with database ID and include full order data
      const finalOrder = { 
        ...order, 
        id: dbOrder.id,
        status: "pending", // API sets initial status
      };
      
      // Save to localStorage as well for real-time detection
      setOrders([...orders, finalOrder]);
      
      return finalOrder;
    } catch (err) {
      console.error("Error saving order to database:", err);
      // Fallback to localStorage only if database fails
      setOrders([...orders, order]);
      return order;
    }
  };

  const addManualPayment = async ({ method, trxId, sender }) => {
    if (!user) return;
    const lastOrder = orders.find(
      (o) => o.userId === user.id && o.status === "Pending"
    );
    if (!lastOrder) return;
    
    try {
      // Send payment info to database using the payment endpoint
      const paymentData = {
        method: method,
        trxId: trxId,
        sender: sender,
      };
      
      await fetchJSON(`/orders/${lastOrder.id}/payment`, {
        method: "POST",
        body: paymentData,
      });
      
      // Update localStorage with the new status
      const updated = {
        ...lastOrder,
        paymentInfo: { method, trxId, sender },
        status: "awaiting_confirmation", // Match backend status
      };
      setOrders(orders.map((o) => (o.id === lastOrder.id ? updated : o)));
      
    } catch (err) {
      console.error("Error saving payment to database:", err);
      // Fallback to localStorage only if database fails
      const updated = {
        ...lastOrder,
        paymentInfo: { method, trxId, sender },
        status: "AwaitingConfirmation",
      };
      setOrders(orders.map((o) => (o.id === lastOrder.id ? updated : o)));
    }
  };

  const addKeysToOrder = (orderId, keys) => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status: "Paid", keys } : o))
    );
  };

  const getOrdersForUser = (uid) => orders.filter((o) => o.userId === uid);
  const getAllOrders = () => orders;

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        refreshProducts,
        orders,
        placeOrder,
        addManualPayment,
        addKeysToOrder,
        settings,
        setSettings,
        getOrdersForUser,
        getAllOrders,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};
