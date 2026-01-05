import { create } from "zustand";

export const useMovieStore = create((set, get) => ({
	searchQuery: "",
	setSearchQuery: (query) => set({ searchQuery: query }),
	searchByGenre: [],
	setSearchByGenre: (genre) => set({ searchByGenre: genre }),
	selectedMovie: null,
	setSelectedMovie: (movie) => set({ selectedMovie: movie }),
}));
