import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../shared/avatar";
import { useAuthStore } from "@/store/useAuthStore";
import { getInitials } from "@/lib/utils";
import { ImagePlus } from "lucide-react";
import UploadAvatarModal from "./upload-avatar-modal";

const UserProfile = () => {
	const [openUploadProfileModal, setOpenUploadProfileModal] = useState(false);
	const { user } = useAuthStore();
	const fallbackInitials = getInitials(user?.first_name, user?.last_name);
	const profileURL = `${import.meta.env.VITE_API_BASE_URL}/users/${user?.user_id}/avatar`;

	return (
		<div className="w-max relative">
			<Avatar className={"cursor-pointer w-[100px] h-[100px]"}>
				<AvatarImage src={profileURL} alt="user avatar" />
				<AvatarFallback className={"text-xl font-semibold"}>{fallbackInitials}</AvatarFallback>
			</Avatar>
			<ImagePlus
				onClick={() => setOpenUploadProfileModal(true)}
				size={24}
				className="absolute top-0 right-0 cursor-pointer bg-background"
				color={"red"}
			/>
			<UploadAvatarModal openModal={openUploadProfileModal} onClose={() => setOpenUploadProfileModal(false)} />
		</div>
	);
};

export default UserProfile;
