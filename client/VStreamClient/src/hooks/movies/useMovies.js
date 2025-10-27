import { useQuery } from "@tanstack/react-query";
import { movieApi } from "@/service/movieApi";
import { parseError } from "@/utils/parse-error";

export const useMovies = () => {
	const { data, error, isLoading, isError, isFetching, refetch } = useQuery({
		queryKey: ["movies"],
		queryFn: movieApi.getMovies,
	});

	const errorMessage = isError ? parseError(error) : "";

	return { movies: data ?? [], error, isLoading, isError, isFetching, refetch, errorMessage };
};
