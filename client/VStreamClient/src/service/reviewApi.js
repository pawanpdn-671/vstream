import api from "@/config/axiosConfig";

export const reviewApi = {
	addReview: ({ id, payload }) => api.post(`/movies/${id}/add_review`, payload),
	getReviews: ({ id, pageParam }) => api.get(`/movies/${id}/reviews`, { params: { page: pageParam } }),
};
