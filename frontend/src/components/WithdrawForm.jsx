import { useEffect, useState } from "react";
import { requestWithdraw } from "../services/userService";
import { motion } from "framer-motion";

const isNumeric = (v) => /^\d+$/.test(v);

const validateBankAccount = (value) => {
  if (!isNumeric(value)) return "Nomor rekening harus angka";
  if (value.length < 8 || value.length > 16)
    return "Nomor rekening harus 8–16 digit";
  return "";
};

const validateEwallet = (wallet, value) => {
  if (wallet === "PayPal") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "PayPal harus email valid";
    return "";
  }

  if (!isNumeric(value)) return "ID e-wallet harus angka";
  if (value.length < 9 || value.length > 15)
    return "ID e-wallet harus 9–15 digit";
  return "";
};

const MIN_WITHDRAW = 50000;
const FEE_FLAT = 2500;

const BANKS = [
  "BCA",
  "BRI",
  "BNI",
  "Mandiri",
  "CIMB Niaga",
  "Danamon",
  "Permata",
  "Maybank",
  "BTN",
  "BTPN",
  "OCBC NISP",
  "Panin Bank",
  "Bank Mega",
  "Bank Syariah Indonesia (BSI)",
];

const EWALLETS = ["GoPay", "OVO", "DANA", "ShopeePay", "LinkAja", "PayPal"];

export default function WithdrawForm({ onSuccess }) {
  const [method, setMethod] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const [fee, setFee] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // hitung fee & final
  useEffect(() => {
    const amt = Number(amount);
    if (!amt || amt < MIN_WITHDRAW) {
      setFee(0);
      setFinalAmount(0);
      return;
    }
    setFee(FEE_FLAT);
    setFinalAmount(Math.max(amt - FEE_FLAT, 0));
  }, [amount]);

  const submit = async () => {
    setError("");

    if (!method) return setError("Pilih metode withdraw");
    if (!bankName) return setError("Pilih bank / e-wallet");
    if (!accountNumber)
      return setError("Nomor rekening / ID wallet wajib diisi");
    if (!accountName) return setError("Nama pemilik wajib diisi");

    let formatError = "";

    if (method === "bank") {
      formatError = validateBankAccount(accountNumber);
    }

    if (method === "ewallet") {
      formatError = validateEwallet(bankName, accountNumber);
    }

    if (formatError) {
      setError(formatError);
      return;
    }

    const amt = Number(amount);
    if (!amt || amt < MIN_WITHDRAW)
      return setError(`Minimal withdraw Rp ${MIN_WITHDRAW.toLocaleString()}`);

    try {
      setLoading(true);

      await requestWithdraw({
        amount: amt,
        method,
        bankName,
        accountNumber,
        accountName,
        note,
      });

      // reset
      setMethod("");
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      setAmount("");
      setNote("");
      setFee(0);
      setFinalAmount(0);

      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengajukan withdraw");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#141420] border border-neonPurple/40 rounded-xl p-6 max-w-lg"
    >
      <h3 className="text-lg font-bold text-neonPink mb-4">
        🏧 Withdraw Saldo
      </h3>

      {error && <p className="text-red-400 mb-3">{error}</p>}

      {/* PILIH METODE */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => {
            setMethod("bank");
            setBankName("");
          }}
          className={`flex-1 py-2 rounded-lg font-semibold ${
            method === "bank"
              ? "bg-neonPurple text-white"
              : "bg-[#0b0b14] border border-neonPurple/40"
          }`}
        >
          🏦 Bank Transfer
        </button>

        <button
          onClick={() => {
            setMethod("ewallet");
            setBankName("");
          }}
          className={`flex-1 py-2 rounded-lg font-semibold ${
            method === "ewallet"
              ? "bg-neonPurple text-white"
              : "bg-[#0b0b14] border border-neonPurple/40"
          }`}
        >
          💳 E-Wallet
        </button>
      </div>

      {/* BANK */}
      {method === "bank" && (
        <select
          className="w-full bg-[#0b0b14] p-3 rounded mb-3"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
        >
          <option value="">Pilih Bank</option>
          {BANKS.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </select>
      )}

      {/* EWALLET */}
      {method === "ewallet" && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          {EWALLETS.map((wallet) => (
            <button
              key={wallet}
              onClick={() => setBankName(wallet)}
              className={`py-2 rounded-lg font-semibold ${
                bankName === wallet
                  ? "bg-neonPurple text-white"
                  : "bg-[#0b0b14] border border-neonPurple/40"
              }`}
            >
              {wallet}
            </button>
          ))}
        </div>
      )}

      {/* ACCOUNT NUMBER */}
      <input
        type="text"
        placeholder={
          method === "bank"
            ? "Nomor Rekening (8–16 digit)"
            : bankName === "PayPal"
            ? "Email PayPal"
            : "ID E-Wallet (9–15 digit)"
        }
        className="w-full bg-[#0b0b14] p-3 rounded mb-3"
        value={accountNumber}
        onChange={(e) =>
          setAccountNumber(e.target.value.replace(/[^0-9a-zA-Z@._]/g, ""))
        }
      />

      <input
        type="text"
        placeholder="Nama Pemilik"
        className="w-full bg-[#0b0b14] p-3 rounded mb-3"
        value={accountName}
        onChange={(e) => setAccountName(e.target.value)}
      />

      {/* AMOUNT */}
      <input
        type="number"
        placeholder={`Jumlah Withdraw (min Rp ${MIN_WITHDRAW.toLocaleString()})`}
        className="w-full bg-[#0b0b14] p-3 rounded mb-3"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      {/* PREVIEW */}
      {finalAmount > 0 && (
        <div className="bg-[#0b0b14] p-3 rounded mb-3 text-sm">
          <p>Jumlah: Rp {Number(amount).toLocaleString()}</p>
          <p>Fee: Rp {fee.toLocaleString()}</p>
          <p className="font-semibold text-neonGreen">
            Diterima: Rp {finalAmount.toLocaleString()}
          </p>
        </div>
      )}

      <textarea
        placeholder="Catatan (opsional)"
        className="w-full bg-[#0b0b14] p-3 rounded mb-4"
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <button
        disabled={loading}
        onClick={submit}
        className="w-full bg-neonPurple py-2 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? "Memproses..." : "Ajukan Withdraw"}
      </button>
    </motion.div>
  );
}
