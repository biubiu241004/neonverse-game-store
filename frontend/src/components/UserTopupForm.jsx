import { useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";

/* ===================== DATA ===================== */

const BANKS = ["BCA", "BRI", "BNI", "Mandiri", "CIMB Niaga", "BSI"];

const BANK_RULES = {
  BCA: { min: 10, max: 10 },
  BRI: { min: 15, max: 15 },
  BNI: { min: 10, max: 10 },
  Mandiri: { min: 13, max: 13 },
  "CIMB Niaga": { min: 13, max: 14 },
  BSI: { min: 10, max: 16 },
};

const EWALLETS = ["GoPay", "OVO", "DANA", "ShopeePay", "LinkAja"];

/* ===================== HELPERS ===================== */

const isNumberOnly = (v) => /^[0-9]+$/.test(v);

const validateAccountNumber = (value, method, provider) => {
  if (!value) return "Nomor wajib diisi";

  if (!/^[0-9]+$/.test(value)) {
    return "Hanya boleh angka";
  }

  if (method === "bank") {
    const rule = BANK_RULES[provider] || { min: 10, max: 16 };

    if (value.length < rule.min) {
      return `Minimal ${rule.min} digit`;
    }

    if (value.length > rule.max) {
      return `Maksimal ${rule.max} digit`;
    }
  }

  if (method === "ewallet") {
    if (!value.startsWith("08") && !value.startsWith("62")) {
      return "Harus diawali 08 atau 62";
    }

    if (value.length < 10) {
      return "Minimal 10 digit";
    }

    if (value.length > 13) {
      return "Maksimal 13 digit";
    }
  }

  return ""; // VALID
};

/* ===================== COMPONENT ===================== */

export default function UserTopupForm({ onSuccess }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [provider, setProvider] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [accountError, setAccountError] = useState("");
  const [isAccountValid, setIsAccountValid] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ===================== SUBMIT ===================== */

  const submit = async () => {
    setError("");
    const amt = Number(amount);

    /* ==== AMOUNT ==== */
    if (!amt || amt < 10000) {
      return setError("Minimal top up Rp 10.000");
    }

    /* ==== METHOD ==== */
    if (!method) {
      return setError("Pilih metode pembayaran");
    }

    if (!provider) {
      return setError("Pilih bank / e-wallet");
    }

    if (!accountNumber || !isNumberOnly(accountNumber)) {
      return setError("Nomor hanya boleh angka");
    }

    /* ==== BANK VALIDATION ==== */
    if (method === "bank") {
      const rule = BANK_RULES[provider] || { min: 10, max: 16 };

      if (accountNumber.length < rule.min || accountNumber.length > rule.max) {
        return setError(
          `Nomor rekening ${provider} harus ${rule.min}–${rule.max} digit`
        );
      }
    }

    /* ==== EWALLET VALIDATION ==== */
    if (method === "ewallet") {
      if (
        accountNumber.length < 10 ||
        accountNumber.length > 13 ||
        (!accountNumber.startsWith("08") && !accountNumber.startsWith("62"))
      ) {
        return setError(
          "Nomor e-wallet harus nomor HP valid (08 / 62, 10–13 digit)"
        );
      }
    }

    /* ==== SEND ==== */
    try {
      setLoading(true);

      await api.post("/api/users/me/topup", {
        amount: amt,
        method,
        provider,
        accountNumber,
      });

      setAmount("");
      setMethod("");
      setProvider("");
      setAccountNumber("");

      onSuccess?.();
      alert("Top up berhasil diajukan, tunggu konfirmasi admin");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal top up");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== UI ===================== */

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#141420] border border-neonPurple/40 rounded-xl p-6"
    >
      <h3 className="text-lg font-bold text-neonPurple mb-4">
        ➕ Top Up Saldo
      </h3>

      {error && <p className="text-red-400 mb-3">{error}</p>}

      {/* AMOUNT */}
      <input
        type="number"
        placeholder="Jumlah Top Up (min Rp 10.000)"
        className="w-full bg-[#0b0b14] p-3 rounded mb-3"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      {/* METHOD */}
      <select
        className="w-full bg-[#0b0b14] p-3 rounded mb-3"
        value={method}
        onChange={(e) => {
          setMethod(e.target.value);
          setProvider("");
          setAccountNumber("");
        }}
      >
        <option value="">Pilih Metode</option>
        <option value="bank">Transfer Bank</option>
        <option value="ewallet">E-Wallet</option>
      </select>

      {/* BANK */}
      {method === "bank" && (
        <>
          <select
            className="w-full bg-[#0b0b14] p-3 rounded mb-3"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            <option value="">Pilih Bank</option>
            {BANKS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Nomor Rekening"
            className={`w-full p-3 rounded mb-1 bg-[#0b0b14] border ${
              accountError
                ? "border-red-500"
                : isAccountValid
                ? "border-green-500"
                : "border-gray-600"
            }`}
            value={accountNumber}
            onChange={(e) => {
              if (!/^[0-9]*$/.test(e.target.value)) return;

              const val = e.target.value;
              setAccountNumber(val);

              const err = validateAccountNumber(val, method, provider);
              setAccountError(err);
              setIsAccountValid(!err);
            }}
          />
          {accountError && (
            <p className="text-red-400 text-xs mb-2">{accountError}</p>
          )}
        </>
      )}

      {/* EWALLET */}
      {method === "ewallet" && (
        <>
          <div className="flex gap-2 mb-3 flex-wrap">
            {EWALLETS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  setProvider(e);
                  setAccountNumber("");
                  setAccountError("");
                  setIsAccountValid(false);
                }}
                className={`px-4 py-2 rounded-lg border ${
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
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Nomor HP / ID E-Wallet"
            className={`w-full p-3 rounded mb-1 bg-[#0b0b14] border ${
              accountError
                ? "border-red-500"
                : isAccountValid
                ? "border-green-500"
                : "border-gray-600"
            }`}
            value={accountNumber}
            onChange={(e) => {
              if (!/^[0-9]*$/.test(e.target.value)) return;

              const val = e.target.value;
              setAccountNumber(val);

              const err = validateAccountNumber(val, "ewallet", provider);
              setAccountError(err);
              setIsAccountValid(!err);
            }}
          />
          <p className="text-xs text-gray-400 mb-2">
            {accountNumber.length} / 13 digit
          </p>

          {accountError && (
            <p className="text-red-400 text-xs mb-2">{accountError}</p>
          )}
        </>
      )}

      <button
        disabled={loading || !isAccountValid}
        onClick={submit}
        className={`w-full py-2 rounded-lg font-bold ${
          loading || !isAccountValid
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-neonPurple hover:bg-purple-700"
        }`}
      >
        {loading ? "Memproses..." : "Ajukan Top Up"}
      </button>
    </motion.div>
  );
}
