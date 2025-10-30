import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProfileMenu from "./profile";
import SearchBar from "./search-bar";
import LogoText from "./shared/logo-text";
import { useMovieStore } from "@/store/useMovieStore";

const NavigationBar = () => {
	const [isScrolled, setIsScrolled] = useState(false);
	const { searchQuery, setSearchQuery } = useMovieStore();

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 0);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handleSubmit = (e) => {
		e.preventDefault();
	};

	return (
		<div className={`max-w-7xl sticky top-0 z-50 mx-auto px-5 pt-2`}>
			<div
				className={`flex items-center justify-between transition-all duration-300
				${
					isScrolled
						? "rounded-full bg-background/90 backdrop-blur-sm shadow-md py-2 px-5"
						: "rounded-none bg-background py-4"
				}`}>
				<LogoText size="md" textSize="md" />

				<div className="w-[500px] ml-auto">
					<SearchBar
						handleChange={setSearchQuery}
						value={searchQuery}
						placeholder="Search Movie..."
						onClick={handleSubmit}
					/>
				</div>

				<div className="ml-[50px] flex gap-4">
					<Link to="/home" className="text-sm text-gradient">
						Home
					</Link>

					<Link to="/recommended-movies" className="text-sm text-gradient">
						Recommended Movies
					</Link>

					<Link to="/recommended-movies" className="text-sm text-gradient">
						Get Movie
					</Link>
					<ProfileMenu />
				</div>
			</div>
		</div>
	);
};

export default NavigationBar;
