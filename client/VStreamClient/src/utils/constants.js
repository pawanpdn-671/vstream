import { Clapperboard, LayoutDashboard, MessageSquareText, TriangleAlert, UserRoundCog } from "lucide-react";

export const APP_EMPTY_MESSAGES = {
	MOVIES: {
		TITLE: "No Movies Found",
		ICON: Clapperboard,
		DESCRIPTION: "Opps, It seems like there are no movies. Get started by creating your own movie.",
	},
	GROQ_RESPONSE: {
		TITLE: "No Movie Exist with the Story Provided",
		ICON: Clapperboard,
	},
	REVIEWS: {
		TITLE: "No Reviews Yet",
		DESCRIPTION: "Be the first one to add a review.",
		ICON: MessageSquareText,
	},
};

export const APP_ERROR_MESSAGES = {
	MOVIES: {
		TITLE: "Failed to get your movies!",
		ICON: TriangleAlert,
	},
	MOVIE: {
		TITLE: "Failed to get your movie!",
		ICON: TriangleAlert,
	},
	GROQ_RESPONSE: {
		TITLE: "Failed to get the movies. Please try again.",
		ICON: TriangleAlert,
	},
};

export const PAGE_TITLE = {
	BOOKMARK: "Bookmarked Movies",
	GET_MOVIE: "Get Movies With Text Prompt",
};

export const DEFAULT_ROLE = "USER";
export const ADMIN_ROLE = "ADMIN";
export const FETCH_MOVIE_LIMIT = 10;

export const MENU_ELEMENTS = [
	{
		title: "Alert Dialog",
		href: "/docs/primitives/alert-dialog",
		description: "A modal dialog that interrupts the user with important content and expects a response.",
	},
	{
		title: "Hover Card",
		href: "/docs/primitives/hover-card",
		description: "For sighted users to preview content available behind a link.",
	},
	{
		title: "Progress",
		href: "/docs/primitives/progress",
		description:
			"Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
	},
	{
		title: "Scroll-area",
		href: "/docs/primitives/scroll-area",
		description: "Visually or semantically separates content.",
	},
	{
		title: "Tabs",
		href: "/docs/primitives/tabs",
		description: "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
	},
	{
		title: "Tooltip",
		href: "/docs/primitives/tooltip",
		description:
			"A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
	},
];

export const SETTINGS_MENU_ITEMS = [
	{
		name: "Profile",
		value: "profile",
		icon: UserRoundCog,
		path: "/settings",
		for: "user",
	},
	{
		name: "Manage Movies",
		value: "manage_movies",
		icon: LayoutDashboard,
		path: "/settings/manage-movies",
		for: "admin",
	},
];

export const EXCLUDE_SEARCHBAR_ROUTES = ["/settings", "/stream"];

export const MODAL_TITLE_INFO = {
	MOVIE: {
		DELETE: {
			TITLE: "Delete Movie",
			DESCRIPTION: "Are you sure you want to Delete the Movie?",
		},
	},
};
