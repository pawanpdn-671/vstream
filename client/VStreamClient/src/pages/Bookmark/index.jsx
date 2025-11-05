import MoviesContainer from "@/components/movies/movies";
import PageWrapper from "@/components/shared/page-wrapper";
import TitleWithLine from "@/components/shared/title-with-line";
import { useBookmarkedMovies } from "@/hooks/user/useBookmarkMovies";
import { PAGE_TITLE } from "@/utils/constants";
import React, { useEffect, useRef } from "react";

const BookmarkedMoviesPage = () => {
	const { bookmarkedMovies, isLoading, isFetching, isError, errorMessage } = useBookmarkedMovies();
	const hasLoadedInitial = useRef(false);

	useEffect(() => {
		if (bookmarkedMovies?.length > 0 && !isLoading && !hasLoadedInitial.current) {
			hasLoadedInitial.current = true;
		}
	}, [bookmarkedMovies, isLoading]);

	return (
		<PageWrapper>
			<TitleWithLine title={PAGE_TITLE.BOOKMARK} includeLine />
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
