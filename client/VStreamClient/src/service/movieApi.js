import api from "@/config/axiosConfig";

export const movieApi = {
	getMovies: () => api.get("/movies"),
	getMovieById: () => api.get("/movie/:imdb_id"),
};
