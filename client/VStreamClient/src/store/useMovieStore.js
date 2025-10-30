import { create } from "zustand";

export const useMovieStore = create((set, get) => ({
	searchQuery: "",
	setSearchQuery: (query) => set({ searchQuery: query }),
}));
