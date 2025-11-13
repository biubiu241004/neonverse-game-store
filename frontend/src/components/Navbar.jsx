import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  LogIn,
  LogOut,
  Gamepad2,
  UserPlus,
  LayoutDashboard,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { Sun, Moon } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.username || decoded.name || "User");
        setRole(decoded.role || "user"); // 🧩 tambahkan baris ini
        setIsLoggedIn(true);
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
      setUsername("");
      setRole("");
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUsername("");
    setRole("");
    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-between items-center px-10 py-4 bg-[#0a0a10]/95 backdrop-blur-md border-b border-neonPurple shadow-[0_0_15px_rgba(139,92,246,0.6)] fixed top-0 left-0 w-full z-50"
    >
      {/* Logo kiri */}
      <Link to="/" className="flex items-center gap-2">
        <Gamepad2 className="text-neonPurple w-8 h-8" />
        <h1 className="text-2xl font-bold text-white tracking-wider drop-shadow-[0_0_10px_#8B5CF6]">
          ValdoVerse
        </h1>
      </Link>

      {/* Menu kanan */}
      <div className="flex gap-8 text-lg font-orbitron items-center">
        {["/", "/store", "/cart"].map((path, i) => {
          const labels = ["Home", "Store", "Cart"];
          const icons = [null, null, <ShoppingCart size={18} key={i} />];
          const colors = ["neonGreen", "neonPink", "neonBlue"];
          return (
            <motion.div
              key={path}
              whileHover={{
                scale: 1.1,
                textShadow: `0 0 8px var(--${colors[i]})`,
              }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Link
                to={path}
                className={`flex items-center gap-1 transition-all duration-300 ${
                  location.pathname === path
                    ? `text-${colors[i]}`
                    : "text-white hover:text-neonGreen"
                }`}
              >
                {icons[i]} {labels[i]}
              </Link>
            </motion.div>
          );
        })}

        {/* 🧩 Tambahkan ini: tombol Dashboard muncul hanya untuk admin */}
        {isLoggedIn && role === "admin" && (
          <motion.div
            whileHover={{
              scale: 1.1,
              textShadow: "0 0 12px #FFA500",
            }}
          >
            <Link
              to="/admin/dashboard"
              className={`flex items-center gap-1 transition-colors duration-200 ${
                location.pathname === "/admin/dashboard"
                  ? "text-orange-400"
                  : "text-white hover:text-orange-400"
              }`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </Link>
          </motion.div>
        )}
        {/* 🧩 Selesai bagian dashboard */}

        {!isLoggedIn ? (
          <>
            <motion.div
              whileHover={{
                scale: 1.1,
                textShadow: "0 0 12px #FFD700",
              }}
            >
              <Link
                to="/login"
                className={`flex items-center gap-1 transition-colors duration-200 ${
                  location.pathname === "/login"
                    ? "text-yellow-400"
                    : "text-white hover:text-yellow-400"
                }`}
              >
                <LogIn size={18} /> Login
              </Link>
            </motion.div>

            <motion.div
              whileHover={{
                scale: 1.1,
                textShadow: "0 0 12px #A855F7",
              }}
            >
              <Link
                to="/register"
                className={`flex items-center gap-1 transition-colors duration-200 ${
                  location.pathname === "/register"
                    ? "text-purple-400"
                    : "text-white hover:text-purple-400"
                }`}
              >
                <UserPlus size={18} /> Register
              </Link>
            </motion.div>
          </>
        ) : (
          <>
            <span className="text-neonGreen font-semibold">
              👋 Halo, {username}
            </span>

            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 15px rgba(255,0,0,0.8)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-1 text-white hover:text-red-400 transition-colors duration-200 px-3 py-1 rounded-lg"
            >
              <LogOut size={18} /> Logout
            </motion.button>
          </>
        )}

        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="text-white mx-3"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>
      </div>
    </motion.nav>
  );
}
