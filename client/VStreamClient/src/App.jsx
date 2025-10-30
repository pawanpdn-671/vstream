import { Route, Routes } from "react-router-dom";
import PrivateRoute from "./routes/private-route";
import { adminRoutes, privateRoutes, publicRoutes } from "./routes/router";
import PrivateLayout from "./layouts/private-layout";
import { Suspense } from "react";
import FallbackComponent from "./components/fallback-component";
import NotFoundPage from "./pages/not-found";
import ScrollToTop from "./components/ScrollToTop";
import AdminRoute from "./routes/admin-route";

function App() {
	return (
		<Suspense fallback={<FallbackComponent />}>
			<ScrollToTop />
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
				<Route element={<AdminRoute />}>
					<Route element={<PrivateLayout />}>
						{adminRoutes.map(({ path, component: Page }) => (
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
