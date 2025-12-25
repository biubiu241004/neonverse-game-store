import api from "./api";

export const getMyBalance = () => {
  return api.get("/api/users/me/balance");
};

export const getBalanceHistory = () => {
  return api.get("/api/users/me/balance-history");
};

export const requestWithdraw = (data) => {
  return api.post("/api/users/me/withdraw", data);
};

export const getAllWithdraws = () => {
  return api.get("/api/users/admin/withdraws");
};

export const updateWithdrawStatus = (id, status) => {
  return api.put(`/api/users/admin/withdraws/${id}`, { status });
};

export const getAllUsers = () => {
  return api.get("/api/users/admin/users");
};

export const toggleBanUser = (id) => {
  return api.put(`/api/users/admin/users/${id}/ban`);
};

export const getMyWithdraws = () => {
  return api.get("/api/users/me/withdraws");
};
