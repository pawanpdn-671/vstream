import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
			refetchOnWindowFocus: false,
			staleTime: 1000 * 60 * 5,
		},
	},
});

createRoot(document.getElementById("root")).render(
	<ThemeProvider defaultTheme="light" storageKey={import.meta.env.VITE_THEME_KEY}>
		<BrowserRouter>
			<QueryClientProvider client={queryClient}>
				<AuthProvider>
					<App />
					<Toaster position="top-right" />
				</AuthProvider>
			</QueryClientProvider>
		</BrowserRouter>
	</ThemeProvider>,
);
