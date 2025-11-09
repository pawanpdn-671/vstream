import FloatingMovieChat from "@/components/movie-expert/floating-helper";
import NavigationBar from "@/components/navigation-bar";
import React from "react";
import { Outlet } from "react-router-dom";

const PrivateLayout = () => {
	return (
		<>
			<NavigationBar />
			<main>
				<Outlet />
				<FloatingMovieChat />
			</main>
		</>
	);
};

export default PrivateLayout;
