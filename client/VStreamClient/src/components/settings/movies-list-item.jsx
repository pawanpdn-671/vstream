import React, { useState } from "react";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "../shared/item";
import { Button } from "../shared/button";
import { SquarePen, Trash } from "lucide-react";
import { useAddUpdateMovie } from "@/hooks/movies/useAddUpdateMovie";
import UpdateMovieFields from "./update-movie-fields";
import { toSnakeCase } from "@/utils/case-convert";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const MoviesListItem = ({ movie }) => {
	const [updateMovie, setUpdateMovie] = useState(false);
	const queryClient = useQueryClient();
	const { movieHandler, isPending } = useAddUpdateMovie("update");

	const handleSubmit = (data) => {
		const { ranking, admin_review, genre, ...rest } = data;
		const payload = toSnakeCase(rest);
		movieHandler(
			{ payload, id: movie.imdb_id },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["manage-movies-list"] });
					setUpdateMovie(false);
				},
				onError: () => {
					toast.error("Failed to update movie!");
				},
			},
		);
	};

	return (
		<>
			<Item variant="outline" key={movie._id} className="shadow-sm items-start">
				<ItemContent>
					<div className="flex gap-4">
						<img src={movie.poster_path} className="h-[120px]" alt={movie.title} />
						<div>
							<ItemTitle className={"text-gradient text-lg"}>{movie.title}</ItemTitle>
							<ItemDescription className="line-clamp-2 mt-2">{movie?.plot}</ItemDescription>
						</div>
					</div>
				</ItemContent>
				<ItemActions>
					<Button variant="outline" size="icon" onClick={() => setUpdateMovie(true)}>
						<SquarePen className="text-green-600" />
					</Button>
					<Button variant="outline" size="icon">
						<Trash className="text-destructive" />
					</Button>
				</ItemActions>
				{updateMovie && (
					<UpdateMovieFields
						movie={movie}
						onCancel={() => setUpdateMovie(false)}
						onSubmit={handleSubmit}
						isLoading={isPending}
					/>
				)}
			</Item>
		</>
	);
};

export default MoviesListItem;
