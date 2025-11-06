import { useTheme } from "@/hooks/useTheme";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { Bookmark, Moon, Settings, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./shared/avatar";
import { Button } from "./shared/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./shared/dropdown-menu";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";

const ProfileMenu = () => {
	const { theme, setTheme } = useTheme();
	const { user } = useAuthStore();
	const fallbackInitials = getInitials(user?.first_name, user?.last_name);
	const profileURL = `${import.meta.env.VITE_API_BASE_URL}/users/${user?.user_id}/avatar`;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Avatar className={"cursor-pointer h-[40px] w-[40px]"}>
					<AvatarImage src={profileURL} alt="user" />
					<AvatarFallback>{fallbackInitials}</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" alignOffset={20} sideOffset={0} className={"min-w-[200px]"}>
				<div className="flex flex-col py-2">
					<DropdownMenuItem asChild>
						<Link to="/settings">
							<Button variant="ghost" className={"w-full justify-start"}>
								<Settings />
								Settings
							</Button>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link to="/bookmarked-movies">
							<Button variant="ghost" className={"w-full justify-start"}>
								<Bookmark />
								Bookmarked Movies
							</Button>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Button
							variant="ghost"
							className={"justify-start w-full"}
							onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
							<Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
							<Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
							Toggle Theme
						</Button>
					</DropdownMenuItem>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ProfileMenu;
