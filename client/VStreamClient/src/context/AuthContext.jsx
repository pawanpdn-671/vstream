import React, { createContext, useState, useContext, useEffect } from "react";
import api from "@/config/axiosConfig";
import { useProfile } from "@/hooks/auth/useProfile";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const { user, isLoading, isError, errorMessage, refetch } = useProfile();
	const isAuthenticated = !isError && user && Object.keys(user)?.length;

	const logout = async () => {
		await api.post("/logout");
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, logout, isLoading, isAuthenticated, refetch }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
