import { useEffect, useState } from "react";
import { getAdminOrders, updateOrderStatus } from "../services/orderService";
import { motion, AnimatePresence } from "framer-motion";

// Toast component
const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`fixed top-5 right-5 px-4 py-2 rounded-lg shadow-lg text-white ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    }`}
  >
    {message}
    <button onClick={onClose} className="ml-3 font-bold">✖</button>
  </motion.div>
);

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState(null);

  const statuses = {
    pending: "Menunggu Konfirmasi",
    processing: "Perlu Diproses",
    completed: "Pesanan Selesai",
    cancel_request: "Sedang Dibatalkan",
    cancelled: "Pesanan Dibatalkan",
  };

  useEffect(() => { loadOrders(); }, []);
  useEffect(() => { applyFilters(); }, [orders, filterStatus, search]);

  const loadOrders = async () => {
    try {
      const res = await getAdminOrders();
      setOrders(res.data);
    } catch (_) {
      setToast({ message: "Gagal memuat order admin", type: "error" });
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let data = [...orders];

    if (filterStatus !== "all") {
      data = data.filter((o) => o.status === filterStatus);
    }

    if (search.trim() !== "") {
      data = data.filter((o) =>
        o._id.toLowerCase().includes(search.toLowerCase()) ||
        o.user.username.toLowerCase().includes(search.toLowerCase()) ||
        o.items.some((i) =>
          i.game?.title.toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    setFiltered(data);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setToast({ message: "Status berhasil diperbarui", type: "success" });
      loadOrders();
    } catch (_) {
      setToast({ message: "Gagal memperbarui status", type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b14] text-white p-8 pt-24">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>

      <h1 className="text-3xl font-bold mb-6 text-neonPurple">📦 Order Masuk</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 mb-8">
        <StatCard title="Semua Pesanan" value={orders.length} color="neonPink" />
        <StatCard title="Menunggu Konfirmasi" value={orders.filter(o => o.status === "pending").length} color="yellow" />
        <StatCard title="Perlu Diproses" value={orders.filter(o => o.status === "processing").length} color="blue" />
        <StatCard title="Selesai" value={orders.filter(o => o.status === "completed").length} color="green" />
        <StatCard title="Dibatalkan" value={orders.filter(o => o.status === "cancelled").length} color="red" />
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          className="bg-[#141420] border border-neonPurple text-white px-4 py-2 rounded-lg"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Semua Status</option>
          {Object.entries(statuses).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Cari ID / user / game..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#141420] border border-neonPurple px-4 py-2 rounded-lg"
        />
      </div>

      {/* Loading / Empty */}
      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <Empty />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(order => (
            <OrderCard
              key={order._id}
              order={order}
              statuses={statuses}
              onSelect={() => setSelectedOrder(order)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            statuses={statuses}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminOrders;

/* COMPONENTS */

const StatCard = ({ title, value, color }) => {
  const colors = {
    neonPink: "border-neonPink/50 text-neonPink",
    yellow: "border-yellow-300/50 text-yellow-300",
    green: "border-green-500/50 text-green-400",
    red: "border-red-500/50 text-red-400",
    blue: "border-blue-500/50 text-blue-400",
  };

  return (
    <div className={`bg-[#141420] p-6 rounded-xl border shadow-lg ${colors[color]}`}>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-3xl mt-2">{value}</p>
    </div>
  );
};

const OrderCard = ({ order, statuses, onStatusChange, onSelect }) => {

  const renderActions = () => {
    switch (order.status) {

      case "pending":
        return (
          <>
            <button
              onClick={() => onStatusChange(order._id, "processing")}
              className="w-full mt-3 bg-neonPurple py-2 rounded-lg hover:bg-purple-700"
            >
              Konfirmasi Pesanan
            </button>

            <button
              onClick={() => onStatusChange(order._id, "cancelled")}
              className="w-full mt-2 bg-red-600 py-2 rounded-lg hover:bg-red-700"
            >
              Batalkan Pesanan
            </button>
          </>
        );

      case "processing":
        return (
          <>
            <button
              onClick={() => onStatusChange(order._id, "completed")}
              className="w-full mt-3 bg-green-600 py-2 rounded-lg hover:bg-green-700"
            >
              Tandai Selesai
            </button>

            <button
              onClick={() => onStatusChange(order._id, "cancelled")}
              className="w-full mt-2 bg-red-600 py-2 rounded-lg hover:bg-red-700"
            >
              Batalkan Pesanan
            </button>
          </>
        );

      case "cancel_request":
        return (
          <>
            <button
              onClick={() => onStatusChange(order._id, "cancelled")}
              className="w-full mt-3 bg-red-600 py-2 rounded-lg hover:bg-red-700"
            >
              Konfirmasi Pembatalan
            </button>

            <button
              onClick={() => onStatusChange(order._id, "processing")}
              className="w-full mt-2 bg-blue-600 py-2 rounded-lg hover:bg-blue-700"
            >
              Tolak Pembatalan
            </button>
          </>
        );

      case "completed":
      case "cancelled":
        return (
          <p className="text-gray-500 mt-3 italic">
            Status final — tidak dapat diubah
          </p>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#141420] border border-neonPurple/40 rounded-xl p-6"
    >
      <h2 className="text-neonPink font-semibold">{order._id}</h2>
      <p className="text-sm mt-1"><b>Pembeli:</b> {order.user.username}</p>
      <p className="text-sm"><b>Total:</b> Rp {order.totalAmount.toLocaleString()}</p>

      <p className="mt-1 text-sm">
        <b>Status:</b>{" "}
        <span className="bg-neonPurple/40 px-2 py-1 rounded-full text-xs">
          {statuses[order.status]}
        </span>
      </p>

      {renderActions()}

      <button
        className="mt-4 w-full bg-neonBlue py-2 rounded-lg hover:bg-blue-700"
        onClick={onSelect}
      >
        Detail
      </button>
    </motion.div>
  );
};

const Loading = () => (
  <div className="text-center text-gray-400 animate-pulse mt-20">
    <div className="text-4xl">⚡</div>
    <p className="mt-2">Memuat data...</p>
  </div>
);

const Empty = () => (
  <div className="text-center text-gray-400 text-lg mt-10">
    Tidak ada order ditemukan.
  </div>
);

const OrderDetailModal = ({ order, statuses, onClose }) => (
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
      className="bg-[#141420] w-[90%] md:w-[450px] p-6 rounded-xl border border-neonPurple shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-xl font-bold text-neonPink mb-3">Detail Order</h2>

      <p><b>ID:</b> {order._id}</p>
      <p><b>Pembeli:</b> {order.user.username}</p>
      <p><b>Total:</b> Rp {order.totalAmount.toLocaleString()}</p>

      <p><b>Status:</b> {statuses[order.status]}</p>

      <h3 className="mt-3 font-bold text-neonGreen">Item:</h3>
      <ul className="list-disc ml-6 text-sm">
        {order.items.map((item) => (
          <li key={item._id}>{item.game?.title} ({item.quantity}x)</li>
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
