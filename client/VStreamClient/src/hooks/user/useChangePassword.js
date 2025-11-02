import { userApi } from "@/service/userApi";
import { parseError } from "@/utils/parse-error";
import { useMutation } from "@tanstack/react-query";

export const useChangePassword = () => {
	const {
		mutate: changePassword,
		data,
		error,
		isPending,
		isSuccess,
		isError,
	} = useMutation({
		mutationFn: userApi.changePassword,
	});

	const errorMessage = isError ? parseError(error) : "";

	return { changePassword, data, error, isPending, isError, isSuccess, errorMessage };
};
