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
export const updateOrderStatus = (orderId, status, reason = "") => {
  return api.put(
    `/api/orders/admin/orders/${orderId}/status`,
    { status, reason },
    {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
};

export const getUserOrders = () => {
  return api.get("/api/orders/my-orders", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });
};

export const requestCancel = (id, reason) => {
  return api.put(
    `/api/orders/cancel-request/${id}`,
    { reason },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );
};
