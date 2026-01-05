import api from "@/config/axiosConfig";

export const userApi = {
	profile: () => api.get("/me"),
	updateProfile: (payload) => api.post("/me/update", payload),
	uploadAvatar: (payload) =>
		api.post("/me/upload_avatar", payload, {
			headers: { "Content-Type": "multipart/form-data" },
		}),
	changePassword: (payload) => api.post("/me/change_password", payload),
	getBookmarkedMovies: () => api.get("/me/bookmarked_movies"),
	toggleBookmarkMovie: ({ id }) => api.post(`/bookmark/${id}`),
	getLikedMovies: ({ pageParam }) => api.get("/me/liked_movies", { params: { page: pageParam } }),
	getUserReviews: ({ pageParam }) => api.get("/me/reviews", { params: { page: pageParam } }),
	getExpertHelp: (payload) => api.post("/movie/expert-help", payload),
};
