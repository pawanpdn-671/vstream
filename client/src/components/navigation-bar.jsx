import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ProfileMenu from "./profile";
import SearchBar from "./search-bar";
import LogoText from "./shared/logo-text";
import { useMovieStore } from "@/store/useMovieStore";
import { INCLUDE_SEARCHBAR_ROUTES } from "@/utils/constants";

const NavigationBar = () => {
	const [isScrolled, setIsScrolled] = useState(false);
	const { setSearchQuery, setSearchByGenre } = useMovieStore();
	const location = useLocation();
	const shouldSearchBarInclude = INCLUDE_SEARCHBAR_ROUTES.some((route) => location.pathname?.includes(route));

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 0);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div className={`fixed z-50 w-full ${isScrolled ? "bg-transparent" : "bg-background"}`}>
			<div className="max-w-7xl top-0 mx-auto px-4 xs:px-5 pt-2">
				<div
					className={`flex items-center justify-between transition-all duration-300
				${
					isScrolled
						? "rounded-full bg-background/90 backdrop-blur-sm shadow-md py-2 px-3"
						: "rounded-none bg-background py-4"
				}`}>
					<Link to="/home">
						<LogoText size="md" textSize="md" noTextInMobile />
					</Link>

					{shouldSearchBarInclude && (
						<div className="w-full max-w-[400px] ml-2 sm:ml-auto shrink">
							<SearchBar
								handleSearch={setSearchQuery}
								handleGenre={setSearchByGenre}
								placeholder="Search Movie..."
								isScrolled={isScrolled}
							/>
						</div>
					)}

					<div className="ml-[12px] md:ml-[30px] lg:ml-[50px] flex gap-4 items-center">
						<Link to="/home" className="hidden lg:inline-block text-sm text-gradient">
							Home
						</Link>

						<Link to="/recommended-movies" className="hidden lg:inline-block text-sm text-gradient">
							Recommended Movies
						</Link>

						<Link to="/get-your-movie" className="hidden lg:inline-block text-sm text-gradient">
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
