export function parseError(error) {
	if (!error) return "An unknown error occurred.";

	if (error.response) {
		return error.response.data?.message || "Server error occurred.";
	}

	if (error.request || error.code === "ERR_NETWORK") {
		return "Network error: Please check your connection.";
	}

	return error.message || "Something went wrong.";
}
