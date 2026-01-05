import { authApi } from "@/service/authApi";
import { parseError } from "@/utils/parse-error";
import { useMutation } from "@tanstack/react-query";

export const useLogin = () => {
	const {
		mutate: loginUser,
		data,
		error,
		isPending,
		isSuccess,
		isError,
	} = useMutation({
		mutationFn: authApi.login,
	});

	const errorMessage = isError ? parseError(error) : "";

	return { loginUser, data, error, isPending, isError, isSuccess, errorMessage };
};
