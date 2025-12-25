import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminGames from "./AdminGames";
import AdminOrders from "./AdminOrders";
import AdminHistory from "./AdminHistory";
import AdminBalance from "./AdminBalance";
import { getSalesSummary } from "../services/orderService";
import SalesChart from "../components/SalesChart";
import BalanceHistory from "../components/BalanceHistory";
import WithdrawForm from "../components/WithdrawForm";
import WithdrawHistory from "../components/WithdrawHistory";

export default function AdminDashboard() {
  const [tab, setTab] = useState("games");
  const navigate = useNavigate();

  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  const tabs = [
    { key: "games", label: "Kelola Game" },
    { key: "orders", label: "Order Masuk" },
    { key: "history", label: "Riwayat Order" },
    { key: "balance", label: "Saldo" },
  ];

  // 🔥 load grafik SAAT tab saldo dibuka
  useEffect(() => {
    if (tab === "balance") {
      loadChart();
    }
  }, [tab]);

  const loadChart = async () => {
    try {
      setChartLoading(true);
      const res = await getSalesSummary();

      const formatted = Object.entries(res.data).map(([date, total]) => ({
        date,
        total,
      }));

      setChartData(formatted);
    } catch (err) {
      console.error("Gagal load grafik:", err);
    } finally {
      setChartLoading(false);
    }
  };

  return (
    <div className="p-10 text-white min-h-screen bg-[#0b0b14] overflow-auto">
      <h1 className="text-3xl font-bold text-neonPink mb-6">
        🎮 Dashboard Admin
      </h1>

      {/* TAB BUTTON */}
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

      {/* TAB CONTENT */}
      {tab === "games" && (
        <div>
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-bold text-neonPink">Kelola Game</h2>

            <button
              onClick={() => navigate("/admin/games/add")}
              className="px-4 py-2 bg-neonPurple text-white rounded-lg font-bold hover:bg-purple-700"
            >
              + Tambah Game
            </button>
          </div>

          <AdminGames />
        </div>
      )}

      {tab === "orders" && <AdminOrders />}

      {tab === "history" && <AdminHistory />}

      {tab === "balance" && (
        <div className="space-y-8">
          {/* SALDO CARD */}
          <AdminBalance />

          {/* GRAFIK */}
          {chartLoading ? (
            <div className="h-64 bg-[#141420] animate-pulse rounded-xl" />
          ) : chartData.length === 0 ? (
            <p className="text-gray-400">Belum ada data penjualan.</p>
          ) : (
            <SalesChart data={chartData} />
          )}

          {/* RIWAYAT SALDO */}
          <BalanceHistory />
          <WithdrawForm onSuccess={loadChart} />
          <WithdrawHistory />
        </div>
      )}
    </div>
  );
}
