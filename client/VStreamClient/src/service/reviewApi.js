import api from "@/config/axiosConfig";

export const reviewApi = {
	addReview: ({ id, payload }) => api.post(`/movies/${id}/add_review`, payload),
};
