import { EmptyResult } from "@/components/empty-result";
import PageWrapper from "@/components/shared/page-wrapper";
import { Skeleton } from "@/components/shared/skeleton";
import StreamMovie from "@/components/stream/stream-movie";
import { useMovieById } from "@/hooks/movies/useMovieById";
import { APP_ERROR_MESSAGES } from "@/utils/constants";
import { useParams } from "react-router-dom";

const StreamPage = () => {
	const { imdb_id } = useParams();
	const { movie, isLoading, isError, errorMessage } = useMovieById(imdb_id);

	return (
		<PageWrapper>
			<div className="py-2 sm:py-5">
				{isLoading ? <StreamPage.Skeleton /> : !isError && <StreamMovie movie={movie} />}
				{isError && !isLoading && (
					<div className="text-center">
						<EmptyResult
							title={APP_ERROR_MESSAGES.MOVIE.TITLE}
							icon={APP_ERROR_MESSAGES.MOVIE.ICON}
							description={errorMessage}
							iconColor={"destructive"}
							noAction={true}
						/>
					</div>
				)}
			</div>
		</PageWrapper>
	);
};

export default StreamPage;

StreamPage.Skeleton = function StreamPageSkeleton() {
	return (
		<div className="w-full flex flex-col lg:flex-row gap-10">
			<div className="flex-1">
				<Skeleton className={"flex-1 aspect-video"} />
				<Skeleton className={"mt-8 w-full h-[100px]"} />
			</div>
			<div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-4">
				<Skeleton className={"w-full h-[200px]"} />
				<Skeleton className={"w-full h-[50px]"} />
			</div>
		</div>
	);
};
