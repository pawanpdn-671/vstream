import FallbackComponent from "@/components/fallback-component";
import { useAuthStore } from "@/store/useAuthStore";
import { ADMIN_ROLE } from "@/utils/constants";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
	const { isLoading, isAuthenticated, hasFetchedProfile, user } = useAuthStore();

	if (isLoading || !hasFetchedProfile) return <FallbackComponent />;
	return isAuthenticated && user?.role === ADMIN_ROLE ? <Outlet /> : <Navigate to={"/login"} replace />;
};

export default AdminRoute;
