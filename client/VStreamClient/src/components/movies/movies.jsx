import React from "react";
import Movie from "./movie-card";

const MoviesContainer = ({ movies }) => {
	return (
		<div className="mt-4">
			<div className="grid grid-cols-4">
				{movies.map((movie) => (
					<Movie key={movie._id} movie={movie} />
				))}
			</div>
		</div>
	);
};

export default MoviesContainer;
