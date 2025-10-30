import React from "react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../shared/card";
import { Badge } from "../shared/badge";
import { Link } from "react-router-dom";
import { useMovieStore } from "@/store/useMovieStore";

const Movie = ({ movie }) => {
	const { setSelectedMovie } = useMovieStore();

	return (
		<div className="min-h-[300px] w-full relative group rounded-md overflow-hidden">
			<Link to={`/stream/${movie?.imdb_id}`} onClick={() => setSelectedMovie(movie)}>
				<Card className={"shadow-sm h-full w-full p-0"}>
					<img
						src={movie.poster_path}
						alt={movie.title}
						className="rounded-md h-full transition-transform duration-500 object-cover"
					/>
					<div
						className="absolute top-0 left-0 w-full h-full 
					bg-black/60 text-background p-4
					translate-y-full opacity-0 group-hover:opacity-100 group-hover:translate-y-1/2 
					transition-transform duration-500 ease-in-out">
						<CardHeader className={"p-0"}>
							<CardTitle className={"font-medium"}>{movie.title}</CardTitle>
							<CardDescription></CardDescription>
							<CardAction></CardAction>
						</CardHeader>
						<CardContent className={"p-0"}>
							{movie?.ranking?.ranking_name && <Badge variant="secondary">{movie.ranking.ranking_name}</Badge>}
						</CardContent>
					</div>
				</Card>
			</Link>
		</div>
	);
};

export default Movie;
