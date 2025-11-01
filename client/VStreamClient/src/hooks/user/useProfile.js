import { userApi } from "@/service/userApi";
import { parseError } from "@/utils/parse-error";
import { useQuery } from "@tanstack/react-query";

export const useProfile = (options) => {
	const { enabled = true } = options ?? {};
	const { data, error, isLoading, isError, isFetching, refetch } = useQuery({
		queryKey: ["profile"],
		queryFn: userApi.profile,
		enabled,
	});

	const errorMessage = isError ? parseError(error) : "";

	return { user: data ?? null, error, isLoading, isError, isFetching, refetch, errorMessage };
};
