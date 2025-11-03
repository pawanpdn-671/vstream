import React from "react";
import Movie from "../movies/movie-card";

const ProcessedMoviesFeed = ({ movies }) => {
	console.log(movies);
	return (
		<div>
			<div className="flex flex-wrap gap-4">
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
