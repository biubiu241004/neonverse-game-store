import { useEffect, useState } from "react";
import { getMyBalance } from "../services/userService";
import { motion } from "framer-motion";

export default function AdminBalance() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyBalance();
        setBalance(res.data.balance);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0b14] text-white p-8 pt-24">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-neonPurple mb-8"
      >
        💰 Saldo Saya
      </motion.h1>

      {loading ? (
        <div className="animate-pulse bg-[#141420] h-32 rounded-xl" />
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#141420] border border-neonPurple/40 rounded-2xl p-8 shadow-lg max-w-md"
        >
          <p className="text-gray-400 text-sm mb-2">Total Saldo</p>
          <p className="text-4xl font-bold text-neonGreen">
            Rp {balance.toLocaleString()}
          </p>

          <p className="text-xs text-gray-500 mt-4">
            Saldo bertambah setelah pesanan diselesaikan oleh pembeli.
          </p>
        </motion.div>
      )}
    </div>
  );
}
