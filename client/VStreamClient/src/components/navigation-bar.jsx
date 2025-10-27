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
						? "rounded-full bg-background/80 backdrop-blur-lg shadow-md py-2 px-5"
						: "rounded-none bg-background py-4"
				}`}>
				<LogoText size="md" textSize="md" />
				<NavigationMenu>
					<NavigationMenuList className="flex-wrap">
						<NavigationMenuItem>
							<NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
								<Link to="/home">Home</Link>
							</NavigationMenuLink>
						</NavigationMenuItem>
						<NavigationMenuItem>
							<NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
								<Link to="/docs">Docs</Link>
							</NavigationMenuLink>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>
			</div>
		</div>
	);
};

export default NavigationBar;
