import React, { createContext, useState, useContext, useEffect } from "react";
import api from "@/config/axiosConfig";
import { useProfile } from "@/hooks/auth/useProfile";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const { user, isLoading, isError, errorMessage } = useProfile();
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const logout = async () => {
		await api.post("/logout");
		setUser(null);
	};

	useEffect(() => {
		if (user && Object.keys(user)?.length) {
			setIsAuthenticated(true);
		}
	}, [user]);

	return <AuthContext.Provider value={{ user, logout, isLoading, isAuthenticated }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
