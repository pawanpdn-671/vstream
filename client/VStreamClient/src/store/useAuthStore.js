import { create } from "zustand";
import api from "@/config/axiosConfig";

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

	logout: async () => {
		try {
			await api.post("/logout");
		} catch (err) {
			console.error("Logout failed:", err);
		} finally {
			set({ user: null, isAuthenticated: false });
		}
	},
}));
