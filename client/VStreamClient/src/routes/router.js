import HomePage from "@/pages/Home";
import LandingPage from "@/pages/Landing";
import { lazy } from "react";

export const publicRoutes = [
	{
		path: "/",
		component: lazy(() => import("@/pages/Landing")),
	},
	{
		path: "/login",
		component: null,
	},
	{
		path: "/register",
		component: null,
	},
];

export const privateRoutes = [
	{
		path: "/home",
		component: lazy(() => import("@/pages/Home")),
	},
];
