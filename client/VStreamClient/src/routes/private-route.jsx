import FallbackComponent from "@/components/fallback-component";
import { useAuthStore } from "@/store/useAuthStore";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
	const { isLoading, isAuthenticated, hasFetchedProfile } = useAuthStore();

	if (isLoading || !hasFetchedProfile) return <FallbackComponent />;
	return isAuthenticated ? <Outlet /> : <Navigate to={"/login"} replace />;
};

export default PrivateRoute;
