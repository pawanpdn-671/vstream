import api from "@/config/axiosConfig";

export const authApi = {
	register: (payload) => api.post("/register", payload),
	login: (payload) => api.post("/login", payload),
	logout: () => api.post("/logout"),
	profile: () => api.get("/me"),
};
