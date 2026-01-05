import { userApi } from "@/service/userApi";
import { parseError } from "@/utils/parse-error";
import { useMutation } from "@tanstack/react-query";

export const useUploadAvatar = () => {
	const {
		mutate: uploadAvatar,
		data,
		error,
		isPending,
		isSuccess,
		isError,
	} = useMutation({
		mutationFn: userApi.uploadAvatar,
	});

	const errorMessage = isError ? parseError(error) : "";

	return { uploadAvatar, data, error, isPending, isError, isSuccess, errorMessage };
};
