import { motion } from "framer-motion";

export default function UserCancelModal({
  show,
  onClose,
  onSubmit,
  userReasons,
  setUserReason,
}) {
  if (!show) return null;

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
        className="bg-[#141420] w-[90%] md:w-[400px] p-6 rounded-xl border border-yellow-400 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-yellow-300 mb-3">
          Ajukan Pembatalan Pesanan
        </h2>

        <label className="text-sm font-semibold">Pilih Alasan:</label>
        <select
          className="w-full bg-[#1e1e2d] border border-yellow-400 p-2 rounded-lg text-white mt-1"
          onChange={(e) => setUserReason(e.target.value)}
        >
          <option value="">-- Pilih Alasan --</option>
          {userReasons.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </select>

        <p className="mt-3 text-sm">Atau alasan tambahan:</p>
        <textarea
          className="w-full bg-[#1e1e2d] border border-yellow-400 p-3 rounded-lg text-white mt-1"
          rows={3}
          placeholder="Tulis alasan lainnya..."
          onChange={(e) => setUserReason(e.target.value)}
        />

        <button
          onClick={onSubmit}
          className="mt-4 w-full bg-yellow-500 py-2 rounded-lg hover:bg-yellow-600"
        >
          Kirim Permintaan Pembatalan
        </button>

        <button
          onClick={onClose}
          className="mt-3 w-full bg-gray-500 py-2 rounded-lg hover:bg-gray-600"
        >
          Batal
        </button>
      </motion.div>
    </motion.div>
  );
}
