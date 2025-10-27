import api from "@/config/axiosConfig";

export const authApi = {
	register: () => api.post("/register"),
	login: () => api.post("/login"),
	logout: () => api.post("/logout"),
};
