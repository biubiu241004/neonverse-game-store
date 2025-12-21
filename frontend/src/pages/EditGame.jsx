import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function EditGame() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    rating: 0,
    image: "",
  });

  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadGame = async () => {
      try {
        const res = await api.get(`/api/games/${id}`);
        setForm(res.data);
        setPreview(res.data.image);
      } catch (err) {
        alert("Gagal memuat data game");
      }
    };

    loadGame();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
      setPreview(URL.createObjectURL(file));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await api.put(`/api/games/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Game berhasil diperbarui!");
      navigate("/admin/dashboard");
    } catch {
      alert("Gagal update game");
    }
  };

  return (
    <div className="p-10 min-h-screen bg-[#0b0b14] text-white flex justify-center">

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-[#141420] p-8 rounded-xl border border-neonPurple shadow-lg"
      >
        <h1 className="text-3xl font-bold mb-6 text-neonPink text-center">
          Edit Game
        </h1>

        {["title", "description", "price", "stock"].map((field) => (
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

        {preview && (
          <img
            src={preview}
            className="w-full h-60 object-cover rounded mb-4 border border-neonPurple"
          />
        )}

        <button
          className="w-full py-3 bg-gradient-to-r from-neonPink to-neonPurple font-bold rounded-lg"
          type="submit"
        >
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}
