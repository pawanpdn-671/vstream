import { create } from "zustand";

export const useAuthStore = create((set) => ({
	user: null,
	isAuthenticated: false,
	isLoading: false,
	hasFetchedProfile: false,
	setUser: (user) =>
		set({
			user,
			isAuthenticated: !!user,
			isLoading: false,
			hasFetchedProfile: true,
		}),

	setLoading: (state) => set({ isLoading: state }),
	isBookmarked: (movieId) => {
		const state = useAuthStore.getState();
		return state.user?.bookmarked_movie_ids?.includes(movieId) ?? false;
	},
}));
