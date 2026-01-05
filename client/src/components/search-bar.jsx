import { ListFilter, RotateCw, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "./shared/button";
import GradientBorder from "./shared/gradient-border";
import { Popover, PopoverContent, PopoverTrigger } from "./shared/popover";
import { useGenres } from "@/hooks/movies/useGenres";
import { Label } from "./shared/label";
import { Checkbox } from "./shared/checkbox";
import { Separator } from "./shared/separator";

const SearchBar = ({ handleSearch, placeholder, noButton, handleGenre, isScrolled }) => {
	const [localQuery, setLocalQuery] = useState("");
	const [selectedGenres, setSelectedGenres] = useState([]);
	const [open, setOpen] = useState(false);
	const { genres, isLoading } = useGenres();

	const handleSubmit = (e) => {
		e.preventDefault();
		handleSearch(localQuery);
	};
	const handleGenreSearch = (e, action) => {
		e.preventDefault();
		if (action && action === "reset") {
			handleGenre([]);
			setSelectedGenres([]);
		} else handleGenre(selectedGenres);

		setOpen(false);
	};

	return (
		<GradientBorder radius="rounded-full">
			<form onSubmit={handleSubmit} className="h-max flex items-center">
				<input
					id="search-movies"
					value={localQuery}
					onChange={(e) => setLocalQuery(e.target.value)}
					className={`pl-3 rounded-3xl border-none outline-none text-sm w-full`}
					placeholder={placeholder}
				/>
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button variant="ghost" size="icon" className={"p-1 h-auto mr-1"}>
							<ListFilter size={16} />
						</Button>
					</PopoverTrigger>
					<PopoverContent
						align="end"
						sideOffset={10}
						alignOffset={-86}
						className={`w-[90vw] sm:w-[500px] ${isScrolled ? "bg-background/90 backdrop-blur-sm" : ""}`}>
						<div>
							<h4 className="text-xs sm:text-sm md:text-base font-medium pb-2 text-muted-foreground">
								Search Movie By Genre
							</h4>
							<Separator />
							<div className="py-3 flex flex-wrap gap-3 md:gap-3.5 lg:gap-4 max-h-[50vh] overflow-y-auto ">
								{genres?.map((genre) => {
									const checked = selectedGenres?.includes(genre.genre_name);
									return (
										<Label
											key={genre.genre_id}
											className="text-xs sm:text-sm flex items-center gap-1.5 md:gap-2 cursor-pointer">
											<Checkbox
												checked={checked}
												className={"size-3.5 md:size-4"}
												onCheckedChange={(isChecked) => {
													if (isChecked) {
														setSelectedGenres((prev) => [...prev, genre.genre_name]);
													} else {
														setSelectedGenres((prev) =>
															prev?.filter((name) => name !== genre.genre_name),
														);
													}
												}}
											/>
											<span>{genre.genre_name}</span>
										</Label>
									);
								})}
							</div>
							<Separator />
							<div className="mt-3 flex justify-end gap-2">
								<Button variant={"ghost"} size="sm" onClick={(e) => handleGenreSearch(e, "reset")}>
									<RotateCw size={16} />
									Reset
								</Button>
								<Button size="sm" onClick={handleGenreSearch}>
									<Search size={16} />
									Search
								</Button>
							</div>
						</div>
					</PopoverContent>
				</Popover>
				{!noButton && (
					<Button type="submit" size={"icon"} className={"rounded-full"}>
						<Search size={16} />
					</Button>
				)}
			</form>
		</GradientBorder>
	);
};

export default SearchBar;
