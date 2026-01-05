import FallbackComponent from "@/components/fallback-component";
import AdminRoute from "@/routes/admin-route";
import { Suspense } from "react";

export const ProtectedAdminRouteWrapper = (LazyComponent) => {
	return () => (
		<AdminRoute>
			<Suspense fallback={<FallbackComponent type="component" />}>
				<LazyComponent />
			</Suspense>
		</AdminRoute>
	);
};
