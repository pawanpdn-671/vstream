import { EmptyResult } from "@/components/empty-result";
import MoviesListTabContent from "@/components/settings/movies-list";
import MoviesListItem from "@/components/settings/movies-list-item";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/shared/pagination";
import ReviewItem from "@/components/stream/review-item";
import { userApi } from "@/service/userApi";
import { APP_EMPTY_MESSAGES, APP_ERROR_MESSAGES } from "@/utils/constants";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

const Comments = () => {
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const {
		data: userReviews,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["user-reviews", currentPage],
		queryFn: () => userApi.getUserReviews({ pageParam: currentPage }),
	});

	const userReviewsAction = [
		{
			name: "Go to Review",
			icon: ExternalLink,
			type: "link",
			path: "/stream",
		},
	];

	useEffect(() => {
		if (userReviews && userReviews.data) {
			setTotalPages(userReviews.totalPages || 1);
		}
	}, [userReviews]);

	const handlePageChange = (page) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	if (isError) {
		return (
			<div className="mt-10 text-center">
				<EmptyResult
					title={APP_ERROR_MESSAGES.USER_REVIEWS.TITLE}
					icon={APP_ERROR_MESSAGES.USER_REVIEWS.ICON}
					description={parseError(error)}
					iconColor={"destructive"}
					noAction={true}
				/>
			</div>
		);
	}

	return (
		<div className="flex w-full flex-col gap-4 pb-10">
			{isLoading ? (
				<MoviesListTabContent.Skeleton />
			) : userReviews?.data?.length > 0 ? (
				userReviews.data.map((review) => (
					<ReviewItem key={review._id} review={review} includeBorder actions={userReviewsAction} />
				))
			) : (
				<div className="mt-10 text-center">
					<EmptyResult
						title={APP_EMPTY_MESSAGES.USER_REVIEWS.TITLE}
						description={APP_EMPTY_MESSAGES.USER_REVIEWS.DESCRIPTION}
						icon={APP_EMPTY_MESSAGES.USER_REVIEWS.ICON}
						noAction={true}
					/>
				</div>
			)}
			{totalPages > 1 && (
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								href="#"
								onClick={(e) => {
									e.preventDefault();
									handlePageChange(currentPage - 1);
								}}
								aria-disabled={currentPage === 1}
							/>
						</PaginationItem>

						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<PaginationItem key={page}>
								<PaginationLink
									href="#"
									isActive={page === currentPage}
									onClick={(e) => {
										e.preventDefault();
										handlePageChange(page);
									}}>
									{page}
								</PaginationLink>
							</PaginationItem>
						))}

						{totalPages > 5 && <PaginationEllipsis />}

						<PaginationItem>
							<PaginationNext
								href="#"
								onClick={(e) => {
									e.preventDefault();
									handlePageChange(currentPage + 1);
								}}
								aria-disabled={currentPage === totalPages}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
		</div>
	);
};

export default Comments;
