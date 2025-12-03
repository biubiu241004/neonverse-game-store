import api from "../services/api";
import { useEffect, useState } from "react";
import { getUserOrders, requestCancel } from "../services/orderService";
import { motion, AnimatePresence } from "framer-motion";

const statuses = {
  pending: "Menunggu Konfirmasi",
  processing: "Sedang Diproses",
  completed: "Pesanan Selesai",
  cancel_request: "Menunggu Pembatalan",
  cancelled: "Pesanan Dibatalkan",
};

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [userReason, setUserReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [errorShake, setErrorShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState(null);
  const [reviewGameId, setReviewGameId] = useState(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const userReasons = [
    "Berubah pikiran",
    "Salah memilih produk",
    "Tidak jadi membeli",
    "Harga tidak sesuai",
    "Proses terlalu lama",
  ];

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await getUserOrders();
      setOrders(res.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const openCancelModal = (orderId) => {
    setCancelOrderId(orderId);
    setShowCancelModal(true);
  };

  const submitCancelRequest = async () => {
    if (!userReason) return;

    try {
      await requestCancel(cancelOrderId, userReason);
      setToast({ type: "success", msg: "Permintaan pembatalan dikirim!" });
      setShowCancelModal(false);
      setUserReason("");
      load();
    } catch (err) {
      setToast({ type: "error", msg: "Gagal mengirim permintaan." });
    }
  };

  const confirmReceived = async (orderId, gameId) => {
    try {
      await api.put(
        `/api/orders/receive/${orderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setReviewOrderId(orderId);
      setReviewGameId(gameId);
      setShowReviewModal(true);
    } catch {
      setToast({ type: "error", msg: "Gagal mengupdate status" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b14] text-white p-8 pt-24">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 px-4 py-2 rounded-lg text-white ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.msg}
            <button className="ml-3 font-bold" onClick={() => setToast(null)}>
              ✖
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <h1 className="text-3xl font-bold text-neonPurple mb-6">
        📘 Riwayat Pesanan
      </h1>

      {loading ? (
        <p className="text-center">Memuat...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-400 text-center">Belum ada pesanan.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#141420] border border-neonPurple/40 rounded-xl p-5"
            >
              <h2 className="text-neonPink font-semibold">{order._id}</h2>

              <p className="text-sm mt-1">
                <b>Total:</b> Rp {order.totalAmount.toLocaleString()}
              </p>

              <p className="text-sm mt-1">
                <b>Status:</b>{" "}
                <span className="bg-neonPurple/30 px-2 py-1 rounded-full text-xs">
                  {statuses[order.status]}
                </span>
              </p>

              {/* Tombol pembatalan */}
              {["pending", "processing"].includes(order.status) && (
                <button
                  onClick={() => openCancelModal(order._id)}
                  className="mt-3 w-full bg-red-600 py-2 rounded-lg hover:bg-red-700"
                >
                  Ajukan Pembatalan
                </button>
              )}

              {order.status === "cancel_request" && (
                <p className="text-yellow-300 mt-3 text-sm">
                  Menunggu persetujuan admin...
                </p>
              )}

              <button
                className="mt-3 w-full bg-neonBlue py-2 rounded-lg hover:bg-blue-700"
                onClick={() => setSelected(order)}
              >
                Detail
              </button>
              {selected.status === "completed" && (
                <button
                  className="mt-3 w-full bg-green-600 py-2 rounded-lg"
                  onClick={() =>
                    confirmReceived(selected._id, selected.items[0].game._id)
                  }
                >
                  Pesanan Diterima
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Detail */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-[#141420] w-[90%] md:w-[450px] p-6 rounded-xl border border-neonPurple"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-neonPink mb-3">
                Detail Pesanan
              </h2>

              <p>
                <b>ID:</b> {selected._id}
              </p>
              <p>
                <b>Status:</b> {statuses[selected.status]}
              </p>

              <h3 className="mt-3 font-bold">Item:</h3>
              <ul className="list-disc ml-6 text-sm">
                {selected.items.map((item) => (
                  <li key={item._id}>
                    {item.game?.title} ({item.quantity}x)
                  </li>
                ))}
              </ul>

              {selected.cancelReasonUser && (
                <p className="mt-3 text-yellow-300">
                  <b>Alasan User:</b> {selected.cancelReasonUser}
                </p>
              )}

              {selected.cancelReasonAdmin && (
                <p className="mt-2 text-red-300">
                  <b>Alasan Admin:</b> {selected.cancelReasonAdmin}
                </p>
              )}

              <button
                className="mt-5 w-full bg-neonBlue py-2 rounded-lg hover:bg-blue-700"
                onClick={() => setSelected(null)}
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal pembatalan */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-[#141420] w-[90%] md:w-[400px] p-6 rounded-xl border border-yellow-400 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-yellow-300 mb-3">
                Ajukan Pembatalan
              </h2>

              {/* ALASAN DROPDOWN */}
              <label className="font-semibold text-sm">Pilih Alasan:</label>
              <select
                className={`w-full bg-[#1e1e2d] border ${
                  errorMessage && !userReason
                    ? "border-red-500"
                    : "border-yellow-400"
                } p-2 rounded-lg text-white mt-1`}
                value={userReason}
                onChange={(e) => {
                  setUserReason(e.target.value);
                  setErrorMessage("");
                }}
              >
                <option value="">-- Pilih alasan --</option>
                {userReasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
                <option value="other">Alasan Lain...</option>
              </select>

              {/* TEXTAREA */}
              {userReason === "other" && (
                <textarea
                  className={`w-full bg-[#1e1e2d] border ${
                    errorMessage && customReason.trim() === ""
                      ? "border-red-500"
                      : "border-yellow-400"
                  } p-3 rounded-lg text-white mt-3`}
                  rows={3}
                  placeholder="Tulis alasan lainnya..."
                  value={customReason}
                  onChange={(e) => {
                    setCustomReason(e.target.value);
                    setErrorMessage("");
                  }}
                />
              )}

              {/* PESAN ERROR */}
              {errorMessage && (
                <p className="text-red-400 text-sm mt-2">{errorMessage}</p>
              )}

              {/* TOMBOL KIRIM */}
              <motion.button
                animate={errorShake ? { x: [-8, 8, -8, 8, 0] } : {}}
                transition={{ duration: 0.4 }}
                onClick={async () => {
                  if (!userReason) {
                    setErrorMessage("Pilih alasan pembatalan dulu bg 🙏");
                    setErrorShake(true);
                    setTimeout(() => setErrorShake(false), 500);
                    return;
                  }

                  if (userReason === "other" && customReason.trim() === "") {
                    setErrorMessage("Isi alasan tambahan dulu ya bg 😭");
                    setErrorShake(true);
                    setTimeout(() => setErrorShake(false), 500);
                    return;
                  }

                  const finalReason =
                    userReason === "other" ? customReason : userReason;

                  await requestCancel(cancelOrderId, finalReason);
                  setShowCancelModal(false);
                  setUserReason("");
                  setCustomReason("");
                  setErrorMessage("");
                  load();
                }}
                className="mt-4 w-full bg-red-600 py-2 rounded-lg hover:bg-red-700"
              >
                Kirim Permintaan
              </motion.button>

              {/* TOMBOL BATAL */}
              <button
                className="mt-3 w-full bg-gray-600 py-2 rounded-lg hover:bg-gray-700"
                onClick={() => {
                  setShowCancelModal(false);
                  setUserReason("");
                  setCustomReason("");
                  setErrorMessage("");
                }}
              >
                Batal
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-[#141420] w-[90%] md:w-[400px] p-6 rounded-xl border border-neonPurple"
            >
              <h2 className="text-xl font-bold text-neonPink mb-3">
                Beri Review
              </h2>

              <label>Rating:</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="bg-[#1e1e2d] w-full p-2 rounded mb-3"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} ⭐
                  </option>
                ))}
              </select>

              <textarea
                placeholder="Tulis komentar..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="bg-[#1e1e2d] w-full p-3 rounded mb-3"
                rows={3}
              />

              <button
                onClick={async () => {
                  await api.post(
                    `/api/orders/review/${reviewOrderId}/${reviewGameId}`,
                    { rating, comment },
                    {
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                          "token"
                        )}`,
                      },
                    }
                  );

                  setToast({
                    type: "success",
                    msg: "Review berhasil dikirim!",
                  });
                  setShowReviewModal(false);
                  load();
                }}
                className="w-full bg-neonBlue py-2 rounded"
              >
                Kirim Review
              </button>

              <button
                onClick={() => setShowReviewModal(false)}
                className="w-full mt-3 bg-gray-700 py-2 rounded"
              >
                Batal
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
