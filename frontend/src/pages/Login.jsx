import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      setMessage("Login successful! Redirecting...");
      setTimeout(() => navigate("/store"), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-darkBg text-white">
      <h1 className="text-4xl text-neonGreen mb-6">Login</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-[#111] p-6 rounded-2xl w-[90%] max-w-md shadow-neon"
      >
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded bg-darkBg border border-neonPurple outline-none"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded bg-darkBg border border-neonPurple outline-none"
          required
        />
        <button
          type="submit"
          className="w-full py-3 bg-neonGreen text-darkBg font-bold rounded-lg hover:scale-105 transition-transform"
        >
          Login
        </button>
      </form>
      {message && <p className="mt-4 text-neonBlue">{message}</p>}
    </div>
  );
}
