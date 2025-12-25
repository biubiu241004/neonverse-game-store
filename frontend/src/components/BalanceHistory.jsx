import { useEffect, useState } from "react";
import { getBalanceHistory } from "../services/userService";
import { motion } from "framer-motion";

export default function BalanceHistory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await getBalanceHistory();
      setData(res.data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="h-40 bg-[#141420] animate-pulse rounded-xl" />;
  }

  if (data.length === 0) {
    return <p className="text-gray-400">Belum ada riwayat saldo.</p>;
  }

  return (
    <div className="bg-[#141420] border border-neonPurple/40 rounded-xl p-6">
      <h3 className="text-lg font-bold text-neonPink mb-4">
        📜 Riwayat Saldo
      </h3>

      <div className="space-y-3">
        {data.map((h) => (
          <motion.div
            key={h._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center bg-[#0b0b14] p-4 rounded-lg"
          >
            <div>
              <p className="font-semibold">{h.game.title}</p>
              <p className="text-xs text-gray-400">
                Order #{h.order._id}
              </p>
            </div>

            <div className="text-right">
              <p className="text-neonGreen font-bold">
                +Rp {h.amount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(h.createdAt).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
