import { useQuery } from "@tanstack/react-query";
import { movieApi } from "@/service/movieApi";
import { parseError } from "@/utils/parse-error";

export const useMovieById = (id) => {
	const { data, error, isLoading, isError, isFetching, refetch } = useQuery({
		queryKey: ["movie", id],
		queryFn: () => movieApi.getMovieById(id),
		enabled: !!id,
	});

	const errorMessage = isError ? parseError(error) : "";

	return {
		movie: data,
		error,
		isLoading,
		isError,
		isFetching,
		refetch,
		errorMessage,
	};
};
