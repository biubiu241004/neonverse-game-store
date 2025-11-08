import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, LogIn, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        boxShadow: [
          "0 0 0px rgba(139, 92, 246, 0.4)",
          "0 0 15px rgba(139, 92, 246, 0.8)",
          "0 0 0px rgba(139, 92, 246, 0.4)",
        ],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        repeatType: "mirror",
      }}
      className="flex justify-between items-center px-10 py-4 bg-[#0a0a10]/90 backdrop-blur-md border-b border-neonPurple shadow-[0_0_15px_rgba(139,92,246,0.6)]"
    >
      {/* Kiri */}
      <Link to="/" className="flex items-center gap-2">
        <Gamepad2 className="text-neonPurple w-8 h-8" />
        <h1 className="text-2xl font-bold text-white tracking-wider drop-shadow-[0_0_10px_#8B5CF6]">
          NeonVerse
        </h1>
      </Link>

      {/* Kanan */}
      <div className="flex gap-8 text-lg font-orbitron">
        <Link
          to="/"
          className={`transition-colors duration-200 ${
            location.pathname === "/" ? "text-neonGreen" : "text-white hover:text-neonGreen"
          }`}
        >
          Home
        </Link>
        <Link
          to="/store"
          className={`transition-colors duration-200 ${
            location.pathname === "/store" ? "text-neonPink" : "text-white hover:text-neonPink"
          }`}
        >
          Store
        </Link>
        <Link
          to="/cart"
          className={`flex items-center gap-1 transition-colors duration-200 ${
            location.pathname === "/cart" ? "text-neonBlue" : "text-white hover:text-neonBlue"
          }`}
        >
          <ShoppingCart size={18} /> Cart
        </Link>
        <Link
          to="/login"
          className={`flex items-center gap-1 transition-colors duration-200 ${
            location.pathname === "/login" ? "text-yellow-400" : "text-white hover:text-yellow-400"
          }`}
        >
          <LogIn size={18} /> Login
        </Link>
      </div>
    </motion.nav>
  );
}
