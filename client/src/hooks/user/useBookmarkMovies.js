import { userApi } from "@/service/userApi";
import { parseError } from "@/utils/parse-error";
import { useQuery } from "@tanstack/react-query";

export const useBookmarkedMovies = (options) => {
	const { enabled = true } = options ?? {};
	const { data, error, isLoading, isError, isFetching, refetch } = useQuery({
		queryKey: ["bookmarked-movies"],
		queryFn: userApi.getBookmarkedMovies,
		enabled,
	});

	const errorMessage = isError ? parseError(error) : "";

	return { bookmarkedMovies: data ?? null, error, isLoading, isError, isFetching, refetch, errorMessage };
};
