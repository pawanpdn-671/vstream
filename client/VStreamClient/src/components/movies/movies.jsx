import React from "react";
import Movie from "./movie-card";
import HomePage from "@/pages/Home";
import { EmptyResult } from "../empty-result";
import { APP_EMPTY_MESSAGES, APP_ERROR_MESSAGES } from "@/utils/constants";

const MoviesContainer = ({ movies, errorMessage, isError, isLoading, isFetching, ref }) => {
	if (isError) {
		return (
			<EmptyResult
				title={APP_ERROR_MESSAGES.MOVIES.TITLE}
				icon={APP_ERROR_MESSAGES.MOVIES.ICON}
				description={errorMessage}
				iconColor={"destructive"}
				noAction={true}
			/>
		);
	}

	return (
		<div className="py-10">
			<div className="grid grid-cols-4 gap-8 pb-10">
				{movies?.length > 0 && movies.map((movie) => <Movie key={movie._id} movie={movie} />)}
				{isFetching && <HomePage.Skeleton />}
			</div>
			{!isLoading && !isFetching && movies?.length === 0 && (
				<div className="mt-10 text-center">
					<EmptyResult
						title={APP_EMPTY_MESSAGES.MOVIES.TITLE}
						description={APP_EMPTY_MESSAGES.MOVIES.DESCRIPTION}
						icon={APP_EMPTY_MESSAGES.MOVIES.ICON}
					/>
				</div>
			)}
			{!isFetching && <div ref={ref} style={{ height: "1px" }} />}
		</div>
	);
};

export default MoviesContainer;
