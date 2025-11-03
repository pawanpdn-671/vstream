import api from "@/config/axiosConfig";

export const movieApi = {
	getMovies: ({ pageParam, limit, search, genre }) =>
		api.get("/movies", { params: { page: pageParam, limit, search, genre } }),
	getMovieById: (id) => api.get(`/movie/${id}`),
	getGenres: () => api.get("/genres"),
	getRecommendedMovies: ({ pageParam, limit }) =>
		api.get("/recommended_movies", { params: { page: pageParam, limit } }),
	getUserStoryBasedMovies: (payload) => api.post("/movie/user_story/wai", payload),
};
