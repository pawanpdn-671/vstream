import ReactPlayer from "react-player";
import GradientBorder from "../shared/gradient-border";
import MovieReviews from "./reviews";
import UploadedInfo from "./uploaded-info";
import { Skeleton } from "../shared/skeleton";
import { useState } from "react";
import { format, isAfter, isValid, parseISO } from "date-fns";
import PopularWords from "./popular-words";
import { useQuery } from "@tanstack/react-query";
import { reviewApi } from "@/service/reviewApi";
import SimilarMoviesGallery from "./similar-movies-gallery";

const StreamMovie = ({ movie }) => {
	const [playerReady, setPlayerReady] = useState(false);
	const [totalReviews, setTotalReviews] = useState(0);

	const { data, isloading } = useQuery({
		queryFn: () => reviewApi.getTopWords(movie.imdb_id),
		queryKey: ["top-words", movie?.imdb_id],
		enabled: totalReviews >= 5 && !!movie?.imdb_id,
	});

	const { title, plot, genre } = movie;
	const date = parseISO(movie?.created_at);
	const isRealDate = date && isValid(date) && isAfter(date, new Date("1900-01-01"));

	return (
		<div className="flex gap-10">
			<div className="flex-1 basis-[60%] flex flex-col">
				<div className="aspect-video overflow-hidden w-full rounded-md">
					<ReactPlayer
						url={`https://www.youtube.com/watch?v=${movie.youtube_id}`}
						playing={false}
						width={"100%"}
						height={"100%"}
						controls
						onReady={() => setPlayerReady(true)}
					/>
					{!playerReady && <Skeleton />}
				</div>
				{isRealDate && (
					<div className="mt-2 flex gap-2 items-center justify-end">
						<span className="text-xs text-muted-foreground">Uploaded On</span>
						<span className="text-gradient text-xs font-medium">{format(movie.created_at, "d MMM yyyy")}</span>
					</div>
				)}
				<div className="mt-5">
					<UploadedInfo imdbId={movie?.imdb_id} movieId={movie?._id} movie={movie} />
				</div>
				<div className="mt-4">
					{totalReviews >= 5 && !!movie?.imdb_id && (
						<PopularWords isLoading={isloading} data={data?.popular_words} />
					)}
					<MovieReviews imdbId={movie?.imdb_id} setTotalReviews={setTotalReviews} />
				</div>
			</div>
			<div className="w-[400px] flex flex-col gap-4">
				<div className="flex flex-wrap gap-2">
					{genre?.map((g) => (
						<span
							key={g.genre_id}
							className="text-xs inline-block px-2 py-1 rounded-sm bg-linear-to-r from-orange-100 dark:from-orange-900 dark:to-red-950 to to-red-100">
							{g.genre_name}
						</span>
					))}
				</div>
				<GradientBorder radius={"rounded-sm"}>
					<div className={"flex flex-col gap-2 p-3"}>
						<h3 className={"text-lg font-bold text-gradient"}>{title}</h3>
						<p className="text-xs leading-6 text-muted-foreground">{plot}</p>
					</div>
				</GradientBorder>
				{movie?.genre && movie?.genre?.length > 0 && (
					<SimilarMoviesGallery genre={movie?.genre} movieId={movie?.imdb_id} />
				)}
			</div>
		</div>
	);
};

export default StreamMovie;
