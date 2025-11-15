import { useEffect, useState } from "react";
import { getAdminOrders, updateOrderStatus } from "../services/orderService";
import { motion, AnimatePresence } from "framer-motion";

// 🔥 Toast Notifikasi
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
    <button onClick={onClose} className="ml-3 font-bold">
      ✖
    </button>
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

  // 🟣 Modal Pembatalan Admin
  const [adminCancelModal, setAdminCancelModal] = useState(false);
  const [adminCancelReason, setAdminCancelReason] = useState("");
  const [adminCancelOrderId, setAdminCancelOrderId] = useState(null);
  const [adminCustomReason, setAdminCustomReason] = useState("");

  const statuses = {
    pending: "Menunggu Konfirmasi",
    processing: "Perlu Diproses",
    completed: "Pesanan Selesai",
    cancel_request: "Sedang Dibatalkan",
    cancelled: "Pesanan Dibatalkan",
  };

  const adminCancelReasons = [
    "Game sedang tidak tersedia",
    "Pembayaran tidak valid",
    "Kesalahan sistem",
    "Pelanggaran aturan",
    "Masalah teknis",
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filterStatus, search]);

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
      data = data.filter(
        (o) =>
          o._id.toLowerCase().includes(search.toLowerCase()) ||
          o.user.username.toLowerCase().includes(search.toLowerCase()) ||
          o.items.some((i) =>
            i.game?.title.toLowerCase().includes(search.toLowerCase())
          )
      );
    }

    setFiltered(data);
  };

  // 🔥 Handle update status BINER (kecuali cancel admin)
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
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <h1 className="text-3xl font-bold mb-6 text-neonPurple">
        📦 Order Masuk
      </h1>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Semua Pesanan"
          value={orders.length}
          color="neonPink"
        />
        <StatCard
          title="Menunggu Konfirmasi"
          value={orders.filter((o) => o.status === "pending").length}
          color="yellow"
        />
        <StatCard
          title="Perlu Diproses"
          value={orders.filter((o) => o.status === "processing").length}
          color="blue"
        />
        <StatCard
          title="Selesai"
          value={orders.filter((o) => o.status === "completed").length}
          color="green"
        />
        <StatCard
          title="Dibatalkan"
          value={orders.filter((o) => o.status === "cancelled").length}
          color="red"
        />
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#141420] border border-neonPurple text-white px-4 py-2 rounded-lg"
        >
          <option value="all">Semua Status</option>
          {Object.entries(statuses).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
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

      {/* Order List */}
      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <Empty />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              statuses={statuses}
              onSelect={() => setSelectedOrder(order)} // 🔥 buat DETAIL jalan
              onAdminCancel={() => {
                setAdminCancelOrderId(order._id);
                setAdminCancelModal(true);
              }}
              // 🔥 Konfirmasi pembatalan user
              onAcceptUserCancel={() =>
                handleStatusChange(order._id, "cancelled")
              }
              // 🔥 Tolak pembatalan user
              onRejectUserCancel={() =>
                handleStatusChange(order._id, "processing")
              }
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {adminCancelModal && (
          <AdminCancelModal
            show={adminCancelModal}
            adminCancelReasons={adminCancelReasons}
            adminCancelReason={adminCancelReason}
            adminCustomReason={adminCustomReason}
            setAdminCancelReason={setAdminCancelReason}
            setAdminCustomReason={setAdminCustomReason}
            onClose={() => setAdminCancelModal(false)}
            onSubmit={async (finalReason) => {
              await updateOrderStatus(
                adminCancelOrderId,
                "cancelled",
                finalReason
              );

              setAdminCancelModal(false);
              setAdminCancelReason("");
              setAdminCustomReason("");
              loadOrders();
            }}
          />
        )}
      </AnimatePresence>
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

/* COMPONENTS */

/* ========== COMPONENTS LANJUTAN ========== */

const StatCard = ({ title, value, color }) => {
  const colors = {
    neonPink: "border-neonPink/50 text-neonPink",
    yellow: "border-yellow-300/50 text-yellow-300",
    green: "border-green-500/50 text-green-400",
    red: "border-red-500/50 text-red-400",
    blue: "border-blue-500/50 text-blue-400",
  };

  return (
    <div
      className={`bg-[#141420] p-6 rounded-xl border shadow-lg ${colors[color]}`}
    >
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-3xl mt-2">{value}</p>
    </div>
  );
};

/* ========== ORDER CARD ========== */

const OrderCard = ({
  order,
  statuses,
  onAdminCancel,
  onAcceptUserCancel,
  onRejectUserCancel,
  onStatusChange,
  onSelect,
}) => {
  const renderActions = () => {
    switch (order.status) {
      // ======================================
      // ⬤ STATUS: pending
      // ======================================
      case "pending":
        return (
          <>
            <button
              onClick={() => onStatusChange(order._id, "processing")}
              className="w-full mt-3 bg-neonPurple py-2 rounded-lg hover:bg-purple-700"
            >
              Konfirmasi Pesanan
            </button>

            {/* ADMIN CANCEL MANUAL */}
            <button
              onClick={onAdminCancel}
              className="w-full mt-2 bg-red-600 py-2 rounded-lg hover:bg-red-700"
            >
              Batalkan Pesanan
            </button>
          </>
        );

      // ======================================
      // ⬤ STATUS: processing
      // ======================================
      case "processing":
        return (
          <>
            <button
              onClick={() => onStatusChange(order._id, "completed")}
              className="w-full mt-3 bg-green-600 py-2 rounded-lg hover:bg-green-700"
            >
              Tandai Selesai
            </button>

            {/* ADMIN CANCEL MANUAL */}
            <button
              onClick={onAdminCancel}
              className="w-full mt-2 bg-red-600 py-2 rounded-lg hover:bg-red-700"
            >
              Batalkan Pesanan
            </button>
          </>
        );

      // ======================================
      // ⬤ STATUS: cancel_request (user meminta cancel)
      // ======================================
      case "cancel_request":
        return (
          <>
            {/* ADMIN TERIMA PEMBATALAN USER */}
            <button
              onClick={onAcceptUserCancel}
              className="w-full mt-3 bg-red-600 py-2 rounded-lg hover:bg-red-700"
            >
              Konfirmasi Pembatalan
            </button>

            {/* ADMIN TOLAK PEMBATALAN USER */}
            <button
              onClick={onRejectUserCancel}
              className="w-full mt-2 bg-blue-600 py-2 rounded-lg hover:bg-blue-700"
            >
              Tolak Pembatalan
            </button>
          </>
        );

      // ======================================
      // ⬤ STATUS FINAL
      // ======================================
      case "completed":
      case "cancelled":
        return (
          <p className="text-gray-400 mt-3 italic">
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

      <p className="text-sm">
        <b>Pembeli:</b> {order.user.username}
      </p>
      <p className="text-sm">
        <b>Total:</b> Rp {order.totalAmount.toLocaleString()}
      </p>

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

/* ========== LOADING ========== */

const Loading = () => (
  <div className="text-center text-gray-400 animate-pulse mt-20">
    <div className="text-4xl">⚡</div>
    <p className="mt-2">Memuat data...</p>
  </div>
);

/* ========== EMPTY ========== */

const Empty = () => (
  <div className="text-center text-gray-400 text-lg mt-10">
    Tidak ada order ditemukan.
  </div>
);

/* ========== DETAIL MODAL ========== */

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

      <p>
        <b>ID:</b> {order._id}
      </p>
      <p>
        <b>Pembeli:</b> {order.user.username}
      </p>
      <p>
        <b>Total:</b> Rp {order.totalAmount.toLocaleString()}
      </p>

      <p>
        <b>Status:</b> {statuses[order.status]}
      </p>

      {order.cancelReasonUser && (
        <p className="mt-2 text-sm text-yellow-300">
          <b>Alasan User:</b> {order.cancelReasonUser}
        </p>
      )}

      {order.cancelReasonAdmin && (
        <p className="mt-2 text-sm text-red-300">
          <b>Alasan Admin:</b> {order.cancelReasonAdmin}
        </p>
      )}

      <h3 className="mt-4 font-bold text-neonGreen">Item:</h3>
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

/* ========== MODAL ALASAN PEMBATALAN ADMIN ========== */

export const AdminCancelModal = ({
  show,
  adminCancelReasons,
  onClose,
  onSubmit,
  adminCancelReason,
  setAdminCancelReason,
  adminCustomReason,
  setAdminCustomReason,
}) => {
  const [errorShake, setErrorShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!show) return null;

  const handleSubmit = () => {
    // Validasi pilihan alasan
    if (!adminCancelReason) {
      setErrorMessage("Pilih alasan pembatalan dulu bg 🙏");
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
      return;
    }

    // Validasi alasan lain
    if (adminCancelReason === "other" && adminCustomReason.trim() === "") {
      setErrorMessage("Isi alasan tambahan dulu ya bg 😭");
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
      return;
    }

    const finalReason =
      adminCancelReason === "other" ? adminCustomReason : adminCancelReason;

    onSubmit(finalReason);
  };

  return (
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
        className="bg-[#141420] w-[90%] md:w-[400px] p-6 rounded-xl border border-red-500 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-red-400 mb-3">
          Alasan Pembatalan Admin
        </h2>

        {/* Dropdown alasan */}
        <label className="text-sm font-semibold">Pilih Alasan:</label>
        <select
          className={`w-full bg-[#1e1e2d] border ${
            errorMessage && !adminCancelReason
              ? "border-red-500"
              : "border-red-400"
          } p-2 rounded-lg text-white mt-1`}
          value={adminCancelReason}
          onChange={(e) => {
            setAdminCancelReason(e.target.value);
            setErrorMessage("");
          }}
        >
          <option value="">-- Pilih alasan --</option>

          {adminCancelReasons.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}

          <option value="other">Alasan Lain...</option>
        </select>

        {/* Textarea jika “alasan lain” */}
        {adminCancelReason === "other" && (
          <textarea
            className={`w-full bg-[#1e1e2d] border ${
              errorMessage && adminCustomReason.trim() === ""
                ? "border-red-500"
                : "border-red-400"
            } p-3 rounded-lg text-white mt-3`}
            rows={3}
            placeholder="Tulis alasan tambahan admin..."
            value={adminCustomReason}
            onChange={(e) => {
              setAdminCustomReason(e.target.value);
              setErrorMessage("");
            }}
          />
        )}

        {/* Pesan error */}
        {errorMessage && (
          <p className="text-red-400 text-sm mt-2 animate-pulse">
            {errorMessage}
          </p>
        )}

        {/* Tombol submit */}
        <motion.button
          animate={errorShake ? { x: [-8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
          onClick={handleSubmit}
          className="mt-4 w-full bg-red-600 py-2 rounded-lg hover:bg-red-700"
        >
          Batalkan Pesanan
        </motion.button>

        {/* Tombol batal */}
        <button
          onClick={() => {
            onClose();
            setErrorMessage("");
            setAdminCancelReason("");
            setAdminCustomReason("");
          }}
          className="mt-3 w-full bg-gray-600 py-2 rounded-lg hover:bg-gray-700"
        >
          Batal
        </button>
      </motion.div>
    </motion.div>
  );
};

export default AdminOrders;
