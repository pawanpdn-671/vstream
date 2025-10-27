import NavigationBar from "@/components/navigation-bar";
import React from "react";
import { Outlet } from "react-router-dom";

const PrivateLayout = () => {
	return (
		<>
			<NavigationBar />
			<main>
				<Outlet />
			</main>
		</>
	);
};

export default PrivateLayout;
