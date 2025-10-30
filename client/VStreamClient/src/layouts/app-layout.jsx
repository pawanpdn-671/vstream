import { useEffect } from "react";
import { useProfile } from "@/hooks/auth/useProfile";
import { useAuthStore } from "@/store/useAuthStore";

const AppLayout = ({ children }) => {
	const { user, isLoading, isError } = useProfile();
	const { setUser, setLoading } = useAuthStore();

	useEffect(() => {
		setLoading(isLoading);

		if (isError) {
			setUser(null);
		} else if (!isLoading) {
			setUser(user ?? null);
		}
	}, [user, isError, isLoading, setUser, setLoading]);

	return <>{children}</>;
};

export default AppLayout;
