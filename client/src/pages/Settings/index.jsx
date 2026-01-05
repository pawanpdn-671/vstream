import UserLogoutModal from "@/components/settings/user-logout-modal";
import UserProfile from "@/components/settings/user-profile";
import { Button } from "@/components/shared/button";
import PageWrapper from "@/components/shared/page-wrapper";
import TitleWithLine from "@/components/shared/title-with-line";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { authApi } from "@/service/authApi";
import { useAuthStore } from "@/store/useAuthStore";
import { SETTINGS_MENU_ITEMS } from "@/utils/constants";
import { parseError } from "@/utils/parse-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SettingsPage = () => {
	const [pageName, setPageName] = useState("");
	const { user } = useAuthStore();
	const queryClient = useQueryClient();
	const location = useLocation();
	const navigate = useNavigate();
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const { mutate: logoutUser } = useMutation({
		mutationFn: authApi.logout,
		onSuccess: () => {
			toast.success("Logout successful!");
			queryClient.invalidateQueries({ queryKey: ["profile"] });
		},
		onError: (error) => {
			toast.error("Failed to Logout", {
				description: parseError(error),
			});
		},
	});

	useEffect(() => {
		if (isDesktop && location.pathname === "/settings") {
			navigate("/settings/profile", { replace: true });
		}
	}, [isDesktop, location?.pathname, navigate]);

	const visibleMenuItems = SETTINGS_MENU_ITEMS.filter((item) => user?.role === "ADMIN" || item.for === "user");

	const isSubRoute = location.pathname !== "/settings";

	return (
		<PageWrapper>
			<div className="w-full min-h-[calc(100vh-160px)]">
				<TitleWithLine title={isDesktop || !isSubRoute ? "Settings" : pageName} />
				<div className="flex flex-col md:flex-row gap-4 h-full py-5">
					<div
						className={`flex flex-col gap-2 items-center md:items-start w-full shrink-0 md:w-[300px] ${
							isSubRoute ? "hidden md:flex" : "flex"
						}`}>
						<div className="md:hidden pt-0 pb-5 xs:py-10">
							<UserProfile hiddenUpload />
						</div>
						{visibleMenuItems.map((item) => {
							return (
								<Button
									key={item.name}
									className={"justify-start min-w-full xs:min-w-[300px] md:min-w-full"}
									variant={"outline"}
									onClick={() => setPageName(item.name)}
									asChild>
									<Link to={item.path} key={item.value} className="flex items-center gap-2">
										<item.icon size={20} />
										<span>{item.name}</span>
									</Link>
								</Button>
							);
						})}
						<UserLogoutModal logoutUser={logoutUser} />
					</div>

					<div className={`flex-1 ${isSubRoute ? "block" : "hidden md:block"} md:pl-8 mdl:pl-10`}>
						{isSubRoute && (
							<Link to="/settings" className="flex items-center gap-2 mb-4 text-sm hover:underline md:hidden">
								<ArrowLeft size={16} />
								<span>Back to Settings</span>
							</Link>
						)}
						<Outlet />
					</div>
				</div>
			</div>
		</PageWrapper>
	);
};

export default SettingsPage;
