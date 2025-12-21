import { useEffect, useState } from "react";
import { getAdminOrders, updateOrderStatus } from "../services/orderService";
import { motion, AnimatePresence } from "framer-motion";

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
  const [toast, setToast] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [cancelModal, setCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const cancelReasons = [
    "Game sedang tidak tersedia",
    "Pembayaran tidak valid",
    "Kesalahan sistem",
    "Pelanggaran aturan",
    "Masalah teknis",
  ];

  const statuses = {
    pending: "Menunggu Konfirmasi",
    processing: "Sedang Diproses",
    cancel_request: "Menunggu Pembatalan",
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await getAdminOrders();

      const active = res.data.filter(
        (o) =>
          o.status === "pending" ||
          o.status === "processing" ||
          o.status === "cancel_request"
      );

      setOrders(active);
      setFiltered(active);
    } catch (err) {
      setToast({ type: "error", message: "Gagal memuat order admin" });
    }
    setLoading(false);
  };

  useEffect(() => {
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
  }, [orders, filterStatus, search]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      setToast({ type: "success", message: "Status berhasil diperbarui" });
      loadOrders();
    } catch {
      setToast({ type: "error", message: "Gagal memperbarui status" });
    }
  };

  return (
    <div className="text-white">

      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <h1 className="text-2xl font-bold text-neonPurple mb-6">
        📦 Order Aktif
      </h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#141420] border border-neonPurple px-4 py-2 rounded-lg"
        >
          <option value="all">Semua</option>
          <option value="pending">Menunggu Konfirmasi</option>
          <option value="processing">Sedang Diproses</option>
          <option value="cancel_request">Menunggu Pembatalan</option>
        </select>

        <input
          type="text"
          placeholder="Cari ID / user / game..."
          className="flex-1 bg-[#141420] border border-neonPurple px-4 py-2 rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

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
              onSelect={() => setSelectedOrder(order)}
              onAdminCancel={() => {
                setCancelOrderId(order._id);
                setCancelModal(true);
              }}
              onAcceptCancel={() =>
                handleStatusChange(order._id, "cancelled")
              }
              onRejectCancel={() =>
                handleStatusChange(order._id, "processing")
              }
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {cancelModal && (
          <CancelModal
            show={cancelModal}
            cancelReasons={cancelReasons}
            cancelReason={cancelReason}
            customReason={customReason}
            setCancelReason={setCancelReason}
            setCustomReason={setCustomReason}
            onClose={() => setCancelModal(false)}
            onSubmit={async (finalReason) => {
              await updateOrderStatus(cancelOrderId, "cancelled", finalReason);

              setCancelModal(false);
              setCancelReason("");
              setCustomReason("");
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

const Loading = () => (
  <p className="text-center text-gray-400 mt-10">Memuat...</p>
);

const Empty = () => (
  <p className="text-center text-gray-400 mt-10">Tidak ada order aktif.</p>
);

const OrderCard = ({
  order,
  statuses,
  onAdminCancel,
  onAcceptCancel,
  onRejectCancel,
  onStatusChange,
  onSelect,
}) => (
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

    {order.status === "pending" && (
      <>
        <button
          onClick={() => onStatusChange(order._id, "processing")}
          className="mt-3 w-full bg-neonPurple py-2 rounded-lg"
        >
          Konfirmasi
        </button>
        <button
          onClick={onAdminCancel}
          className="mt-2 w-full bg-red-600 py-2 rounded-lg"
        >
          Batalkan
        </button>
      </>
    )}

    {order.status === "processing" && (
      <>
        <button
          onClick={() => onStatusChange(order._id, "completed")}
          className="mt-3 w-full bg-green-600 py-2 rounded-lg"
        >
          Tandai Selesai
        </button>
        <button
          onClick={onAdminCancel}
          className="mt-2 w-full bg-red-600 py-2 rounded-lg"
        >
          Batalkan
        </button>
      </>
    )}

    {order.status === "cancel_request" && (
      <>
        <button
          onClick={onAcceptCancel}
          className="mt-3 w-full bg-red-600 py-2 rounded-lg"
        >
          Terima Pembatalan
        </button>
        <button
          onClick={onRejectCancel}
          className="mt-2 w-full bg-blue-600 py-2 rounded-lg"
        >
          Tolak Pembatalan
        </button>
      </>
    )}

    <button
      onClick={onSelect}
      className="mt-4 w-full bg-neonBlue py-2 rounded-lg"
    >
      Detail
    </button>
  </motion.div>
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
      className="bg-[#141420] w-[90%] md:w-[450px] p-6 rounded-xl border border-neonPurple"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-xl font-bold text-neonPink mb-3">Detail Order</h2>

      <p><b>ID:</b> {order._id}</p>
      <p><b>Pembeli:</b> {order.user.username}</p>
      <p><b>Total:</b> Rp {order.totalAmount.toLocaleString()}</p>
      <p><b>Status:</b> {statuses[order.status]}</p>

      {order.cancelReasonUser && (
        <p className="mt-2 text-yellow-300">
          <b>Alasan User:</b> {order.cancelReasonUser}
        </p>
      )}

      <h3 className="mt-4 font-bold text-neonGreen">Item:</h3>
      <ul className="list-disc ml-6 text-sm">
        {order.items.map((i) => (
          <li key={i._id}>
            {i.game?.title} ({i.quantity}x)
          </li>
        ))}
      </ul>

      <button
        onClick={onClose}
        className="mt-5 w-full bg-neonBlue py-2 rounded-lg"
      >
        Tutup
      </button>
    </motion.div>
  </motion.div>
);

const CancelModal = ({
  show,
  cancelReasons,
  cancelReason,
  customReason,
  setCancelReason,
  setCustomReason,
  onClose,
  onSubmit,
}) => {
  const [error, setError] = useState("");

  if (!show) return null;

  const handleSubmit = () => {
    if (!cancelReason) return setError("Pilih alasan dulu bg 🙏");

    if (cancelReason === "other" && customReason.trim() === "")
      return setError("Isi alasan lain dulu 😭");

    onSubmit(cancelReason === "other" ? customReason : cancelReason);
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
        className="bg-[#141420] w-[90%] md:w-[400px] p-6 rounded-xl border border-red-500"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-red-400 mb-3">
          Alasan Pembatalan
        </h2>

        <select
          value={cancelReason}
          onChange={(e) => {
            setCancelReason(e.target.value);
            setError("");
          }}
          className="w-full bg-[#1e1e2d] border border-red-400 p-2 rounded-lg"
        >
          <option value="">-- Pilih alasan --</option>

          {cancelReasons.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}

          <option value="other">Alasan Lain...</option>
        </select>

        {cancelReason === "other" && (
          <textarea
            value={customReason}
            onChange={(e) => {
              setCustomReason(e.target.value);
              setError("");
            }}
            rows={3}
            placeholder="Tulis alasan tambahan..."
            className="w-full bg-[#1e1e2d] border border-red-400 p-2 rounded-lg mt-3"
          />
        )}

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

        <button
          onClick={handleSubmit}
          className="mt-4 w-full bg-red-600 py-2 rounded-lg"
        >
          Batalkan Pesanan
        </button>

        <button
          onClick={onClose}
          className="mt-3 w-full bg-gray-600 py-2 rounded-lg"
        >
          Batal
        </button>
      </motion.div>
    </motion.div>
  );
};

export default AdminOrders;
