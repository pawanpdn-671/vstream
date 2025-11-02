import api from "@/config/axiosConfig";

export const userApi = {
	profile: () => api.get("/me"),
	updateProfile: (payload) => api.post("/me/update", payload),
	uploadAvatar: (payload) =>
		api.post("/me/upload_avatar", payload, {
			headers: { "Content-Type": "multipart/form-data" },
		}),
	changePassword: (payload) => api.post("/me/change_password", payload),
};
