import { useProducts } from "./ProductContext";

const API_BASE = "http://localhost:4002";
import { useAuth } from "./AuthContext";

export default function CustomerDashboard() {
  const { orders } = useProducts();
  const { user } = useAuth();

  const myOrders = orders.filter(
    (o) => o.userId && user && o.userId === user.id
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-gray-900 font-inter">
      <header className="w-full bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
          <h1 className="text-2xl font-bold text-[#2563EB] font-poppins">
            My DigiStore
          </h1>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold font-poppins mb-8">My Orders</h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {myOrders.length === 0 && (
            <p className="text-gray-600">You have no orders yet.</p>
          )}
          {myOrders.map((o) => (
            <div key={o.id} className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-xl font-semibold">{o.product}</h3>
              <p>{o.price}</p>
              <p
                className={
                  o.status === "Paid" ? "text-green-600" : "text-yellow-600"
                }
              >
                {o.status}
              </p>
              {o.status === "Paid" && o.keys && o.keys.length > 0 && (
                <ul className="mt-3 bg-gray-100 rounded-lg p-2 text-sm">
                  {o.keys.map((k, idx) => (
                    <li key={idx} className="font-mono">
                      {k}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
