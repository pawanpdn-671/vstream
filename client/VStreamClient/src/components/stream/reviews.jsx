import React, { useState } from "react";
import { Textarea } from "../shared/textarea";
import { Button } from "../shared/button";
import { Separator } from "../shared/separator";
import { Label } from "../shared/label";
import { useAddReview } from "@/hooks/review/useAddReview";
import { useAuthStore } from "@/store/useAuthStore";
import ReviewItem from "./review-item";
import { useQueryClient } from "@tanstack/react-query";

const MovieReviews = ({ reviews, imdbId }) => {
	const [reviewText, setReviewText] = useState("");
	const [writeReview, setWriteReview] = useState(false);
	const { addReviewHandler, isPending } = useAddReview();
	const queryClient = useQueryClient();
	const { user } = useAuthStore();

	const handleCancel = () => {
		setWriteReview(false);
		setReviewText("");
	};

	const handleReviewDone = () => {
		const payload = {
			comment: reviewText,
			user: {
				user_id: user.user_id,
				first_name: user.first_name,
				last_name: user.last_name,
			},
		};
		addReviewHandler(
			{ payload, id: imdbId },
			{
				onSuccess: () => {
					setWriteReview(false);
					queryClient.invalidateQueries({ queryKey: ["movie", imdbId] });
				},
			},
		);
	};

	return (
		<div className="py-10">
			<Separator className={"my-4"} />
			<div className="flex gap-5 justify-between items-center">
				<h3 className="text-xl font-semibold text-muted-foreground">Reviews</h3>
				<Button size="sm" className={"text-sm"} onClick={() => setWriteReview(true)}>
					Write Review
				</Button>
			</div>
			{writeReview && (
				<div className="mt-5 relative">
					<Label>Tell us what do you think about the movie?</Label>
					<Textarea
						className={"resize-none mt-2 min-h-24 max-h-32 pb-12"}
						value={reviewText}
						onChange={(e) => setReviewText(e.target.value)}
					/>
					<div className="flex gap-2 absolute right-0 bottom-0 p-2 pr-5 z-10">
						<Button size="sm" className={"mt-2"} onClick={handleReviewDone}>
							Done
						</Button>
						<Button size="sm" variant="secondary" className={"mt-2"} onClick={handleCancel}>
							Cancel
						</Button>
					</div>
				</div>
			)}
			<div className="mt-5">
				{reviews && reviews?.length ? (
					reviews?.map((review) => <ReviewItem key={review._id} review={review} />)
				) : (
					<></>
				)}
			</div>
		</div>
	);
};

export default MovieReviews;
