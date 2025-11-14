import { useEffect, useState } from "react";
import { getAdminOrders, confirmOrder } from "../services/orderService";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const res = await getAdminOrders();
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat order admin");
    }
    setLoading(false);
  };

  const handleConfirm = async (orderId) => {
    try {
      await confirmOrder(orderId);
      alert("Order dikonfirmasi!");
      loadOrders();
    } catch (err) {
      console.error(err);
      alert("Gagal konfirmasi order");
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0b14] text-white p-8 pt-24">
      <h1 className="text-3xl font-bold mb-6 text-neonPurple drop-shadow-[0_0_12px_#a855f7]">
        📦 Order Masuk
      </h1>

      {loading ? (
        <p className="text-gray-400 animate-pulse">Loading...</p>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-400 text-lg mt-10">
          Tidak ada order untuk game Anda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-[#141420] border border-neonPurple/40 shadow-[0_0_15px_rgba(168,85,247,0.4)] rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold text-neonPink">
                Order ID: {order._id}
              </h2>

              <p className="mt-2 text-sm text-gray-300">
                <b>Pembeli:</b> {order.user?.username}
              </p>
              <p className="text-sm text-gray-300">
                <b>Total:</b> Rp {order.totalAmount.toLocaleString()}
              </p>

              <p className="text-sm mt-1">
                <b>Status:</b>{" "}
                <span
                  className={`px-3 py-1 rounded-full text-white text-xs ${
                    order.status === "confirmed"
                      ? "bg-green-600"
                      : "bg-yellow-600"
                  }`}
                >
                  {order.status}
                </span>
              </p>

              <div className="mt-3">
                <h3 className="font-bold text-neonGreen">Item:</h3>
                <ul className="ml-5 mt-1 text-gray-300 text-sm list-disc">
                  {order.items.map((item) => (
                    <li key={item._id}>
                      {item.game?.title} ({item.quantity}x)
                    </li>
                  ))}
                </ul>
              </div>

              {order.status !== "confirmed" && (
                <button
                  onClick={() => handleConfirm(order._id)}
                  className="mt-4 w-full py-2 bg-neonPurple text-white font-semibold rounded-lg hover:bg-purple-700 transition shadow-[0_0_10px_#a855f7]"
                >
                  Konfirmasi Order
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
