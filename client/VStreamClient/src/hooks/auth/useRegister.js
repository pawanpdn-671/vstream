import { authApi } from "@/service/authApi";
import { parseError } from "@/utils/parse-error";
import { useMutation } from "@tanstack/react-query";

export const useRegister = () => {
	const {
		mutate: registerUser,
		data,
		error,
		isPending,
		isSuccess,
		isError,
	} = useMutation({
		mutationFn: authApi.register,
	});

	const errorMessage = isError ? parseError(error) : "";

	return { registerUser, data, error, isPending, isError, isSuccess, errorMessage };
};
