import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        ...form,
        role: "user",
      });
      setMessage("Register success! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error registering user");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-darkBg text-white">
      <h1 className="text-4xl text-neonPink mb-6">Register Account</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-[#111] p-6 rounded-2xl w-[90%] max-w-md shadow-neon"
      >
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded bg-darkBg border border-neonPurple outline-none"
          required
        />
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
          className="w-full py-3 bg-neonPink text-darkBg font-bold rounded-lg hover:scale-105 transition-transform"
        >
          Register
        </button>
      </form>
      {message && <p className="mt-4 text-neonBlue">{message}</p>}
    </div>
  );
}
