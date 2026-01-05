import FallbackComponent from "@/components/fallback-component";
import { useAuthStore } from "@/store/useAuthStore";
import { ADMIN_ROLE } from "@/utils/constants";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = ({ children }) => {
	const { isLoading, isAuthenticated, hasFetchedProfile, user } = useAuthStore();

	if (isLoading || !hasFetchedProfile) return <FallbackComponent />;
	if (!isAuthenticated || user?.role !== ADMIN_ROLE) {
		return <Navigate to={"/login"} replace />;
	}

	return children;
};

export default AdminRoute;
