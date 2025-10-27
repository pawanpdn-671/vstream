import { Route, Routes } from "react-router-dom";
import PrivateRoute from "./routes/private-route";
import { privateRoutes, publicRoutes } from "./routes/router";
import PrivateLayout from "./layouts/private-layout";
import { Suspense } from "react";
import FallbackComponent from "./components/fallback-component";
import NotFoundPage from "./pages/not-found";

function App() {
	return (
		<Suspense fallback={<FallbackComponent />}>
			<Routes>
				{/* Public Routes */}
				{publicRoutes.map(({ path, component: Page }) => (
					<Route key={path} path={path} element={<Page />} />
				))}

				{/* Private Routes (wrapped in PrivateRoute) */}
				<Route element={<PrivateRoute />}>
					<Route element={<PrivateLayout />}>
						{privateRoutes.map(({ path, component: Page }) => (
							<Route key={path} path={path} element={<Page />} />
						))}
					</Route>
				</Route>

				{/* 404 fallback */}
				<Route path={"*"} element={<NotFoundPage />} />
			</Routes>
		</Suspense>
	);
}

export default App;
