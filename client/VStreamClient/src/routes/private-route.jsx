import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
	const isAuthenticated = true;
	return isAuthenticated ? <Outlet /> : <Navigate to={"/login"} replace />;
};

export default PrivateRoute;
