import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../shared/avatar";
import { useAuthStore } from "@/store/useAuthStore";
import { getInitials } from "@/lib/utils";
import { ImagePlus } from "lucide-react";

const UserProfile = () => {
	const { user } = useAuthStore();
	const fallbackInitials = getInitials(user?.first_name, user?.last_name);

	return (
		<div className="w-max relative">
			<Avatar className={"cursor-pointer w-[100px] h-[100px]"}>
				<AvatarImage src="https://gi" alt="@shadcn" />
				<AvatarFallback className={"text-xl font-semibold"}>{fallbackInitials}</AvatarFallback>
			</Avatar>
			<ImagePlus size={24} className="absolute top-0 right-0 cursor-pointer bg-background" color={"red"} />
		</div>
	);
};

export default UserProfile;
