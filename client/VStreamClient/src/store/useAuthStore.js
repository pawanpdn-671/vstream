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
}));
