import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminGames from "./AdminGames";
import AdminOrders from "./AdminOrders";
import AdminHistory from "./AdminHistory";

export default function AdminDashboard() {
  const [tab, setTab] = useState("games");
  const navigate = useNavigate();

  const tabs = [
    { key: "games", label: "Kelola Game" },
    { key: "orders", label: "Order Masuk" },
    { key: "history", label: "Riwayat Order" },
  ];

  return (
    <div className="p-10 text-white min-h-screen bg-[#0b0b14]">

      <h1 className="text-3xl font-bold text-neonPink mb-6">
        🎮 Dashboard Admin
      </h1>

      {/* ============================ */}
      {/* TAB BUTTONS                 */}
      {/* ============================ */}
      <div className="flex gap-3 mb-10">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-6 py-2 rounded-lg border transition ${
              tab === t.key
                ? "bg-neonPurple text-white border-neonPurple"
                : "bg-[#141420] border-gray-600 hover:bg-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ============================ */}
      {/* TAB: KELOLA GAME             */}
      {/* ============================ */}
      {tab === "games" && (
        <div>
          {/* tombol tambah game */}
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-bold text-neonPink">Kelola Game</h2>

            <button
              onClick={() => navigate("/admin/games/add")}
              className="px-4 py-2 bg-neonPurple text-white rounded-lg font-bold hover:bg-purple-700"
            >
              + Tambah Game
            </button>
          </div>

          {/* component daftar game */}
          <AdminGames />
        </div>
      )}

      {/* ============================ */}
      {/* TAB: ORDER MASUK            */}
      {/* ============================ */}
      {tab === "orders" && <AdminOrders />}

      {/* ============================ */}
      {/* TAB: RIWAYAT ORDER          */}
      {/* ============================ */}
      {tab === "history" && <AdminHistory />}

    </div>
  );
}
