import { create } from "zustand";

export const useMovieStore = create((set, get) => ({
	searchQuery: "",
	setSearchQuery: (query) => set({ searchQuery: query }),
	selectedMovie: null,
	setSelectedMovie: (movie) => set({ selectedMovie: movie }),
}));
