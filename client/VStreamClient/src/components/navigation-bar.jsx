import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from "@/components/shared/navigation-menu";
import { Link } from "react-router-dom";
import LogoText from "./shared/logo-text";
import { useEffect, useState } from "react";
import ProfileMenu from "./profile";

const NavigationBar = () => {
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 0);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

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
				<NavigationMenu>
					<NavigationMenuList className="flex-wrap">
						<NavigationMenuItem>
							<NavigationMenuLink asChild className={`${navigationMenuTriggerStyle()} bg-transparent`}>
								<Link to="/home" className="text-gradient">
									Home
								</Link>
							</NavigationMenuLink>
						</NavigationMenuItem>
						<NavigationMenuItem>
							<NavigationMenuLink asChild className={`${navigationMenuTriggerStyle()} bg-transparent`}>
								<Link to="/recommended-movies" className="text-gradient">
									Recommended Movies
								</Link>
							</NavigationMenuLink>
							<NavigationMenuLink asChild className={`${navigationMenuTriggerStyle()} bg-transparent`}>
								<Link to="/recommended-movies" className="text-gradient">
									Get Movie
								</Link>
							</NavigationMenuLink>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>
				<ProfileMenu />
			</div>
		</div>
	);
};

export default NavigationBar;
