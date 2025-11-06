import React, { useEffect, useRef, useState } from "react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../shared/card";
import { Badge } from "../shared/badge";
import { Link } from "react-router-dom";
import { useMovieStore } from "@/store/useMovieStore";
import { Bookmark } from "lucide-react";
import { Button } from "../shared/button";
import { useToggleBookmark } from "@/hooks/user/useToggleBookmark";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";

const Movie = ({ movie }) => {
	const { setSelectedMovie } = useMovieStore();
	const [showBookmarkMsg, setShowBookmarkMsg] = useState(false);
	const { toggleBookmark, isPending } = useToggleBookmark();
	const messageTimerRef = useRef(null);
	const queryClient = useQueryClient();
	const { isBookmarked } = useAuthStore();
	const bookmarked = isBookmarked(movie?._id);

	const handleBookmarkClick = (e) => {
		e.stopPropagation();

		if (messageTimerRef.current) {
			clearTimeout(messageTimerRef.current);
		}

		toggleBookmark(
			{ id: movie._id },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["profile"] });
					queryClient.invalidateQueries({ queryKey: ["bookmarked-movies"] });
					setShowBookmarkMsg(true);
					messageTimerRef.current = setTimeout(() => {
						setShowBookmarkMsg(false);
					}, 1000);
				},
			},
		);
	};

	useEffect(() => {
		return () => {
			if (messageTimerRef.current) {
				clearTimeout(messageTimerRef.current);
			}
		};
	}, []);

	return (
		<div className="relative group rounded-md overflow-hidden min-h-[300px] h-full w-full">
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
					</div>
				</Card>
			</Link>
			<div
				className="absolute top-2 right-2 hidden group-hover:flex items-center z-20 cursor-pointer"
				onClick={handleBookmarkClick}>
				<span
					className={`absolute w-max text-white pr-2 -translate-y-1/2 text-sm top-1/2 left-0 font-medium transition-all duration-500 ease-in-out
						${showBookmarkMsg ? "opacity-100 -translate-x-full" : "opacity-0 -translate-x-3/4"}
					`}>
					{bookmarked ? "Bookmark Added" : "Bookmark Removed"}
				</span>

				<Bookmark size={28} className={`${bookmarked ? "text-red-500 fill-orange-400" : "text-white"}`} />
			</div>
		</div>
	);
};

export default Movie;
