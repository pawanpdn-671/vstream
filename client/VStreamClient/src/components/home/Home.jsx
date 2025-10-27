import React from "react";
import { EmptyResult } from "../empty-result";
import { APP_EMPTY_MESSAGES, APP_ERROR_MESSAGES } from "@/utils/constants";
import MoviesContainer from "../movies/movies";

const Home = ({ movies, errorMessage, isError }) => {
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
		<div>
			{movies?.length > 0 ? (
				<MoviesContainer movies={movies} />
			) : (
				<EmptyResult
					title={APP_EMPTY_MESSAGES.MOVIES.TITLE}
					description={APP_EMPTY_MESSAGES.MOVIES.DESCRIPTION}
					icon={APP_EMPTY_MESSAGES.MOVIES.ICON}
				/>
			)}
		</div>
	);
};

export default Home;
