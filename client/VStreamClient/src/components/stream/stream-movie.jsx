import React from "react";
import ReactPlayer from "react-player";
import GradientBorder from "../shared/gradient-border";

const StreamMovie = ({ movie }) => {
	const { title, plot, genre, admin_review, ranking } = movie;

	return (
		<div className="flex gap-10">
			<div className="aspect-video overflow-hidden rounded-md flex-1">
				<ReactPlayer
					url={`https://www.youtube.com/watch?v=${movie.youtube_id}`}
					width="100%"
					height="100%"
					playing={false}
					controls
				/>
			</div>
			<div className="w-[400px] flex flex-col gap-4">
				<GradientBorder radius={"rounded-sm"}>
					<div className={"flex flex-col gap-2 p-4"}>
						<h3 className={"text-xl font-bold text-gradient"}>{title}</h3>
						<p className="text-sm leading-6 text-muted-foreground">{plot}</p>
					</div>
				</GradientBorder>
				<GradientBorder radius={"rounded-sm"}>
					<div className={"flex flex-col gap-2 p-4"}>
						<h3 className={"text-md text-gradient"}>What Does The Admin Say About This Movie?</h3>
						<p className="text-sm leading-6 text-muted-foreground">{admin_review}</p>
					</div>
				</GradientBorder>
			</div>
		</div>
	);
};

export default StreamMovie;
