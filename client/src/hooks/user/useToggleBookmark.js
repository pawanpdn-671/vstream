import { userApi } from "@/service/userApi";
import { parseError } from "@/utils/parse-error";
import { useMutation } from "@tanstack/react-query";

export const useToggleBookmark = () => {
	const {
		mutate: toggleBookmark,
		data,
		error,
		isPending,
		isSuccess,
		isError,
	} = useMutation({
		mutationFn: userApi.toggleBookmarkMovie,
	});

	const errorMessage = isError ? parseError(error) : "";

	return { toggleBookmark, data, error, isPending, isError, isSuccess, errorMessage };
};
