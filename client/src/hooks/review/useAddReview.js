import { reviewApi } from "@/service/reviewApi";
import { parseError } from "@/utils/parse-error";
import { useMutation } from "@tanstack/react-query";

export const useAddReview = () => {
	const {
		mutate: addReviewHandler,
		data,
		error,
		isPending,
		isSuccess,
		isError,
	} = useMutation({
		mutationFn: reviewApi.addReview,
	});

	const errorMessage = isError ? parseError(error) : "";

	return { addReviewHandler, data, error, isPending, isError, isSuccess, errorMessage };
};
