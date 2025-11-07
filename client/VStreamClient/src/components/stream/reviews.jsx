import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "../shared/textarea";
import { Button } from "../shared/button";
import { Separator } from "../shared/separator";
import { Label } from "../shared/label";
import { useAddReview } from "@/hooks/review/useAddReview";
import { useAuthStore } from "@/store/useAuthStore";
import ReviewItem from "./review-item";
import { useQueryClient } from "@tanstack/react-query";
import { EmptyResult } from "../empty-result";
import { APP_EMPTY_MESSAGES } from "@/utils/constants";
import { useReviews } from "@/hooks/review/useReviews";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "../shared/skeleton";

const MovieReviews = ({ imdbId }) => {
	const [reviewText, setReviewText] = useState("");
	const [writeReview, setWriteReview] = useState(false);
	const { reviews, isLoading, isFetching, isError, errorMessage, fetchNextPage, hasNextPage } = useReviews(imdbId);
	const { addReviewHandler, isPending } = useAddReview();
	const { ref, inView } = useInView();
	const hasLoadedInitial = useRef(false);
	const queryClient = useQueryClient();
	const { user } = useAuthStore();

	useEffect(() => {
		if (reviews?.length > 0 && !isLoading && !hasLoadedInitial.current) {
			hasLoadedInitial.current = true;
		}
	}, [reviews, isLoading]);

	useEffect(() => {
		if (inView && hasNextPage && !isFetching && hasLoadedInitial.current) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, fetchNextPage, isFetching]);

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
					setReviewText("");
					queryClient.invalidateQueries({ queryKey: ["reviews", imdbId] });
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
						autoFocus
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
				{reviews &&
					reviews?.length > 0 &&
					reviews?.map((review) => <ReviewItem key={review._id} review={review} />)}
				{isFetching && <MovieReviews.Skeleton />}
				{!isLoading && !isFetching && reviews?.length === 0 && (
					<div className="mt-10 text-center">
						<EmptyResult
							title={APP_EMPTY_MESSAGES.REVIEWS.TITLE}
							description={APP_EMPTY_MESSAGES.REVIEWS.DESCRIPTION}
							icon={APP_EMPTY_MESSAGES.REVIEWS.ICON}
							iconColor={"muted-foreground"}
							noAction
						/>
					</div>
				)}
				{!isFetching && ref && <div ref={ref} style={{ height: "1px" }} />}
			</div>
		</div>
	);
};

export default MovieReviews;

MovieReviews.Skeleton = function ReviewSkeleton() {
	return (
		<>
			<div className="flex gap-3 py-4">
				<Skeleton className={"shrink-0 w-[50px] h-[50px] rounded-full"} />
				<div className="flex-1 flex flex-col gap-2">
					<Skeleton className={"w-32 h-4"} />
					<Skeleton className={"w-32 h-4"} />
					<Skeleton className={"w-full h-4"} />
				</div>
			</div>
			<div className="flex gap-3">
				<Skeleton className={"shrink-0 w-[50px] h-[50px] rounded-full"} />
				<div className="flex-1 flex flex-col gap-2">
					<Skeleton className={"w-32 h-4"} />
					<Skeleton className={"w-32 h-4"} />
					<Skeleton className={"w-full h-4"} />
				</div>
			</div>
			<div className="flex gap-3">
				<Skeleton className={"shrink-0 w-[50px] h-[50px] rounded-full"} />
				<div className="flex-1 flex flex-col gap-2">
					<Skeleton className={"w-32 h-4"} />
					<Skeleton className={"w-32 h-4"} />
					<Skeleton className={"w-full h-4"} />
				</div>
			</div>
			<div className="flex gap-3">
				<Skeleton className={"shrink-0 w-[50px] h-[50px] rounded-full"} />
				<div className="flex-1 flex flex-col gap-2">
					<Skeleton className={"w-32 h-4"} />
					<Skeleton className={"w-32 h-4"} />
					<Skeleton className={"w-full h-4"} />
				</div>
			</div>
			<div className="flex gap-3">
				<Skeleton className={"shrink-0 w-[50px] h-[50px] rounded-full"} />
				<div className="flex-1 flex flex-col gap-2">
					<Skeleton className={"w-32 h-4"} />
					<Skeleton className={"w-32 h-4"} />
					<Skeleton className={"w-full h-4"} />
				</div>
			</div>
			<div className="flex gap-3">
				<Skeleton className={"shrink-0 w-[50px] h-[50px] rounded-full"} />
				<div className="flex-1 flex flex-col gap-2">
					<Skeleton className={"w-32 h-4"} />
					<Skeleton className={"w-32 h-4"} />
					<Skeleton className={"w-full h-4"} />
				</div>
			</div>
			<div className="flex gap-3">
				<Skeleton className={"shrink-0 w-[50px] h-[50px] rounded-full"} />
				<div className="flex-1 flex flex-col gap-2">
					<Skeleton className={"w-32 h-4"} />
					<Skeleton className={"w-32 h-4"} />
					<Skeleton className={"w-full h-4"} />
				</div>
			</div>
			<div className="flex gap-3">
				<Skeleton className={"shrink-0 w-[50px] h-[50px] rounded-full"} />
				<div className="flex-1 flex flex-col gap-2">
					<Skeleton className={"w-32 h-4"} />
					<Skeleton className={"w-32 h-4"} />
					<Skeleton className={"w-full h-4"} />
				</div>
			</div>
		</>
	);
};
