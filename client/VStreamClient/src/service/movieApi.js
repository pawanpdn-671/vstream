import api from "@/config/axiosConfig";

export const movieApi = {
	getMovies: ({ pageParam, limit }) => api.get("/movies", { params: { page: pageParam, limit } }),
	getMovieById: () => api.get("/movie/:imdb_id"),
	getGenres: () => api.get("/genres"),
	getRecommendedMovies: ({ pageParam, limit }) =>
		api.get("/recommended_movies", { params: { page: pageParam, limit } }),
};
