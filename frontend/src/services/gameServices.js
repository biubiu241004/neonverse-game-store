import api from "./api";

export const getGame = (id) => api.get(`/api/games/${id}`);
export const getRelatedGames = (id) => api.get(`/api/games/${id}/related`);
export const getReviews = (id) => api.get(`/api/games/${id}/reviews`);
export const postReview = (id, data, token) =>
    api.post(`/api/games/${id}/reviews`, data, { headers: { Authorization: `Bearer ${token}` }});
