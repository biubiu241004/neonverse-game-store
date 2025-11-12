import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-darkBg text-white text-center px-6">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-5xl md:text-6xl font-bold text-neonPink drop-shadow-[0_0_20px_#ff00ff]"
      >
        Selamat Datang di{" "}
        <span className="text-neonBlue">ValdoVerse Game Store</span> 🎮
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-neonPurple to-neonBlue blur-3xl opacity-20 -z-10"
      >
        Dunia game penuh warna milik Valdo! ⚡  
        Temukan game seru, kumpulkan koleksi terbaikmu, dan rasakan pengalaman
        bermain dalam nuansa neon yang futuristik.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-10 flex gap-6"
      >
        <Link
          to="/store"
          className="bg-gradient-to-r from-neonPink to-neonPurple text-darkBg px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,0,255,0.5)]"
        >
          Lihat Koleksi Game
        </Link>
        <Link
          to="/login"
          className="border border-neonBlue text-neonBlue px-6 py-3 rounded-xl font-bold hover:bg-neonBlue hover:text-darkBg transition-all shadow-[0_0_10px_rgba(0,255,255,0.5)]"
        >
          Masuk
        </Link>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="mt-16 text-sm text-gray-500"
      >
        💡 “Mainkan imajinasi, jadilah legenda — hanya di <span className='text-neonGreen font-semibold'>ValdoVerse</span>!”
      </motion.p>
    </div>
  );
}
