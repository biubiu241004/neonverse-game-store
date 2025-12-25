import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

/* ===================== DATA ===================== */
const BANKS = ["BCA", "BRI", "BNI", "Mandiri", "CIMB", "BSI"];
const EWALLETS = ["GoPay", "OVO", "DANA", "ShopeePay"];

const BANK_RULES = {
  BCA: { min: 10, max: 10 },
  BRI: { min: 15, max: 15 },
  BNI: { min: 10, max: 10 },
  Mandiri: { min: 13, max: 13 },
  CIMB: { min: 13, max: 14 },
  BSI: { min: 10, max: 16 },
};

/* ===================== COMPONENT ===================== */
export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const items = state?.items || [];

  const [paymentMethod, setPaymentMethod] = useState("balance");
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const [provider, setProvider] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountError, setAccountError] = useState("");

  const total = items.reduce(
    (sum, i) => sum + i.game.price * i.quantity,
    0
  );

  /* ===================== LOAD BALANCE ===================== */
  useEffect(() => {
    api.get("/api/users/me/balance").then((res) => {
      setBalance(res.data.balance);
    });
  }, []);

  /* ===================== GUARD ===================== */
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b14] text-white">
        <button
          onClick={() => navigate("/cart")}
          className="bg-neonPurple px-6 py-3 rounded-lg font-bold"
        >
          Kembali ke Cart
        </button>
      </div>
    );
  }

  /* ===================== VALIDATION ===================== */
  const validateAccount = (val) => {
    if (!/^[0-9]+$/.test(val)) return "Hanya boleh angka";

    if (paymentMethod === "bank") {
      const rule = BANK_RULES[provider];
      if (!rule) return "Pilih bank terlebih dahulu";
      if (val.length < rule.min) return `Minimal ${rule.min} digit`;
      if (val.length > rule.max) return `Maksimal ${rule.max} digit`;
    }

    if (paymentMethod === "ewallet") {
      if (!val.startsWith("08") && !val.startsWith("62"))
        return "Harus diawali 08 atau 62";
      if (val.length < 10) return "Minimal 10 digit";
      if (val.length > 13) return "Maksimal 13 digit";
    }

    return "";
  };

  /* ===================== PAY ===================== */
  const pay = async () => {
    if (paymentMethod === "balance" && balance < total) {
      alert("Saldo tidak cukup");
      return;
    }

    if (paymentMethod !== "balance") {
      if (!provider || !accountNumber || accountError) {
        alert("Data pembayaran belum valid");
        return;
      }
    }

    setLoading(true);

    try {
      await api.post("/api/orders/checkout", {
        items: items.map((i) => ({
          gameId: i.game._id,
          quantity: i.quantity,
        })),
        payment: {
          method: paymentMethod,
          provider,
          accountNumber,
        },
      });

      alert("Pesanan berhasil dibuat");
      navigate("/orders");
    } catch (err) {
      alert(err.response?.data?.message || "Checkout gagal");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== UI ===================== */
  return (
    <div className="min-h-screen bg-[#0b0b14] text-white p-10">
      <h1 className="text-3xl font-bold text-neonPink mb-6">
        🧾 Checkout
      </h1>

      {/* RINGKASAN */}
      <div className="bg-[#141420] p-6 rounded-xl border border-neonPurple max-w-xl mb-6">
        {items.map((item) => (
          <div
            key={item.game._id}
            className="flex justify-between mb-2"
          >
            <span>
              {item.game.title} × {item.quantity}
            </span>
            <span>
              Rp {(item.game.price * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}

        <hr className="my-4 border-gray-600" />

        <div className="flex justify-between font-bold text-neonGreen">
          <span>Total</span>
          <span>Rp {total.toLocaleString()}</span>
        </div>
      </div>

      {/* METODE */}
      <div className="bg-[#141420] p-6 rounded-xl border border-neonPurple max-w-xl">
        <h2 className="font-bold mb-4">Metode Pembayaran</h2>

        {[
          { key: "balance", label: "💰 Saldo" },
          { key: "bank", label: "🏦 Transfer Bank" },
          { key: "ewallet", label: "📱 E-Wallet" },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => {
              setPaymentMethod(m.key);
              setProvider("");
              setAccountNumber("");
              setAccountError("");
            }}
            className={`w-full mb-2 py-3 rounded-lg font-bold ${
              paymentMethod === m.key
                ? "bg-neonPurple"
                : "border border-neonPurple/40"
            }`}
          >
            {m.label}
          </button>
        ))}

        {/* SALDO */}
        {paymentMethod === "balance" && (
          <p className="text-sm text-neonGreen mt-2">
            Saldo kamu: Rp {balance.toLocaleString()}
          </p>
        )}

        {/* BANK */}
        {paymentMethod === "bank" && (
          <>
            <select
              className="w-full p-3 bg-[#0b0b14] rounded mb-3"
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value);
                setAccountNumber("");
                setAccountError("");
              }}
            >
              <option value="">Pilih Bank</option>
              {BANKS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <input
              placeholder="Nomor Rekening"
              value={accountNumber}
              onChange={(e) => {
                if (!/^[0-9]*$/.test(e.target.value)) return;
                setAccountNumber(e.target.value);
                setAccountError(
                  validateAccount(e.target.value)
                );
              }}
              className={`w-full p-3 rounded border ${
                accountError
                  ? "border-red-500"
                  : "border-gray-600"
              }`}
            />

            {accountError && (
              <p className="text-red-400 text-xs mt-1">
                {accountError}
              </p>
            )}
          </>
        )}

        {/* EWALLET */}
        {paymentMethod === "ewallet" && (
          <>
            <div className="flex gap-2 mb-3 flex-wrap">
              {EWALLETS.map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    setProvider(e);
                    setAccountNumber("");
                    setAccountError("");
                  }}
                  className={`px-4 py-2 rounded border ${
                    provider === e
                      ? "bg-neonPurple border-neonPurple"
                      : "border-gray-600"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>

            <input
              placeholder="Nomor HP E-Wallet"
              value={accountNumber}
              onChange={(e) => {
                if (!/^[0-9]*$/.test(e.target.value)) return;
                setAccountNumber(e.target.value);
                setAccountError(
                  validateAccount(e.target.value)
                );
              }}
              className={`w-full p-3 rounded border ${
                accountError
                  ? "border-red-500"
                  : "border-gray-600"
              }`}
            />

            {accountError && (
              <p className="text-red-400 text-xs mt-1">
                {accountError}
              </p>
            )}
          </>
        )}

        <button
          disabled={loading}
          onClick={pay}
          className="mt-6 w-full bg-neonPink py-3 rounded-lg font-bold disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Bayar Sekarang"}
        </button>
      </div>
    </div>
  );
}
