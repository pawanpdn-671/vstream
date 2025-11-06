import { movieApi } from "@/service/movieApi";
import { userApi } from "@/service/userApi";
import { parseError } from "@/utils/parse-error";
import { useMutation } from "@tanstack/react-query";

export const useAddUpdateMovie = (action) => {
	const {
		mutate: movieHandler,
		data,
		error,
		isPending,
		isSuccess,
		isError,
	} = useMutation({
		mutationFn: action === "add" ? movieApi.addMovie : movieApi.updateMovie,
	});

	const errorMessage = isError ? parseError(error) : "";

	return { movieHandler, data, error, isPending, isError, isSuccess, errorMessage };
};
