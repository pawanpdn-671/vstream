import { reviewApi } from "@/service/reviewApi";
import { useQuery } from "@tanstack/react-query";
import { format, isAfter, isValid, parseISO } from "date-fns";
import { ChevronsUp } from "lucide-react";
import { useState } from "react";
import YouTube from "react-youtube";
import { Button } from "../shared/button";
import { Drawer, DrawerContent, DrawerTrigger } from "../shared/drawer";
import GradientBorder from "../shared/gradient-border";
import { Skeleton } from "../shared/skeleton";
import PopularWords from "./popular-words";
import MovieReviews from "./reviews";
import SimilarMoviesGallery from "./similar-movies-gallery";
import UploadedInfo from "./uploaded-info";

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
		<div className="flex flex-col lg:flex-row gap-10">
			<div className="flex-1 basis-[60%] flex flex-col">
				<div className="react-player-container aspect-video overflow-hidden w-full rounded-md">
					<YouTube
						videoId={movie?.youtube_id}
						id={movie?._id}
						className="w-full h-full"
						iframeClassName="w-full h-full"
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
				<div>
					{totalReviews >= 5 && !!movie?.imdb_id && (
						<div className="mt-4">
							<PopularWords isLoading={isloading} data={data?.popular_words} />
						</div>
					)}
					<div className="block mt-4 lg:hidden">
						<Drawer>
							<DrawerTrigger asChild>
								<Button variant="outline" className={"w-full text-sm h-auto py-2 rounded-3xl"}>
									Open Reviews
								</Button>
							</DrawerTrigger>
							<DrawerContent className={"overflow-y-auto! touch-auto! max-h-[80vh]! md:max-h-[70vh]!"}>
								<p className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-medium">
									Pull Down to Close
									<ChevronsUp size={16} className="ml-2 inline-block animate-bounce" />
								</p>
								<div className="px-3 sm:px-0 mx-auto w-full max-w-lg">
									<MovieReviews imdbId={movie?.imdb_id} setTotalReviews={setTotalReviews} />
								</div>
							</DrawerContent>
						</Drawer>
					</div>
					<div className="hidden lg:block">
						<MovieReviews imdbId={movie?.imdb_id} setTotalReviews={setTotalReviews} />
					</div>
				</div>
			</div>
			<div className="w-full flex lg:w-[400px] flex-col gap-4">
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
