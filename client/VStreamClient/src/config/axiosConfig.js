import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

const refreshApi = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.response.use(
	(res) => res.data,
	async (error) => {
		const originalRequest = error.config;

		if (originalRequest.url.includes("/refresh")) {
			return Promise.reject(error);
		}

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			try {
				await refreshApi.post("/refresh"); // get new tokens via cookie
				console.log("thererere");
				return api(originalRequest); // retry original request
			} catch (e) {
				console.error("Refresh token expired — logging out");
			}
		}

		return Promise.reject(error);
	},
);

export default api;
