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

    if (!token) {
      setIsLoggedIn(false);
      setUsername("");
      setRole("");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUsername(decoded.username || decoded.name || "User");
      setRole(decoded.role || "user");
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Invalid token:", err);

      localStorage.removeItem("token");
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
        <motion.div whileHover={{ scale: 1.1 }}>
          <Link
            to="/"
            className={`${
              location.pathname === "/"
                ? "text-neonGreen"
                : "text-white hover:text-neonGreen"
            }`}
          >
            Home
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1 }}>
          <Link
            to="/store"
            className={`${
              location.pathname === "/store"
                ? "text-neonPink"
                : "text-white hover:text-neonPink"
            }`}
          >
            Store
          </Link>
        </motion.div>

        {isLoggedIn && role === "user" && (
          <>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link
                to="/cart"
                className={`flex items-center gap-1 ${
                  location.pathname === "/cart"
                    ? "text-neonBlue"
                    : "text-white hover:text-neonBlue"
                }`}
              >
                <ShoppingCart size={18} /> Cart
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }}>
              <Link
                to="/orders"
                className={`${
                  location.pathname === "/orders"
                    ? "text-yellow-300"
                    : "text-white hover:text-yellow-300"
                }`}
              >
                Orders
              </Link>
            </motion.div>
          </>
        )}

        {isLoggedIn && role === "admin" && (
          <>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link
                to="/admin/dashboard"
                className={`flex items-center gap-1 ${
                  location.pathname.startsWith("/admin/dashboard")
                    ? "text-orange-400"
                    : "text-white hover:text-orange-400"
                }`}
              >
                <LayoutDashboard size={18} /> Dashboard
              </Link>
            </motion.div>
          </>
        )}

        {!isLoggedIn && (
          <>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link
                to="/login"
                className={`flex items-center gap-1 ${
                  location.pathname === "/login"
                    ? "text-yellow-400"
                    : "text-white hover:text-yellow-400"
                }`}
              >
                <LogIn size={18} /> Login
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }}>
              <Link
                to="/register"
                className={`flex items-center gap-1 ${
                  location.pathname === "/register"
                    ? "text-purple-400"
                    : "text-white hover:text-purple-400"
                }`}
              >
                <UserPlus size={18} /> Register
              </Link>
            </motion.div>
          </>
        )}

        {isLoggedIn && (
          <>
            <span className="text-neonGreen font-semibold">👋 {username}</span>

            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={handleLogout}
              className="flex items-center gap-1 text-white hover:text-red-400"
            >
              <LogOut size={18} /> Logout
            </motion.button>
          </>
        )}
      </div>
    </motion.nav>
  );
}
