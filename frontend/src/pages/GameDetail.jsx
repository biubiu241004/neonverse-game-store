import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { addToCart } from "../services/cartService";
import { getToken } from "../services/authService";

export default function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [canReview, setCanReview] = useState(false);

  const token = localStorage.getItem("token");
  const userRole = (() => {
    if (!token) return null;
    try {
      const d = JSON.parse(atob(token.split(".")[1]));
      return d.role;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    load();
    checkReviewEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    setLoading(true);
    try {
      const [{ data: g }, { data: r }, { data: revs }] = await Promise.all([
        api.get(`/api/games/${id}`),
        api.get(`/api/games/${id}/related`),
        api.get(`/api/games/${id}/reviews`),
      ]);

      setGame(g);
      setRelated(r);
      setReviews(revs);
    } catch (err) {
      console.error("Load game detail error:", err);
      setToast({ type: "error", msg: "Gagal memuat detail game" });
    } finally {
      setLoading(false);
    }
  }

  const handleAddToCart = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (userRole === "admin") {
      setToast({ type: "error", msg: "Admin tidak bisa checkout / keranjang" });
      return;
    }
    try {
      await addToCart(id, 1); // implementasi sesuai cartService kamu
      setToast({ type: "success", msg: "Berhasil ditambahkan ke cart" });
    } catch (err) {
      console.error(err);
      setToast({ type: "error", msg: "Gagal menambahkan ke cart" });
    }
  };

  const handleBuyNow = async () => {
    if (!token) return navigate("/login");
    if (userRole === "admin") {
      setToast({ type: "error", msg: "Admin tidak bisa membeli" });
      return;
    }
    try {
      const res = await api.post(
        "/api/orders/checkout",
        { items: [{ gameId: id, quantity: 1 }] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToast({ type: "success", msg: "Checkout berhasil" });
      // optionally navigate to orders or cart
      navigate("/orders");
    } catch (err) {
      console.error(err);
      setToast({
        type: "error",
        msg: err.response?.data?.message || "Checkout gagal",
      });
    }
  };

  const submitReview = async () => {
    if (!token) return navigate("/login");
    if (userRole === "admin") {
      setToast({ type: "error", msg: "Admin tidak bisa beri review" });
      return;
    }
    if (comment.trim().length < 5) {
      setToast({ type: "error", msg: "Komentar minimal 5 karakter" });
      return;
    }

    setSubmitting(true);
    try {
      await api.post(
        `/api/games/${id}/reviews`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment("");
      setRating(5);
      setToast({ type: "success", msg: "Terima kasih, review terkirim" });
      // reload reviews & update average rating
      const { data: revs } = await api.get(`/api/games/${id}/reviews`);
      setReviews(revs);
      // refresh game (to update rating/sold etc)
      const { data: updatedGame } = await api.get(`/api/games/${id}`);
      setGame(updatedGame);
    } catch (err) {
      console.error(err);
      setToast({ type: "error", msg: "Gagal mengirim review" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!game) return <div className="p-8 text-center">Game tidak ditemukan</div>;

  async function checkReviewEligibility() {
    if (!token) return;

    try {
      const res = await api.get(`/api/orders/can-review/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCanReview(res.data.allowed);
    } catch {
      setCanReview(false);
    }
  }

  return (
    <div className="p-8 min-h-screen bg-darkBg text-white">
      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 px-4 py-2 rounded-lg text-white ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
            onClick={() => setToast(null)}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* LEFT: image */}
        <div className="col-span-1">
          <img
            src={game.image}
            alt={game.title}
            className="w-full h-[380px] object-cover rounded-lg border border-neonPurple"
            onError={(e) =>
              (e.target.src = "https://placehold.co/600x400?text=No+Image")
            }
          />
        </div>

        {/* MIDDLE: info */}
        <div className="col-span-2">
          <h1 className="text-3xl font-bold text-neonPink">{game.title}</h1>
          <p className="text-sm text-gray-300 mt-1">
            By:{" "}
            <span className="text-neonBlue">
              {game.createdBy?.username || "Unknown"}
            </span>
          </p>

          <div className="mt-4 flex items-center gap-6">
            <div>
              <p className="text-2xl text-neonGreen font-semibold">
                Rp {game.price?.toLocaleString("id-ID")}
              </p>
              <p className="text-sm text-gray-400">Stock: {game.stock}</p>
            </div>
            <div className="text-sm text-gray-300">
              <div>
                ⭐ {game.rating?.toFixed(1) || 0} • {game.sold || 0} sold
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            {userRole !== "admin" && (
              <>
                <button
                  onClick={handleAddToCart}
                  className="px-4 py-2 bg-neonPurple rounded-lg font-semibold"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="px-4 py-2 bg-neonBlue rounded-lg font-semibold"
                >
                  Buy Now
                </button>
              </>
            )}

            {userRole === "admin" && (
              <div className="px-4 py-2 bg-gray-600 rounded-lg">
                Admin Mode — pembelian disabled
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mt-6 bg-[#0f0f14] p-4 rounded-lg border border-neonPurple text-gray-200">
            <h3 className="font-bold mb-2">Deskripsi</h3>
            <p className="text-sm">
              {game.description || "Tidak ada deskripsi."}
            </p>
          </div>

          {/* Reviews */}
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-2">Ulasan</h3>

            {/* Add review form */}
            {canReview ? (
              <div className="bg-[#0f0f14] p-4 rounded-lg border border-neonPurple">
                <div className="flex items-center gap-3">
                  <label className="text-sm">Rating:</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="bg-[#141420] border p-2 rounded"
                  >
                    {[5, 4, 3, 2, 1].map((v) => (
                      <option key={v} value={v}>
                        {v} ⭐
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Tulis review kamu..."
                  className="w-full mt-3 p-3 bg-[#141420] rounded border"
                />

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={submitReview}
                    disabled={submitting}
                    className="px-4 py-2 bg-neonPink rounded"
                  >
                    {submitting ? "Mengirim..." : "Kirim Review"}
                  </button>
                  <button
                    onClick={() => {
                      setComment("");
                      setRating(5);
                    }}
                    className="px-4 py-2 bg-gray-600 rounded"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                Kamu hanya bisa memberi review setelah pesanan diterima ✔️
              </p>
            )}

            {/* Reviews list */}
            <div className="mt-4 space-y-3">
              {reviews.length === 0 ? (
                <p className="text-gray-400">Belum ada review.</p>
              ) : (
                reviews.map((r) => (
                  <div
                    key={r._id}
                    className="bg-[#0b0b10] p-3 rounded border border-neonPurple/30"
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-semibold">
                        {r.user?.username || "User"}
                      </div>
                      <div className="text-sm text-gray-300">⭐ {r.rating}</div>
                    </div>
                    <div className="text-sm text-gray-200 mt-1">
                      {r.comment}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related / recommended */}
      <div className="mt-10">
        <h3 className="text-xl font-bold text-neonPink mb-4">
          Rekomendasi untuk kamu
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {related.map((rg) => (
            <Link
              key={rg._id}
              to={`/game/${rg._id}`}
              className="block bg-[#111] p-3 rounded border border-neonPurple hover:scale-105 transition-transform"
            >
              <img
                src={rg.image}
                className="w-full h-32 object-cover rounded"
                alt={rg.title}
              />
              <div className="mt-2 font-semibold text-neonPink">{rg.title}</div>
              <div className="text-sm text-gray-300 mt-1">
                Rp {rg.price?.toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
