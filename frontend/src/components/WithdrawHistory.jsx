import { useEffect, useState } from "react";
import { getMyWithdraws } from "../services/userService";
import { motion, AnimatePresence } from "framer-motion";

const statusStyle = {
  pending: "bg-yellow-500/30 text-yellow-300",
  processing: "bg-blue-500/30 text-blue-300",
  paid: "bg-green-500/30 text-green-300",
  rejected: "bg-red-500/30 text-red-300",
};

// helper aman
const money = (v) => Number(v || 0).toLocaleString();

export default function WithdrawHistory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    try {
      const res = await getMyWithdraws();
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <div className="h-40 bg-[#141420] animate-pulse rounded-xl" />;
  }

  if (data.length === 0) {
    return <p className="text-gray-400">Belum ada riwayat withdraw.</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-neonPink">📜 Riwayat Withdraw</h3>

      {data.map((w) => (
        <motion.div
          key={w._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#141420] border border-neonPurple/40 rounded-xl p-5"
        >
          <div className="flex justify-between items-center">
            <p className="font-semibold">Rp {money(w.amount)}</p>

            <span
              className={`px-3 py-1 rounded-full text-xs ${
                statusStyle[w.status] || "bg-gray-500/30 text-gray-300"
              }`}
            >
              {w.status || "unknown"}
            </span>
          </div>

          <p className="text-sm text-gray-400 mt-1">
            Fee: Rp {money(w.fee)} • Diterima:{" "}
            <span className="text-neonGreen">Rp {money(w.finalAmount)}</span>
          </p>

          <button
            onClick={() => setSelected(w)}
            className="mt-3 text-sm text-neonBlue hover:underline"
          >
            Lihat Detail
          </button>
        </motion.div>
      ))}

      {/* MODAL DETAIL */}
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
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141420] w-[90%] md:w-[420px] p-6 rounded-xl border border-neonPurple"
            >
              <h4 className="text-lg font-bold text-neonPink mb-3">
                Detail Withdraw
              </h4>

              <p>
                <b>Metode:</b> {selected.method || "-"}
              </p>
              <p>
                <b>Bank / Wallet:</b> {selected.bankName || "-"}
              </p>
              <p>
                <b>No:</b> {selected.accountNumber || "-"}
              </p>
              <p>
                <b>Nama:</b> {selected.accountName || "-"}
              </p>

              <p className="mt-2">
                <b>Jumlah:</b> Rp {money(selected.amount)}
              </p>
              <p>
                <b>Fee:</b> Rp {money(selected.fee)}
              </p>
              <p className="font-semibold text-neonGreen">
                <b>Diterima:</b> Rp {money(selected.finalAmount)}
              </p>

              <p className="text-xs text-gray-500 mt-2">
                Status: {selected.status || "-"}
              </p>

              <button
                onClick={() => setSelected(null)}
                className="mt-4 w-full bg-neonBlue py-2 rounded-lg"
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
