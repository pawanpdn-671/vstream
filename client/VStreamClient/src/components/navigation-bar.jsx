import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ProfileMenu from "./profile";
import SearchBar from "./search-bar";
import LogoText from "./shared/logo-text";
import { useMovieStore } from "@/store/useMovieStore";
import { EXCLUDE_SEARCHBAR_ROUTES } from "@/utils/constants";

const NavigationBar = () => {
	const [isScrolled, setIsScrolled] = useState(false);
	const { setSearchQuery } = useMovieStore();
	const location = useLocation();
	const isExcludeSearchbarRoute = EXCLUDE_SEARCHBAR_ROUTES.some((route) => location.pathname?.includes(route));

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 0);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div className={`fixed z-50 w-full`}>
			<div className="max-w-7xl top-0 mx-auto px-5 pt-2">
				<div
					className={`flex items-center justify-between transition-all duration-300
				${
					isScrolled
						? "rounded-full bg-background/90 backdrop-blur-sm shadow-md py-2 px-5"
						: "rounded-none bg-background py-4"
				}`}>
					<LogoText size="md" textSize="md" />

					{!isExcludeSearchbarRoute && (
						<div className="w-[400px] ml-auto">
							<SearchBar handleSearch={setSearchQuery} placeholder="Search Movie..." />
						</div>
					)}

					<div className="ml-[50px] flex gap-4 items-center">
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
		</div>
	);
};

export default NavigationBar;
