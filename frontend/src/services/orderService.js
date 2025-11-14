import api from "./api";

const getToken = () => localStorage.getItem("token");

// Ambil order admin
export const getAdminOrders = () => {
  return api.get("/api/orders/admin/orders", {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

// Konfirmasi order
export const confirmOrder = (orderId) => {
  return api.put(
    `/api/orders/admin/orders/${orderId}/confirm`,
    {},
    {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};
