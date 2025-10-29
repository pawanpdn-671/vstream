import MoviesContainer from "@/components/movies/movies";
import PageWrapper from "@/components/shared/page-wrapper";
import { useRecommendedMovies } from "@/hooks/movies/useRecommendedMovies";
import React, { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

const RecommendedMovies = () => {
	const { recommendedMovies, isLoading, isFetching, isError, errorMessage, fetchNextPage, hasNextPage } =
		useRecommendedMovies();
	const { ref, inView } = useInView();
	const hasLoadedInitial = useRef(false);

	useEffect(() => {
		if (recommendedMovies?.length > 0 && !isLoading && !hasLoadedInitial.current) {
			hasLoadedInitial.current = true;
		}
	}, [recommendedMovies, isLoading]);

	useEffect(() => {
		if (inView && hasNextPage && !isFetching && hasLoadedInitial.current) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, fetchNextPage, isFetching]);

	return (
		<PageWrapper>
			<MoviesContainer
				movies={recommendedMovies}
				isError={isError}
				errorMessage={errorMessage}
				isFetching={isFetching}
				isLoading={isLoading}
				ref={ref}
			/>
		</PageWrapper>
	);
};

export default RecommendedMovies;

RecommendedMovies.Skeleton = function HomeSkeletonWrapper() {
	return (
		<>
			<Skeleton className="h-[400px] w-full rounded-md" />
			<Skeleton className="h-[400px] w-full rounded-md" />
			<Skeleton className="h-[400px] w-full rounded-md" />
			<Skeleton className="h-[400px] w-full rounded-md" />
			<Skeleton className="h-[400px] w-full rounded-md" />
			<Skeleton className="h-[400px] w-full rounded-md" />
			<Skeleton className="h-[400px] w-full rounded-md" />
			<Skeleton className="h-[400px] w-full rounded-md" />
			<Skeleton className="h-[400px] w-full rounded-md" />
			<Skeleton className="h-[400px] w-full rounded-md" />
		</>
	);
};
