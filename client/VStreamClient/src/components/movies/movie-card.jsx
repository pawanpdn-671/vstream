import React, { useState } from "react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../shared/card";
import { Badge } from "../shared/badge";
import { Link } from "react-router-dom";
import { useMovieStore } from "@/store/useMovieStore";
import { Bookmark } from "lucide-react";
import { Button } from "../shared/button";

const Movie = ({ movie }) => {
	const { setSelectedMovie } = useMovieStore();
	const [showBookmarkMsg, setShowBookmarkMsg] = useState(false);

	const handleBookmarkClick = (e) => {
		e.stopPropagation();
		setShowBookmarkMsg(true);

		setTimeout(() => setShowBookmarkMsg(false), 2000);
	};

	return (
		<div className="relative group rounded-md overflow-hidden min-h-[300px] w-full">
			<Link to={`/stream/${movie?.imdb_id}`} onClick={() => setSelectedMovie(movie)}>
				<Card className="shadow-sm h-full w-full p-0 relative overflow-hidden">
					<img
						src={movie.poster_path}
						alt={movie.title}
						className="h-full w-full object-cover rounded-md 
						transition-all duration-500 ease-in-out 
						group-hover:scale-110 group-hover:blur-md"
					/>

					<div
						className="absolute inset-0 bg-black/30 opacity-0 
              group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
					/>

					<div
						className="absolute inset-0 flex flex-col justify-center items-center 
						text-white text-center
						opacity-0 translate-y-10 
						group-hover:opacity-100 group-hover:translate-y-0 
						transition-all duration-500 ease-in-out z-10">
						<CardHeader className="py-5 w-full px-2">
							<CardTitle className="font-bold mx-auto max-w-full text-3xl bg-linear-to-r from-red-200 via-orange-50 to-orange-200 bg-clip-text text-transparent">
								{movie.title}
							</CardTitle>
							<CardDescription className="mt-2 text-sm font-medium text-white line-clamp-4">
								{movie.plot}
							</CardDescription>
						</CardHeader>

						<CardContent className="p-0 mt-2">
							{movie?.ranking?.ranking_name && <Badge variant="secondary">{movie.ranking.ranking_name}</Badge>}
						</CardContent>
					</div>
				</Card>
			</Link>
			<div
				className="absolute top-2 right-2 hidden group-hover:flex items-center z-20 cursor-pointer"
				onClick={handleBookmarkClick}>
				<span
					className={`absolute w-max text-white pr-2 -translate-y-1/2 text-sm top-1/2 left-0 font-medium transition-all duration-500 ease-in-out
						${showBookmarkMsg ? "opacity-100 -translate-x-full" : "opacity-0 -translate-x-1/2"}
					`}>
					Bookmark Added
				</span>

				<Bookmark size={28} className="text-white" />
			</div>
		</div>
	);
};

export default Movie;
