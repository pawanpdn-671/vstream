import { Button } from "@/components/shared/button";
import LogoText from "../shared/logo-text";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

export function Header() {
	const { isAuthenticated } = useAuthStore();

	return (
		<header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
				<LogoText size="lg" />

				<nav className="hidden md:flex items-center gap-8">
					<a href="#features" className="text-sm text-gradient transition-colors">
						Features
					</a>
					<a href="#ai" className="text-sm text-gradient transition-colors">
						AI Ranking
					</a>
					<a href="#testimonials" className="text-sm text-gradient transition-colors">
						Reviews
					</a>
				</nav>

				<div className="flex items-center gap-3">
					{!isAuthenticated && (
						<Button variant="ghost" className="text-sm">
							<Link to="/login">Sign In</Link>
						</Button>
					)}
					<Button>
						<Link to={isAuthenticated ? "/home" : "/register"}>
							{isAuthenticated ? "Go to Movie Library" : "Get Started"}
						</Link>
					</Button>
				</div>
			</div>
		</header>
	);
}
