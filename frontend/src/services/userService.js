import api from "./api";

export const getMyBalance = () => {
  return api.get("/api/users/me/balance");
};
