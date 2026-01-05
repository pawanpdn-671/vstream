import { Button } from "@/components/shared/button";
import { AlertTriangle } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-red-200 to-orange-200 px-6">
			<div className="text-center">
				<div className="flex justify-center mb-6">
					<div className="bg-white/20 p-6 rounded-full backdrop-blur-md">
						<AlertTriangle size={64} className="text-destructive" />
					</div>
				</div>

				<h1 className="text-6xl font-bold mb-2">404</h1>
				<p className="text-xl mb-6">Oops! The page you’re looking for doesn’t exist.</p>

				<Button>
					<Link to="/home">Go Home</Link>
				</Button>
			</div>

			<footer className="absolute bottom-4 text-sm text-primary">&copy; {new Date().getFullYear()} VStream</footer>
		</div>
	);
};

export default NotFoundPage;
