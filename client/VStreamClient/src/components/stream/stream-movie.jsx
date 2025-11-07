import ReactPlayer from "react-player";
import GradientBorder from "../shared/gradient-border";
import MovieReviews from "./reviews";
import UploadedInfo from "./uploaded-info";

const StreamMovie = ({ movie, reviews }) => {
	const { title, plot } = movie;

	return (
		<div className="flex gap-10">
			<div className="flex-1 flex flex-col">
				<div className="aspect-video overflow-hidden rounded-md flex-1">
					<ReactPlayer
						url={`https://www.youtube.com/watch?v=${movie.youtube_id}`}
						width="100%"
						height="100%"
						playing={false}
						controls
					/>
				</div>
				<div className="mt-8">
					<UploadedInfo imdbId={movie?.imdb_id} movieId={movie?._id} movie={movie} />
				</div>
				<div>
					<MovieReviews imdbId={movie?.imdb_id} reviews={reviews} />
				</div>
			</div>
			<div className="w-[400px] flex flex-col gap-4">
				<GradientBorder radius={"rounded-sm"}>
					<div className={"flex flex-col gap-2 p-4"}>
						<h3 className={"text-xl font-bold text-gradient"}>{title}</h3>
						<p className="text-sm leading-6 text-muted-foreground">{plot}</p>
					</div>
				</GradientBorder>
			</div>
		</div>
	);
};

export default StreamMovie;
