import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "./shared/button";
import GradientBorder from "./shared/gradient-border";

const SearchBar = ({ handleSearch, placeholder, noButton }) => {
	const [localQuery, setLocalQuery] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		handleSearch(localQuery);
	};

	return (
		<GradientBorder radius="rounded-full">
			<form onSubmit={handleSubmit} className="h-max flex items-center">
				<input
					value={localQuery}
					onChange={(e) => setLocalQuery(e.target.value)}
					className={`pl-3 rounded-3xl border-none outline-none text-sm flex-1`}
					placeholder={placeholder}
				/>
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
