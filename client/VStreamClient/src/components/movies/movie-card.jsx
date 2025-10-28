import React from "react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../shared/card";
import { Badge } from "../shared/badge";

const Movie = ({ movie }) => {
	return (
		<div className="relative">
			<Card className={"shadow-sm"}>
				<img src={movie.poster_path} alt={movie.title} className="object-contain h-[350px] w-full" />
				<div className="absolute bg-black/80 bottom-0 left-0 w-full rounded-b-lg">
					<CardHeader>
						<CardTitle>{movie.title}</CardTitle>
						<CardDescription></CardDescription>
						<CardAction></CardAction>
					</CardHeader>
					<CardContent>
						{movie?.ranking?.ranking_name && <Badge variant="secondary">{movie.ranking.ranking_name}</Badge>}
					</CardContent>
				</div>
			</Card>
		</div>
	);
};

export default Movie;
