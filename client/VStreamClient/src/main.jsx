import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 2,
			refetchOnWindowFocus: false,
			staleTime: 1000 * 60 * 5,
		},
	},
});

createRoot(document.getElementById("root")).render(
	<ThemeProvider defaultTheme="light" storageKey={import.meta.env.VITE_THEME_KEY}>
		<BrowserRouter>
			<QueryClientProvider client={queryClient}>
				<App />
			</QueryClientProvider>
		</BrowserRouter>
	</ThemeProvider>,
);
