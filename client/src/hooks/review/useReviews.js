import { useInfiniteQuery } from "@tanstack/react-query";
import { parseError } from "@/utils/parse-error";
import { reviewApi } from "@/service/reviewApi";

export const useReviews = (imdbId) => {
	const { data, error, isLoading, isError, isFetching, isFetchingNextPage, hasNextPage, refetch, fetchNextPage } =
		useInfiniteQuery({
			queryKey: ["reviews", imdbId],
			queryFn: ({ pageParam = 1 }) => reviewApi.getReviews({ pageParam, id: imdbId }),
			getNextPageParam: (lastPage) => {
				// lastPage is the backend response
				const { page, totalPages } = lastPage;
				return page < totalPages ? page + 1 : undefined;
			},
			initialPageParam: 1,
			enabled: !!imdbId,
		});

	const flatReviews = Array.isArray(data?.pages) ? data.pages.flatMap((page) => page?.data ?? []) : [];
	const errorMessage = isError ? parseError(error) : "";
	const totalDocs = Array.isArray(data?.pages) ? data?.pages[0]?.total : 0;

	return {
		reviews: flatReviews ?? [],
		totalDocs,
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
