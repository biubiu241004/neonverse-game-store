import { useEffect, useState } from "react";
import {
  getAllWithdraws,
  updateWithdrawStatus,
} from "../services/userService";
import { motion, AnimatePresence } from "framer-motion";

export default function SuperAdminWithdraw() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const load = async () => {
    try {
      const res = await getAllWithdraws();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const action = async (id, status) => {
    try {
      await updateWithdrawStatus(id, status);
      setToast({
        type: "success",
        msg: `Withdraw ${status}`,
      });
      load();
    } catch (err) {
      setToast({
        type: "error",
        msg: err.response?.data?.message || "Gagal memproses withdraw",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b14] text-white p-8 pt-24">
      <h1 className="text-3xl font-bold text-neonPink mb-6">
        🏧 Withdraw Requests (Super Admin)
      </h1>

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 px-4 py-2 rounded-lg ${
              toast.type === "success"
                ? "bg-green-600"
                : "bg-red-600"
            }`}
          >
            {toast.msg}
            <button onClick={() => setToast(null)} className="ml-3">
              ✖
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="animate-pulse bg-[#141420] h-40 rounded-xl" />
      ) : data.length === 0 ? (
        <p className="text-gray-400">Tidak ada request withdraw.</p>
      ) : (
        <div className="space-y-4">
          {data.map((w) => (
            <motion.div
              key={w._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#141420] border border-neonPurple/40 rounded-xl p-5 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-neonPurple">
                  {w.admin.username}
                </p>
                <p className="text-sm text-gray-400">
                  {w.admin.email}
                </p>
                <p className="text-sm mt-1">
                  {w.method} • Rp {w.amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  Status: {w.status}
                </p>
              </div>

              {w.status === "pending" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => action(w._id, "approved")}
                    className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => action(w._id, "rejected")}
                    className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    w.status === "approved"
                      ? "bg-green-600/30 text-green-300"
                      : "bg-red-600/30 text-red-300"
                  }`}
                >
                  {w.status}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
