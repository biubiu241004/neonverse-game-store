import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function AddGame() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    rating: "",
    image: "",
  });

  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🟣 Upload Gambar Lokal
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await api.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setForm({ ...form, image: res.data.imageUrl });

      // Preview langsung
      setPreview(URL.createObjectURL(file));
    } catch (err) {
      console.error(err);
      alert("❌ Upload gambar gagal");
    } finally {
      setUploading(false);
    }
  };

  // 🟣 Submit Game
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/api/games/add",
        { ...form },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Game berhasil ditambahkan!");
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal menambahkan game");
    }
  };

  return (
    <div className="p-10 min-h-screen bg-[#0b0b14] text-white flex justify-center">

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-[#141420] p-8 rounded-xl border border-neonPurple shadow-lg"
      >
        <h1 className="text-3xl font-bold mb-6 text-neonPink text-center">
          Tambah Game Baru
        </h1>

        {/* Input Text */}
        {["title", "description", "price", "stock", "rating"].map((field) => (
          <div key={field} className="mb-4">
            <label className="text-sm">{field.toUpperCase()}</label>
            <input
              name={field}
              value={form[field]}
              onChange={handleChange}
              className="w-full p-3 bg-[#0b0b14] border border-neonPurple rounded mt-1"
              required
            />
          </div>
        ))}

        {/* Upload Gambar */}
        <div className="mb-4">
          <label className="text-sm">Gambar</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full p-3 bg-[#0b0b14] border border-neonPurple rounded mt-1"
          />

          {uploading && <p className="text-yellow-400 mt-2">Uploading...</p>}
        </div>

        {/* Preview */}
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-60 object-cover rounded mb-4 border border-neonPurple"
          />
        )}

        <button
          className="w-full py-3 bg-gradient-to-r from-neonPink to-neonPurple font-bold rounded-lg"
          type="submit"
        >
          Tambah Game
        </button>
      </form>
    </div>
  );
}
