import api from "@/config/axiosConfig";

export const movieApi = {
	getMovies: ({ pageParam, limit, search, genre }) =>
		api.get("/movies", { params: { page: pageParam, limit, search, genre } }),
	getMovieById: (id) => api.get(`/movie/${id}`),
	getGenres: () => api.get("/genres"),
	getRecommendedMovies: ({ pageParam, limit }) =>
		api.get("/recommended_movies", { params: { page: pageParam, limit } }),
	getUserStoryBasedMovies: (payload) => api.post("/movie/user_story/wai", payload),
	toggleLikeDislike: ({ id, action }) => api.patch(`/movies/${id}/reaction?action=${action}`),
	addMovie: (payload) => api.post("/movie/add", payload),
	updateMovie: ({ payload, id }) => api.patch(`/movie/${id}/update`, payload),
	deleteMovie: (id) => api.delete(`/movie/${id}/delete`),
};
