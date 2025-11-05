import React from "react";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "../shared/item";
import { Button } from "../shared/button";
import { SquarePen, Trash } from "lucide-react";

const MoviesListItem = ({ movie }) => {
	return (
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
				<Button variant="outline" size="icon">
					<SquarePen className="text-green-600" />
				</Button>
				<Button variant="outline" size="icon">
					<Trash className="text-destructive" />
				</Button>
			</ItemActions>
		</Item>
	);
};

export default MoviesListItem;
