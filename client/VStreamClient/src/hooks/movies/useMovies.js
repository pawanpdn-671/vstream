import { useInfiniteQuery } from "@tanstack/react-query";
import { movieApi } from "@/service/movieApi";
import { parseError } from "@/utils/parse-error";
import { useMovieStore } from "@/store/useMovieStore";

export const useMovies = (filters = {}) => {
	const { genre = "" } = filters;
	const { searchQuery: search } = useMovieStore();

	const { data, error, isLoading, isError, isFetching, isFetchingNextPage, hasNextPage, refetch, fetchNextPage } =
		useInfiniteQuery({
			queryKey: ["movies", search, genre],
			queryFn: ({ pageParam = 1 }) => movieApi.getMovies({ pageParam, search, genre }),
			getNextPageParam: (lastPage) => {
				// lastPage is the backend response
				const { page, totalPages } = lastPage;
				return page < totalPages ? page + 1 : undefined;
			},
			initialPageParam: 1,
		});

	const flatMovies = data?.pages.flatMap((page) => page.data) ?? [];
	const errorMessage = isError ? parseError(error) : "";

	return {
		movies: flatMovies ?? [],
		error,
		isLoading,
		isError,
		isFetching,
		refetch,
		errorMessage,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
	};
};
