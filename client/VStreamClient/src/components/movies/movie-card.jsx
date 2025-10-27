import React from "react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../shared/card";
import { Badge } from "../shared/badge";

const Movie = ({ movie }) => {
	return (
		<div className="">
			<Card className={"shadow-sm"}>
				<img src={movie.poster_path} alt={movie.title} className="object-contain h-[250px] w-full" />
				<CardHeader>
					<CardTitle>{movie.title}</CardTitle>
					<CardDescription></CardDescription>
					<CardAction></CardAction>
				</CardHeader>
				<CardContent>
					{movie?.ranking?.ranking_name && <Badge variant="secondary">{movie.ranking.ranking_name}</Badge>}
				</CardContent>
			</Card>
		</div>
	);
};

export default Movie;
