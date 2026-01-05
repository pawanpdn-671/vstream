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
import { userApi } from "@/service/userApi";
import { APP_EMPTY_MESSAGES, APP_ERROR_MESSAGES } from "@/utils/constants";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const LikedMovies = () => {
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const {
		data: likedMovies,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["liked-movies", currentPage],
		queryFn: () => userApi.getLikedMovies({ pageParam: currentPage }),
	});

	useEffect(() => {
		if (likedMovies && likedMovies.data) {
			setTotalPages(likedMovies.totalPages || 1);
		}
	}, [likedMovies]);

	const handlePageChange = (page) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	if (isError) {
		return (
			<div className="mt-10 text-center">
				<EmptyResult
					title={APP_ERROR_MESSAGES.LIKED_MOVIES.TITLE}
					icon={APP_ERROR_MESSAGES.LIKED_MOVIES.ICON}
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
			) : likedMovies?.data?.length > 0 ? (
				likedMovies.data.map((movie) => <MoviesListItem key={movie._id} movie={movie} />)
			) : (
				<div className="mt-10 text-center">
					<EmptyResult
						title={APP_EMPTY_MESSAGES.LIKED_MOVIES.TITLE}
						description={APP_EMPTY_MESSAGES.LIKED_MOVIES.DESCRIPTION}
						icon={APP_EMPTY_MESSAGES.LIKED_MOVIES.ICON}
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

export default LikedMovies;
