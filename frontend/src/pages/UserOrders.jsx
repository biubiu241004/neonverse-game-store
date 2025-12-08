import api from "../services/api";
import { useEffect, useState } from "react";
import { getUserOrders, requestCancel } from "../services/orderService";
import { motion, AnimatePresence } from "framer-motion";

const statuses = {
  pending: "Menunggu Konfirmasi",
  processing: "Sedang Diproses",
  completed: "Pesanan Selesai",
  received: "Pesanan Diterima",
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
    "other",
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

  const openCancelModal = (id) => {
    setCancelOrderId(id);
    setShowCancelModal(true);
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
      load();
    } catch {
      setToast({ type: "error", msg: "Gagal mengupdate status" });
    }
  };

  const submitCancelRequest = async () => {
    if (!userReason) {
      setErrorMessage("Pilih alasan pembatalan dulu bg 🙏");
      shake();
      return;
    }

    if (userReason === "other" && customReason.trim() === "") {
      setErrorMessage("Isi alasan tambahan dulu ya bg 😭");
      shake();
      return;
    }

    try {
      const finalReason = userReason === "other" ? customReason : userReason;

      await requestCancel(cancelOrderId, finalReason);

      setToast({ type: "success", msg: "Permintaan pembatalan dikirim!" });
      setShowCancelModal(false);
      setUserReason("");
      setCustomReason("");
      load();
    } catch (err) {
      setToast({ type: "error", msg: "Gagal mengirim permintaan." });
    }
  };

  const shake = () => {
    setErrorShake(true);
    setTimeout(() => setErrorShake(false), 500);
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
            className={`fixed top-5 right-5 px-4 py-2 rounded-lg ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.msg}
            <button onClick={() => setToast(null)} className="ml-3">
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

              {["pending", "processing"].includes(order.status) && (
                <button
                  onClick={() => openCancelModal(order._id)}
                  className="mt-3 w-full bg-red-600 py-2 rounded-lg hover:bg-red-700"
                >
                  Ajukan Pembatalan
                </button>
              )}

              {order.status === "completed" && (
                <button
                  className="mt-3 w-full bg-green-600 py-2 rounded-lg hover:bg-green-700"
                  onClick={() => {
                    const gameId = order.items?.[0]?.game?._id;
                    if (!gameId) {
                      setToast({
                        type: "error",
                        msg: "Game tidak ditemukan pada order ini",
                      });
                      return;
                    }
                    confirmReceived(order._id, gameId);
                  }}
                >
                  Pesanan Diterima
                </button>
              )}

              <button
                className="mt-3 w-full bg-neonBlue py-2 rounded-lg hover:bg-blue-700"
                onClick={() => setSelected(order)}
              >
                Detail
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* =========================== */}
      {/* MODAL DETAIL */}
      {/* =========================== */}
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
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141420] w-[90%] md:w-[450px] p-6 rounded-xl border border-neonPurple"
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

              {selected.status === "completed" && (
                <button
                  className="mt-3 w-full bg-green-600 py-2 rounded-lg"
                  onClick={() => {
                    const gameId = selected.items[0].game?._id;
                    confirmReceived(selected._id, gameId);
                  }}
                >
                  Pesanan Diterima
                </button>
              )}

              <button
                className="mt-5 w-full bg-neonBlue py-2 rounded-lg"
                onClick={() => setSelected(null)}
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================== */}
      {/* MODAL REVIEW */}
      {/* =========================== */}
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

      {/* =========================== */}
      {/* MODAL PEMBATALAN (DENGAN ERROR + SHAKE) */}
      {/* =========================== */}

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
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141420] w-[90%] md:w-[400px] p-6 rounded-xl border border-yellow-400 shadow-lg"
            >
              <h2 className="text-xl font-bold text-yellow-300 mb-3">
                Ajukan Pembatalan
              </h2>

              <label className="font-semibold text-sm">Pilih Alasan:</label>

              <motion.select
                animate={errorShake ? { x: [-6, 6, -6, 6, 0] } : {}}
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

                <option value="Berubah pikiran">Berubah pikiran</option>
                <option value="Salah memilih produk">
                  Salah memilih produk
                </option>
                <option value="Tidak jadi membeli">Tidak jadi membeli</option>
                <option value="Harga tidak sesuai">Harga tidak sesuai</option>
                <option value="Proses terlalu lama">Proses terlalu lama</option>
                <option value="other">Alasan lain...</option>
              </motion.select>

              {/* TEXTAREA alasan lain */}
              {userReason === "other" && (
                <motion.textarea
                  animate={errorShake ? { x: [-6, 6, -6, 6, 0] } : {}}
                  className={`w-full bg-[#1e1e2d] border ${
                    errorMessage && customReason.trim() === ""
                      ? "border-red-500"
                      : "border-yellow-400"
                  } p-3 rounded-lg text-white mt-3`}
                  placeholder="Tulis alasan tambahan..."
                  rows={3}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              )}

              {errorMessage && (
                <p className="text-red-400 text-sm mt-2">{errorMessage}</p>
              )}

              <button
                onClick={submitCancelRequest}
                className="mt-4 w-full bg-red-600 py-2 rounded-lg hover:bg-red-700"
              >
                Kirim Permintaan
              </button>

              <button
                onClick={() => setShowCancelModal(false)}
                className="mt-3 w-full bg-gray-600 py-2 rounded-lg hover:bg-gray-700"
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
