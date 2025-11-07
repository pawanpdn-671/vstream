import { formatDistanceToNowStrict } from "date-fns";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../shared/avatar";
import { getInitials } from "@/lib/utils";

const ReviewItem = ({ review }) => {
	const reviewerAvatar = `${import.meta.env.VITE_API_BASE_URL}/users/${review?.user?.user_id}/avatar`;
	const reviewerName = `${review?.user?.first_name} ${review?.user?.last_name}`;
	const timeAgo = review?.created_at
		? formatDistanceToNowStrict(new Date(review.created_at), { addSuffix: true })
		: "";
	const fallbackInitials = getInitials(review?.user?.first_name, review?.user?.last_name);

	const renderStars = (rating) => {
		return (
			<div className="flex">
				{[1, 2, 3, 4, 5].map((star) => (
					<svg
						key={star}
						className={`w-4 h-4 ${star <= rating ? "text-yellow-400" : "text-muted-foreground/50"}`}
						fill="currentColor"
						viewBox="0 0 20 20">
						<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
					</svg>
				))}
			</div>
		);
	};

	return (
		<div className="flex gap-4 py-4">
			<div className="shrink-0">
				<Avatar className={"cursor-pointer h-[40px] w-[40px]"}>
					<AvatarImage src={reviewerAvatar} alt="user" />
					<AvatarFallback>{fallbackInitials}</AvatarFallback>
				</Avatar>
			</div>

			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					<span className="font-medium text-sm">{reviewerName}</span>
					<span className="text-xs text-muted-foreground">{timeAgo}</span>
				</div>

				<div className="mb-2">{renderStars(review?.rating)}</div>

				<p className="text-sm whitespace-pre-wrap wrap-break-word">{review?.comment}</p>
			</div>
		</div>
	);
};

export default ReviewItem;
