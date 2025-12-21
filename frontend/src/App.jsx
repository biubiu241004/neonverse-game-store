import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Store from "./pages/Store";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import UserOrders from "./pages/UserOrders";
import AddGame from "./pages/AddGame";
import GameDetail from "./pages/GameDetail";
import EditGame from "./pages/EditGame";
import AdminBalance from "./pages/AdminBalance";

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen pt-24 bg-white dark:bg-[#0a0a10] text-black dark:text-white transition-colors duration-300">

      <Navbar />

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/store" element={<Store />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/game/:id" element={<GameDetail />} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/games/add" element={<AddGame />} />
            <Route path="/admin/games/edit/:id" element={<EditGame />} />
            <Route path="/admin/balance" element={<AdminBalance />} />
            
            {/* User Orders */}
            <Route path="/orders" element={<UserOrders />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
