import FallbackComponent from "@/components/fallback-component";
import { useAuth } from "@/context/AuthContext";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) return <FallbackComponent />;
	return isAuthenticated ? <Outlet /> : <Navigate to={"/login"} replace />;
};

export default PrivateRoute;
