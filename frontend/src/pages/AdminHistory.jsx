import { useEffect, useState } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminHistory() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get("/api/orders/admin/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const history = res.data.filter(
        (o) =>
          o.status === "completed" || o.status === "received" || o.status === "cancelled"
      );

      setOrders(history);
      setFiltered(history);
    } catch (err) {
      console.error("Error load history:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    let data = [...orders];

    if (search.trim() !== "") {
      data = data.filter(
        (o) =>
          o._id.toLowerCase().includes(search.toLowerCase()) ||
          o.user.username.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (date !== "") {
      data = data.filter(
        (o) => new Date(o.createdAt).toLocaleDateString("en-CA") === date
      );
    }

    setFiltered(data);
  }, [orders, search, date]);

  return (
    <div className="text-white">
      <h1 className="text-2xl font-bold text-neonPink mb-6 flex items-center gap-2">
        📜 Riwayat Order
      </h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="date"
          className="bg-[#141420] border border-neonPurple px-4 py-2 rounded-lg"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="text"
          placeholder="Cari ID / username..."
          className="flex-1 bg-[#141420] border border-neonPurple px-4 py-2 rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-gray-400">Memuat...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">Tidak ada riwayat ditemukan.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#141420] border border-neonPurple/40 rounded-xl p-5"
            >
              <h2 className="text-neonPink font-semibold">{order._id}</h2>

              <p className="text-sm mt-1">
                <b>Pembeli:</b> {order.user.username}
              </p>

              <p className="text-sm">
                <b>Total:</b> Rp {order.totalAmount.toLocaleString()}
              </p>

              <p className="text-sm mt-1">
                <b>Status:</b>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    order.status === "completed"
                      ? "bg-green-500/30 text-green-300"
                      : "bg-red-500/30 text-red-300"
                  }`}
                >
                  {order.status === "completed"
                    ? "Pesanan Selesai"
                    : "Pesanan Dibatalkan"}
                </span>
              </p>

              <button
                className="mt-4 w-full bg-neonBlue py-2 rounded-lg hover:bg-blue-700"
                onClick={() => setSelectedOrder(order)}
              >
                Detail
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedOrder && (
          <DetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const DetailModal = ({ order, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.8 }}
      className="bg-[#141420] w-[90%] md:w-[450px] p-6 rounded-xl border border-neonPurple"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-xl font-bold text-neonPink mb-3">Detail Order</h2>

      <p><b>ID:</b> {order._id}</p>
      <p><b>Pembeli:</b> {order.user.username}</p>
      <p><b>Total:</b> Rp {order.totalAmount.toLocaleString()}</p>

      <p>
        <b>Status:</b>{" "}
        {order.status === "completed" ? "Pesanan Selesai" : "Pesanan Dibatalkan"}
      </p>

      {order.cancelReasonUser && (
        <p className="mt-2 text-yellow-300 text-sm">
          <b>Alasan User:</b> {order.cancelReasonUser}
        </p>
      )}

      {order.cancelReasonAdmin && (
        <p className="mt-2 text-red-300 text-sm">
          <b>Alasan Admin:</b> {order.cancelReasonAdmin}
        </p>
      )}

      <h3 className="mt-3 font-bold text-neonGreen">Item:</h3>
      <ul className="list-disc ml-6 text-sm">
        {order.items.map((item) => (
          <li key={item._id}>
            {item.game?.title} ({item.quantity}x)
          </li>
        ))}
      </ul>

      <button
        className="mt-5 w-full bg-neonBlue py-2 rounded-lg hover:bg-blue-700"
        onClick={onClose}
      >
        Tutup
      </button>
    </motion.div>
  </motion.div>
);
