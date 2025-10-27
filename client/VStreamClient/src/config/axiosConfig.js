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

api.interceptors.response.use(
	(res) => res.data,
	(error) => {
		const status = error.response?.status;
		if (status === 401) {
			console.warn("Unauthorized - token may be expired");
		}
		return Promise.reject(error);
	},
);

export default api;
