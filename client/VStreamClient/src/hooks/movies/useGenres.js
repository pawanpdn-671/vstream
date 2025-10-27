import { useQuery } from "@tanstack/react-query";
import { movieApi } from "@/service/movieApi";
import { parseError } from "@/utils/parse-error";

export const useGenres = () => {
	const { data, error, isLoading, isError, isFetching, refetch } = useQuery({
		queryKey: ["genres"],
		queryFn: movieApi.getGenres,
	});

	const errorMessage = isError ? parseError(error) : "";

	return { genres: data ?? [], error, isLoading, isError, isFetching, refetch, errorMessage };
};
