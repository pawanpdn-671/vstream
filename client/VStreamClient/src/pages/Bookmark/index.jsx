import MoviesContainer from "@/components/movies/movies";
import PageWrapper from "@/components/shared/page-wrapper";
import { useBookmarkedMovies } from "@/hooks/user/useBookmarkMovies";
import React, { useEffect, useRef } from "react";

const BookmarkedMoviesPage = () => {
	const { bookmarkedMovies, isLoading, isFetching, isError, errorMessage, fetchNextPage, hasNextPage } =
		useBookmarkedMovies();
	const hasLoadedInitial = useRef(false);

	useEffect(() => {
		if (bookmarkedMovies?.length > 0 && !isLoading && !hasLoadedInitial.current) {
			hasLoadedInitial.current = true;
		}
	}, [bookmarkedMovies, isLoading]);

	return (
		<PageWrapper>
			<MoviesContainer
				movies={bookmarkedMovies}
				isError={isError}
				errorMessage={errorMessage}
				isFetching={isFetching}
				isLoading={isLoading}
				ref={null}
			/>
		</PageWrapper>
	);
};

export default BookmarkedMoviesPage;
