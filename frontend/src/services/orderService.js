import api from "./api";

const getToken = () => localStorage.getItem("token");

export const getAdminOrders = () => {
  return api.get("/api/orders/admin/orders", {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

export const updateOrderStatus = (orderId, status, reason = "") => {
  return api.put(
    `/api/orders/admin/orders/${orderId}/status`,
    { status, reason },
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
};

export const getUserOrders = () => {
  return api.get("/api/orders/my-orders", {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

export const requestCancel = (id, reason) => {
  return api.put(
    `/api/orders/cancel-request/${id}`,
    { reason },
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
};

export const getSalesSummary = () => {
  return api.get("/api/orders/admin/sales/summary");
};
