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
		component: lazy(() => import("@/pages/Register")),
	},
];

export const privateRoutes = [
	{
		path: "/home",
		component: lazy(() => import("@/pages/Home")),
	},
];
