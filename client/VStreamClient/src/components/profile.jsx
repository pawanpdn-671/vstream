import React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./shared/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./shared/avatar";
import { useNavigate } from "react-router-dom";
import { Button } from "./shared/button";
import { useAuthStore } from "@/store/useAuthStore";
import { getInitials } from "@/lib/utils";

const ProfileMenu = () => {
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const fallbackInitials = getInitials(user?.first_name, user?.last_name);
	const profileURL = `${import.meta.env.VITE_API_BASE_URL}/users/${user?.user_id}/avatar`;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Avatar className={"cursor-pointer h-[40px] w-[40px]"}>
					<AvatarImage src={profileURL} alt="@shadcn" />
					<AvatarFallback>{fallbackInitials}</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuGroup>
					<DropdownMenuItem onSelect={() => navigate("/settings")}>Settings</DropdownMenuItem>
					<DropdownMenuItem>Logout</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ProfileMenu;
