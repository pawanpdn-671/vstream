import { userApi } from "@/service/userApi";
import { parseError } from "@/utils/parse-error";
import { useMutation } from "@tanstack/react-query";

export const useUpdateProfile = () => {
	const {
		mutate: updateUser,
		data,
		error,
		isPending,
		isSuccess,
		isError,
	} = useMutation({
		mutationFn: userApi.updateProfile,
	});

	const errorMessage = isError ? parseError(error) : "";

	return { updateUser, data, error, isPending, isError, isSuccess, errorMessage };
};
