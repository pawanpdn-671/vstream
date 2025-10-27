import api from "@/config/axiosConfig";

export const authApi = {
	register: (payload) => api.post("/register", payload),
	login: () => api.post("/login"),
	logout: () => api.post("/logout"),
};
