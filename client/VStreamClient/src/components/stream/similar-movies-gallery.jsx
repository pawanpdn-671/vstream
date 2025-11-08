import React, { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "../shared/skeleton";
import { useInfiniteQuery } from "@tanstack/react-query";
import { movieApi } from "@/service/movieApi";
import { Link } from "react-router-dom";

const SimilarMoviesGallery = ({ genre, movieId }) => {
	const formattedGenre = genre?.map((genre) => genre?.genre_name)?.join(",") ?? "";
	const { data, isLoading, isError, isFetching, hasNextPage, fetchNextPage } = useInfiniteQuery({
		queryKey: ["similar-genre-movies", genre],
		queryFn: ({ pageParam = 1 }) => movieApi.getMovies({ pageParam, genre: formattedGenre }),
		getNextPageParam: (lastPage) => {
			const { page, totalPages } = lastPage;
			return page < totalPages ? page + 1 : undefined;
		},
		initialPageParam: 1,
		enabled: !!formattedGenre,
	});

	const movies = data?.pages?.flatMap((page) => page?.data?.filter((movie) => movie?.imdb_id !== movieId) ?? []) ?? [];

	const { ref, inView } = useInView();
	const hasLoadedInitial = useRef(false);

	useEffect(() => {
		if (movies?.length > 0 && !isLoading && !hasLoadedInitial.current) {
			hasLoadedInitial.current = true;
		}
	}, [movies, isLoading]);

	useEffect(() => {
		if (inView && hasNextPage && !isFetching && hasLoadedInitial.current) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, fetchNextPage, isFetching]);

	if (isError) return <></>;

	return (
		<div>
			<h4 className="py-2 font-medium">Similar Movies</h4>
			<div className="space-y-4">
				{movies &&
					movies?.length > 0 &&
					movies?.map((movie) => (
						<div key={movie._id}>
							<Link to={`/stream/${movie.imdb_id}`}>
								<div
									movie={movie}
									className="flex p-2 group hover:scale-105 duration-200 ease-in-out transition-transform border hover rounded-sm gap-4 shadow-sm">
									<div className="shrink-0 relative">
										<img
											src={`https://img.youtube.com/vi/${movie.youtube_id}/default.jpg`}
											alt={movie?.title}
											className="aspect-auto rounded-sm w-[120px]"
										/>
										<div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
											<div className="bg-red-500 px-2 py-0.5 rounded-md flex items-center justify-center">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													className="w-6 h-6 drop-shadow-md fill-white">
													<path d="M8 5v14l11-7z" />
												</svg>
											</div>
										</div>
									</div>
									<div className="grow space-y-1.5">
										<p className="text-sm font-medium">{movie.title}</p>
										<p className="text-muted-foreground text-xs line-clamp-2">{movie.plot}</p>
									</div>
								</div>
							</Link>
						</div>
					))}
				{isFetching && <SimilarMoviesGallery.Skeleton />}
				{!isFetching && ref && <div ref={ref} style={{ height: "1px" }} />}
			</div>
		</div>
	);
};

export default SimilarMoviesGallery;

SimilarMoviesGallery.Skeleton = function MoviesGallerySkeleton() {
	return (
		<>
			<Skeleton className="w-full p-2 bg-zinc-50 flex items-start gap-4">
				<Skeleton className={"w-[120px] aspect-video"} />
				<div className="grow flex flex-col gap-2">
					<Skeleton className={"h-6 w-full"} />
					<Skeleton className={"h-6 w-full"} />
				</div>
			</Skeleton>
			<Skeleton className="w-full p-2 bg-zinc-50 flex gap-4 items-start">
				<Skeleton className={"w-[120px] aspect-video"} />
				<div className="grow flex flex-col gap-2">
					<Skeleton className={"h-6 w-full"} />
					<Skeleton className={"h-6 w-full"} />
				</div>
			</Skeleton>
			<Skeleton className="w-full p-2 bg-zinc-50 flex gap-4 items-start">
				<Skeleton className={"w-[120px] aspect-video"} />
				<div className="grow flex flex-col gap-2">
					<Skeleton className={"h-6 w-full"} />
					<Skeleton className={"h-6 w-full"} />
				</div>
			</Skeleton>
			<Skeleton className="w-full p-2 bg-zinc-50 flex gap-4 items-start">
				<Skeleton className={"w-[120px] aspect-video"} />
				<div className="grow flex flex-col gap-2">
					<Skeleton className={"h-6 w-full"} />
					<Skeleton className={"h-6 w-full"} />
				</div>
			</Skeleton>
			<Skeleton className="w-full p-2 bg-zinc-50 flex gap-4 items-start">
				<Skeleton className={"w-[120px] aspect-video"} />
				<div className="grow flex flex-col gap-2">
					<Skeleton className={"h-6 w-full"} />
					<Skeleton className={"h-6 w-full"} />
				</div>
			</Skeleton>
		</>
	);
};
