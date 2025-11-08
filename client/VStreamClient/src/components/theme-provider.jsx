import { useAuthStore } from "@/store/useAuthStore";
import { createContext, useEffect, useState } from "react";

const ThemeProviderContext = createContext({
	theme: "light",
	setTheme: () => null,
});

export function ThemeProvider({ children, defaultTheme = "light", storageKey = "vstream-ui-theme-mode", ...props }) {
	const [theme, setTheme] = useState(() => {
		return localStorage.getItem(storageKey) || defaultTheme;
	});
	const { isAuthenticated } = useAuthStore();

	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.remove("light", "dark");

		root.classList.add(isAuthenticated ? theme : "light");
	}, [theme, isAuthenticated]);

	const value = {
		theme,
		setTheme: (theme) => {
			localStorage.setItem(storageKey, theme);
			setTheme(theme);
		},
	};

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export { ThemeProviderContext };
