import { Route, Routes } from "react-router-dom";
import PrivateRoute from "./routes/private-route";
import { adminRoutes, privateRoutes, publicRoutes } from "./routes/router";
import PrivateLayout from "./layouts/private-layout";
import React, { Suspense } from "react";
import FallbackComponent from "./components/fallback-component";
import NotFoundPage from "./pages/not-found";
import ScrollToTop from "./components/ScrollToTop";
import AdminRoute from "./routes/admin-route";

const renderRoutes = (routes) =>
	routes.map(({ path, component: Component, children, index }, i) => {
		if (index) {
			return (
				<Route
					key={i}
					index
					element={
						<Suspense fallback={<FallbackComponent />}>
							<Component />
						</Suspense>
					}
				/>
			);
		}
		return (
			<Route
				key={i}
				path={path}
				element={
					<Suspense fallback={<FallbackComponent />}>
						<Component />
					</Suspense>
				}>
				{children && renderRoutes(children)}
			</Route>
		);
	});

export const ProtectedAdminRouteWrapper = ({ Component }) => (
	<AdminRoute>
		<Suspense fallback={<FallbackComponent />}>
			<Component />
		</Suspense>
	</AdminRoute>
);

function App() {
	return (
		<Suspense fallback={<FallbackComponent />}>
			<ScrollToTop />
			<Routes>
				{renderRoutes(publicRoutes)}

				<Route element={<PrivateRoute />}>
					<Route element={<PrivateLayout />}>{renderRoutes(privateRoutes)}</Route>
				</Route>

				<Route element={<AdminRoute />}>
					<Route element={<PrivateLayout />}>{renderRoutes(adminRoutes)}</Route>
				</Route>
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</Suspense>
	);
}

export default App;
