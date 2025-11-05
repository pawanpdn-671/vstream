import ProcessedMoviesFeed from "@/components/generated/process-movies-feed";
import { Button } from "@/components/shared/button";
import { Label } from "@/components/shared/label";
import PageWrapper from "@/components/shared/page-wrapper";
import { Skeleton } from "@/components/shared/skeleton";
import { Spinner } from "@/components/shared/spinner";
import { Textarea } from "@/components/shared/textarea";
import TitleWithLine from "@/components/shared/title-with-line";
import { movieApi } from "@/service/movieApi";
import { PAGE_TITLE } from "@/utils/constants";
import { useMutation } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const GetMoviePage = () => {
	const [userStoryText, setUserStoryText] = useState("");
	const [showProcessedResult, setShowProcessedResult] = useState(false);
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

		getUserStoryBasedMovies(
			{ story: userStoryText },
			{
				onSuccess: () => setShowProcessedResult(true),
				onError: () => setShowProcessedResult(true),
			},
		);
	};

	return (
		<PageWrapper>
			<TitleWithLine title={PAGE_TITLE.GET_MOVIE} includeLine />
			<div className="pt-10">
				<div className="flex gap-10">
					<div className="shrink-0">
						<div className="w-[400px] gap-2">
							<Label htmlFor="user-story-field">Write down the story below</Label>
							<Textarea
								id="user-story-field"
								value={userStoryText}
								onChange={(e) => setUserStoryText(e.target.value)}
								placeholder="Type your story here."
								className={"mt-2 resize-none min-h-[150px] max-h-[200px] overflow-y-auto"}
							/>
							<div className="mt-5 flex justify-end gap-2">
								<Button disabled={isPending} variant="ghost" onClick={() => setUserStoryText("")}>
									Reset
								</Button>
								<Button onClick={handleProcess} disabled={isPending}>
									{isPending ? <Spinner className={"text-orange-100 size-5"} /> : <Sparkles size={18} />}
									{isPending ? "Processing..." : "Start Process"}
								</Button>
							</div>
						</div>
					</div>
					<div className="flex-1">
						{isPending ? (
							<GetMoviePage.Skeleton />
						) : showProcessedResult ? (
							<ProcessedMoviesFeed movies={data?.movies} isError={isError} error={error} />
						) : (
							<></>
						)}
					</div>
				</div>
			</div>
		</PageWrapper>
	);
};

export default GetMoviePage;

GetMoviePage.Skeleton = function ProcessedResultPendingSkeleton() {
	return (
		<div className="flex gap-4 flex-wrap">
			<Skeleton className={"w-[280px] h-[400px]"} />
			<Skeleton className={"w-[280px] h-[400px]"} />
		</div>
	);
};
