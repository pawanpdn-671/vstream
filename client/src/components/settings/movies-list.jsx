import { movieApi } from "@/service/movieApi";
import { APP_EMPTY_MESSAGES, APP_ERROR_MESSAGES } from "@/utils/constants";
import { parseError } from "@/utils/parse-error";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { EmptyResult } from "../empty-result";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "../shared/pagination";
import { Skeleton } from "../shared/skeleton";
import MoviesListItem from "./movies-list-item";

const MoviesListTabContent = () => {
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const {
		data: movies,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["manage-movies-list", currentPage],
		queryFn: () => movieApi.getMovies({ pageParam: currentPage, search: "", genre: "" }),
	});

	useEffect(() => {
		if (movies && movies.data) {
			setTotalPages(movies.totalPages || 1);
		}
	}, [movies]);

	const handlePageChange = (page) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	if (isError) {
		return (
			<div className="mt-10 text-center">
				<EmptyResult
					title={APP_ERROR_MESSAGES.MOVIES.TITLE}
					icon={APP_ERROR_MESSAGES.MOVIES.ICON}
					description={parseError(error)}
					iconColor={"destructive"}
					noAction={true}
				/>
			</div>
		);
	}

	return (
		<div className="flex w-full pt-2 flex-col gap-4 pb-10">
			{isLoading ? (
				<MoviesListTabContent.Skeleton />
			) : movies?.data?.length > 0 ? (
				movies.data.map((movie) => <MoviesListItem key={movie._id} movie={movie} />)
			) : (
				<div className="mt-10 text-center">
					<EmptyResult
						title={APP_EMPTY_MESSAGES.MOVIES.TITLE}
						description={APP_EMPTY_MESSAGES.MOVIES.DESCRIPTION}
						icon={APP_EMPTY_MESSAGES.MOVIES.ICON}
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

export default MoviesListTabContent;

MoviesListTabContent.Skeleton = function MoviesListSkeleton() {
	return (
		<>
			<Skeleton className={"w-full h-32"} />
			<Skeleton className={"w-full h-32"} />
			<Skeleton className={"w-full h-32"} />
			<Skeleton className={"w-full h-32"} />
			<Skeleton className={"w-full h-32"} />
			<Skeleton className={"w-full h-32"} />
			<Skeleton className={"w-full h-32"} />
			<Skeleton className={"w-full h-32"} />
		</>
	);
};
