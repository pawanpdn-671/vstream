import React from "react";
import { Input } from "./shared/input";
import { Search } from "lucide-react";
import { Button } from "./shared/button";

const SearchBar = ({ handleChange, value, size = "lg", placeholder, noButton, onClick }) => {
	const sizeOptions = {
		lg: "h-[48px]",
		md: "h-[40px]",
		sm: "h-[36px]",
	};

	return (
		<div class={`p-[2px] ${sizeOptions[size]} rounded-full bg-linear-to-r from-red-300 to-orange-400`}>
			<form onSubmit={onClick} class="rounded-full h-full bg-white px-1 flex items-center">
				<input
					value={value}
					onChange={(e) => handleChange(e.target.value)}
					className={`pl-4 rounded-3xl h-[40px] border-none outline-none text-sm flex-1`}
					placeholder={placeholder}
				/>
				{!noButton && (
					<Button type="submit" size={"icon"} className={"rounded-full"}>
						<Search size={16} />
					</Button>
				)}
			</form>
		</div>
	);
};

export default SearchBar;
