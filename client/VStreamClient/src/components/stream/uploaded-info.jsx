import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../shared/avatar";
import { Button } from "../shared/button";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { movieApi } from "@/service/movieApi";
import { getInitials } from "@/lib/utils";

const UploadedInfo = ({ imdbId, movieId, movie }) => {
	const { user, getProfileUrl } = useAuthStore();
	const { mutate: toggleLikeDislike, isPending } = useMutation({
		mutationFn: movieApi.toggleLikeDislike,
	});
	const queryClient = useQueryClient();
	const uploadedUserExists =
		movie?.uploaded_by && Object.values(movie?.uploaded_by).every((value) => value.trim() !== "");
	const fallbackInitials = uploadedUserExists
		? getInitials(movie.uploaded_by?.first_name, movie.uploaded_by?.last_name)
		: "A";

	const uploadedUserProfile = uploadedUserExists ? getProfileUrl(movie?.uploaded_by?.user_id) : "";
	const uploadedUserName = uploadedUserExists
		? `${movie.uploaded_by?.first_name} ${movie.uploaded_by?.last_name}`
		: `Admin`;

	const isLiked = user?.liked_movies?.includes(movieId) ?? false;
	const isDisliked = user?.disliked_movies?.includes(movieId) ?? false;

	const handleLikeDislike = (action) => {
		toggleLikeDislike(
			{ id: imdbId, action },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["movie", imdbId] });
					queryClient.invalidateQueries({ queryKey: ["profile"] });
				},
			},
		);
	};

	return (
		<div className="flex justify-between gap-5 border rounded-md p-2 sm:p-3 shadow-xs">
			<div className="flex gap-2  sm:gap-4 items-center">
				<Avatar className={"cursor-pointer w-[40px] h-[40px] sm:h-[50px] sm:w-[50px]"}>
					<AvatarImage src={uploadedUserProfile} alt="user" />
					<AvatarFallback>{fallbackInitials}</AvatarFallback>
				</Avatar>
				<div className="flex flex-col gap-0.5">
					<span className="text-[10px] sm:text-xs text-muted-foreground">Uploaded By</span>
					<span className="text-xs sm:text-sm font-medium">{uploadedUserName}</span>
				</div>
			</div>
			<div className="flex items-center gap-2">
				<div className="flex items-center flex-col relative">
					<Button
						variant="ghost"
						className={"p-1! h-auto w-auto gap-1 sm:gap-2"}
						onClick={() => handleLikeDislike("like")}>
						<ThumbsUp
							size={20}
							className={`w-[14px]! h-[14px]! xs:w-[16px]! xs:h-[16px]! ${
								isLiked ? "fill-orange-400 text-red-500" : "fill-none"
							}`}
						/>
						<span className="text-xs xs:text-sm">Like</span>
					</Button>
					{movie?.likes && movie?.likes > 0 ? (
						<span className="text-muted-foreground absolute left-1/2 -translate-x-1/2 bottom-5 sm:bottom-full text-xs font-semibold">
							{movie?.likes}
						</span>
					) : null}
				</div>
				<div className="flex gap-2 items-center relative">
					<Button
						variant="ghost"
						className={"p-1! h-auto w-auto gap-1 sm:gap-2"}
						onClick={() => handleLikeDislike("dislike")}>
						<ThumbsDown
							size={20}
							className={`w-[14px]! h-[14px]! xs:w-[16px]! xs:h-[16px]! ${
								isDisliked ? "fill-orange-400 text-red-500" : "fill-none"
							}`}
						/>
						<span className="text-xs xs:text-sm">Dislike</span>
					</Button>
					{movie?.dislikes && movie?.dislikes > 0 ? (
						<span className="text-muted-foreground absolute left-1/2 -translate-x-1/2 bottom-5 sm:bottom-full text-xs font-semibold">
							{movie?.dislikes}
						</span>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default UploadedInfo;
