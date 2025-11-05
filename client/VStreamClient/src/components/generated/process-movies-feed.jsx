import React from "react";
import Movie from "../movies/movie-card";
import { EmptyResult } from "../empty-result";
import { APP_EMPTY_MESSAGES, APP_ERROR_MESSAGES } from "@/utils/constants";
import { parseError } from "@/utils/parse-error";

const ProcessedMoviesFeed = ({ movies, isError, error }) => {
	if (isError) {
		return (
			<div className="mt-10 text-center">
				<EmptyResult
					title={APP_ERROR_MESSAGES.GROQ_RESPONSE.TITLE}
					icon={APP_ERROR_MESSAGES.GROQ_RESPONSE.ICON}
					description={parseError(error) ?? ""}
					iconColor={"destructive"}
					noAction={true}
				/>
			</div>
		);
	}

	if (movies && movies?.length === 0) {
		return (
			<div className="mt-10 text-center">
				<EmptyResult
					title={APP_EMPTY_MESSAGES.GROQ_RESPONSE.TITLE}
					icon={APP_EMPTY_MESSAGES.GROQ_RESPONSE.ICON}
					description={parseError(error) ?? ""}
					iconColor={"destructive"}
					noAction={true}
				/>
			</div>
		);
	}

	return (
		<div>
			<h3 className="text-lg text-muted-foreground font-medium">Processed Results</h3>
			<div className="mt-5 flex flex-wrap gap-4">
				{movies?.map((movie) => (
					<div key={movie.imdb_id} className="w-[280px]">
						<Movie movie={movie} />
					</div>
				))}
			</div>
		</div>
	);
};

export default ProcessedMoviesFeed;
