import api from "./api";

export async function addToCart(gameId, quantity = 1) {
  const token = localStorage.getItem("token");

  return api.post(
    "/api/cart/add",
    { gameId, quantity },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}
