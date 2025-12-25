import { useEffect, useState } from "react";
import { getAllUsers, toggleBanUser } from "../services/userService";
import { motion } from "framer-motion";

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await getAllUsers();
    setUsers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (id) => {
    await toggleBanUser(id);
    load();
  };

  if (loading) {
    return <div className="h-40 bg-[#141420] animate-pulse rounded-xl" />;
  }

  return (
    <div className="min-h-screen bg-[#0b0b14] text-white p-8 pt-24">
      <h1 className="text-3xl font-bold text-neonPink mb-6">
        👥 User Management (SuperAdmin)
      </h1>

      <div className="space-y-3">
        {users.map((u) => (
          <motion.div
            key={u._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#141420] border border-neonPurple/40 rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">
                {u.username}{" "}
                <span className="text-xs text-gray-400">
                  ({u.role})
                </span>
              </p>
              <p className="text-xs text-gray-500">{u.email}</p>
              <p className="text-xs">
                Status:{" "}
                {u.isBanned ? (
                  <span className="text-red-400">BANNED</span>
                ) : (
                  <span className="text-green-400">ACTIVE</span>
                )}
              </p>
            </div>

            {u.role !== "superadmin" && (
              <button
                onClick={() => toggle(u._id)}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  u.isBanned
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {u.isBanned ? "Unban" : "Ban"}
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
