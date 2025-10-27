import Home from "@/components/home/Home";
import PageWrapper from "@/components/shared/page-wrapper";
import { Skeleton } from "@/components/shared/skeleton";
import { useMovies } from "@/hooks/movies/useMovies";

const HomePage = () => {
	const { movies, isLoading, isError, errorMessage } = useMovies();

	return (
		<PageWrapper>
			{isLoading ? <HomePage.Skeleton /> : <Home movies={movies} isError={isError} errorMessage={errorMessage} />}
		</PageWrapper>
	);
};

export default HomePage;

HomePage.Skeleton = function HomeSkeletonWrapper() {
	return (
		<div className="grid grid-cols-4 gap-4">
			<Skeleton className="h-[300px] w-full rounded-xl" />
			<Skeleton className="h-[300px] w-full rounded-xl" />
			<Skeleton className="h-[300px] w-full rounded-xl" />
			<Skeleton className="h-[300px] w-full rounded-xl" />
			<Skeleton className="h-[300px] w-full rounded-xl" />
			<Skeleton className="h-[300px] w-full rounded-xl" />
			<Skeleton className="h-[300px] w-full rounded-xl" />
			<Skeleton className="h-[300px] w-full rounded-xl" />
			<Skeleton className="h-[300px] w-full rounded-xl" />
			<Skeleton className="h-[300px] w-full rounded-xl" />
		</div>
	);
};
