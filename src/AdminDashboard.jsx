import { useState } from "react";

const API_BASE = "http://localhost:4002";
import { useProducts } from "./ProductContext";

export default function AdminDashboard() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    addKeysToOrder,
  } = useProducts();

  const [form, setForm] = useState({
    name: "",
    price: "",
    logo: "",
    quantity: 1,
  });
  const [editingProduct, setEditingProduct] = useState(null);

  // Add product
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    addProduct({
      ...form,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity) || 0,
    });

    setForm({ name: "", price: "", logo: "", quantity: 1 });
  };

  // Save edited product
  const handleEditSave = (e) => {
    e.preventDefault();
    updateProduct(editingProduct.id, {
      name: editingProduct.name,
      price: parseFloat(editingProduct.price),
      quantity: parseInt(editingProduct.quantity) || 0,
      logo: editingProduct.logo,
    });
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-gray-900 font-inter">
      {/* Header */}
      <header className="w-full bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
          <h1 className="text-2xl font-bold text-[#2563EB] font-poppins">
            DigiStore Admin
          </h1>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-12">
        {/* Add Product Form */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-10">
          <h3 className="text-xl font-semibold mb-4">Add New Product</h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Product Name"
              className="border rounded-lg px-4 py-2"
            />
            <input
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Price"
              className="border rounded-lg px-4 py-2"
            />
            <input
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="Quantity"
              className="border rounded-lg px-4 py-2"
            />
            <input
              value={form.logo}
              onChange={(e) => setForm({ ...form, logo: e.target.value })}
              placeholder="Icon (emoji)"
              className="border rounded-lg px-4 py-2"
            />
            <button className="md:col-span-2 py-2 rounded-lg bg-[#2563EB] text-white hover:bg-[#1E40AF]">
              Add Product
            </button>
          </form>
        </div>

        {/* Manage Products */}
        <h3 className="text-2xl font-semibold mb-6">Manage Products</h3>
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow-md p-4 flex justify-between items-center"
            >
              {editingProduct?.id === p.id ? (
                // Edit Mode
                <form
                  onSubmit={handleEditSave}
                  className="flex flex-col gap-2 w-full"
                >
                  <input
                    type="text"
                    className="p-2 border rounded"
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        name: e.target.value,
                      })
                    }
                  />
                  <input
                    type="number"
                    className="p-2 border rounded"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: e.target.value,
                      })
                    }
                  />
                  <input
                    type="number"
                    className="p-2 border rounded"
                    value={editingProduct.quantity}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        quantity: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="p-2 border rounded"
                    value={editingProduct.logo}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        logo: e.target.value,
                      })
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // View Mode
                <div className="flex justify-between w-full items-center">
                  <span className="text-lg">
                    {p.logo} {p.name} — ${p.price} (x{p.quantity})
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingProduct(p)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Orders Management */}
        <h3 className="text-2xl font-semibold mt-10 mb-6">Orders</h3>
        {orders.map((o) => (
          <div key={o.id} className="bg-white rounded-lg p-4 mb-4 shadow">
            <p className="font-semibold">
              {o.product} - {o.price}
            </p>
            <p>Status: {o.status}</p>
            {o.status !== "Paid" && (
              <button
                onClick={() => addKeysToOrder(o.id, ["SAMPLE-KEY-12345"])}
                className="mt-2 px-3 py-1 rounded bg-green-600 text-white"
              >
                Mark as Paid + Add Key
              </button>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
