import { ProtectedAdminRouteWrapper } from "@/layouts/protected-route-wrapper";
import { lazy } from "react";

export const publicRoutes = [
	{
		path: "/",
		component: lazy(() => import("@/pages/Landing")),
	},
	{
		path: "/login",
		component: lazy(() => import("@/pages/Login")),
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
	{
		path: "/recommended-movies",
		component: lazy(() => import("@/pages/RecommendedMovies")),
	},
	{
		path: "/get-your-movie",
		component: lazy(() => import("@/pages/GetMovie")),
	},
	{
		path: "/settings",
		component: lazy(() => import("@/pages/Settings")),
		children: [
			{
				index: true,
				component: lazy(() => import("@/pages/Settings/profile")),
			},
			{
				path: "liked-movies",
				component: lazy(() => import("@/pages/Settings/liked-movies")),
			},
			{
				path: "comments",
				component: lazy(() => import("@/pages/Settings/comments")),
			},
			{
				path: "manage-movies",
				component: ProtectedAdminRouteWrapper(lazy(() => import("@/pages/Settings/manage-movies"))),
			},
		],
	},
	{
		path: "/stream/:imdb_id",
		component: lazy(() => import("@/pages/Stream")),
	},
	{
		path: "/bookmarked-movies",
		component: lazy(() => import("@/pages/Bookmark")),
	},
];

export const adminRoutes = [
	{
		path: "/review/:id",
		component: lazy(() => import("@/pages/Review")),
	},
];
