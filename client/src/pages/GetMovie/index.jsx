import ProcessedMoviesFeed from "@/components/generated/process-movies-feed";
import { Button } from "@/components/shared/button";
import { Label } from "@/components/shared/label";
import PageWrapper from "@/components/shared/page-wrapper";
import { Skeleton } from "@/components/shared/skeleton";
import { Spinner } from "@/components/shared/spinner";
import { Textarea } from "@/components/shared/textarea";
import TitleWithLine from "@/components/shared/title-with-line";
import { movieApi } from "@/service/movieApi";
import { useAuthStore } from "@/store/useAuthStore";
import { PAGE_TITLE } from "@/utils/constants";
import { useMutation } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const GetMoviePage = () => {
	const [userStoryText, setUserStoryText] = useState("");
	const [showProcessedResult, setShowProcessedResult] = useState(false);
	const { user } = useAuthStore();
	const resultRef = useRef(null);
	const {
		mutate: getUserStoryBasedMovies,
		data,
		error,
		isPending,
		isError,
		isIdle,
	} = useMutation({
		queryKey: ["user-story-movies"],
		mutationFn: movieApi.getUserStoryBasedMovies,
	});

	const handleProcess = () => {
		if (!userStoryText?.trim()) {
			toast.error("Write down story to start the process.");
			return;
		}
		if (userStoryText.length < 12) {
			toast.error("Story should atleast contain some words.");
			return;
		}
		const payload = {
			story: userStoryText,
			user_id: user.user_id,
			first_name: user.first_name,
			last_name: user.last_name,
		};
		getUserStoryBasedMovies(payload, {
			onSuccess: () => setShowProcessedResult(true),
			onError: () => setShowProcessedResult(true),
		});
	};

	useEffect(() => {
		if (
			showProcessedResult &&
			!isPending &&
			!isError &&
			!data?.error &&
			resultRef.current &&
			window?.innerWidth < 615
		) {
			setTimeout(() => {
				resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
			}, 300);
		}
	}, [showProcessedResult, isError, data, isPending]);

	return (
		<PageWrapper>
			<div className="h-full">
				<div className="relative z-10 pt-2">
					<TitleWithLine title={PAGE_TITLE.GET_MOVIE} includeLine />
					<div className="pt-10">
						<div className="flex flex-col md:flex-row gap-0 md:gap-10">
							<div className="shrink-0">
								<div className="w-full sm:w-[400px] gap-2">
									<Label htmlFor="user-story-field">Describe the story below</Label>
									<Textarea
										id="user-story-field"
										value={userStoryText}
										onChange={(e) => setUserStoryText(e.target.value)}
										placeholder="Type your story here."
										className={
											"mt-2 text-sm md:text-base resize-none min-h-[150px] max-h-[200px] overflow-y-auto"
										}
									/>
									<div className="mt-5 flex justify-end gap-2">
										<Button
											disabled={isPending}
											variant="ghost"
											onClick={() => setUserStoryText("")}
											className={""}>
											Reset
										</Button>
										<Button onClick={handleProcess} disabled={isPending} className={"text-xs md:text-sm"}>
											{isPending ? (
												<Spinner className={"text-orange-100 size-3.5! md:size-5"} />
											) : (
												<Sparkles size={18} className={"size-3.5! md:size-4!"} />
											)}
											{isPending ? "Processing..." : "Start Process"}
										</Button>
									</div>
								</div>
							</div>
							<div className="flex-1 pt-16 md:pt-0" ref={resultRef}>
								{isPending ? (
									<GetMoviePage.Skeleton />
								) : showProcessedResult ? (
									<ProcessedMoviesFeed data={data} isError={isError} error={error} />
								) : (
									<></>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</PageWrapper>
	);
};

export default GetMoviePage;

GetMoviePage.Skeleton = function ProcessedResultPendingSkeleton() {
	return (
		<div className="flex flex-wrap gap-4">
			<Skeleton className={"w-[280px] h-[400px]"} />
			<Skeleton className={"w-[280px] h-[400px]"} />
		</div>
	);
};
