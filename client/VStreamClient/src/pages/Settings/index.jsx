import { Button } from "@/components/shared/button";
import PageWrapper from "@/components/shared/page-wrapper";
import TitleWithLine from "@/components/shared/title-with-line";
import { authApi } from "@/service/authApi";
import { userApi } from "@/service/userApi";
import { SETTINGS_MENU_ITEMS } from "@/utils/constants";
import { parseError } from "@/utils/parse-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { toast } from "sonner";

const SettingsPage = () => {
	const queryClient = useQueryClient();
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

	return (
		<PageWrapper>
			<div className="w-full h-[calc(100vh-160px)]">
				<TitleWithLine title="Settings" />
				<div className="flex gap-4 h-full py-5">
					<div className="flex flex-col gap-2 shrink-0 w-[300px]">
						{SETTINGS_MENU_ITEMS.map((item) => (
							<Button key={item.name} className={"justify-start"} variant={"outline"} asChild>
								<Link to={item.path} key={item.value} className="flex items-center gap-2">
									<item.icon size={20} />
									<span>{item.name}</span>
								</Link>
							</Button>
						))}
						<Button className={"justify-start"} variant="outline" onClick={logoutUser}>
							<LogOut size={20} />
							Logout
						</Button>
					</div>
					<div className="flex-1 pl-10 pb-20">
						<Outlet />
					</div>
				</div>
			</div>
		</PageWrapper>
	);
};

export default SettingsPage;
