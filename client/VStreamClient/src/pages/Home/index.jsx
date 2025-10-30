import MoviesContainer from "@/components/movies/movies";
import SearchBar from "@/components/search-bar";
import PageWrapper from "@/components/shared/page-wrapper";
import { Skeleton } from "@/components/shared/skeleton";
import { useMovies } from "@/hooks/movies/useMovies";
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

const HomePage = () => {
	const { movies, isLoading, isFetching, isError, errorMessage, fetchNextPage, hasNextPage } = useMovies();
	const { ref, inView } = useInView();
	const hasLoadedInitial = useRef(false);

	useEffect(() => {
		if (movies?.length > 0 && !isLoading && !hasLoadedInitial.current) {
			hasLoadedInitial.current = true;
		}
	}, [movies, isLoading]);

	useEffect(() => {
		if (inView && hasNextPage && !isFetching && hasLoadedInitial.current) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, fetchNextPage, isFetching]);

	return (
		<PageWrapper>
			<MoviesContainer
				movies={movies}
				isError={isError}
				errorMessage={errorMessage}
				isFetching={isFetching}
				isLoading={isLoading}
				ref={ref}
			/>
		</PageWrapper>
	);
};

export default HomePage;

HomePage.Skeleton = function HomeSkeletonWrapper() {
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
