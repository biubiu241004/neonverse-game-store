import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Store from "./pages/Store";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddGame from "./pages/AddGame";
import Cart from "./pages/Cart";
// import NeonBackground from "./components/NeonBackground";

export default function App() {
  const location = useLocation();

  return (
    <div className="bg-darkBg min-h-screen text-white font-orbitron overflow-hidden relative pt-20">
      {/* <NeonBackground /> */}
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
            <Route path="/add-game" element={<AddGame />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
