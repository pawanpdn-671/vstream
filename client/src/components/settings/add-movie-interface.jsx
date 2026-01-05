import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "../shared/field";
import { Input } from "../shared/input";
import { Button } from "../shared/button";
import { Textarea } from "../shared/textarea";
import { useAddUpdateMovie } from "@/hooks/movies/useAddUpdateMovie";
import { useGenres } from "@/hooks/movies/useGenres";
import { Checkbox } from "../shared/checkbox";
import { Label } from "../shared/label";
import RegisterPage from "@/pages/Register";
import { toSnakeCase } from "@/utils/case-convert";
import { parseError } from "@/utils/parse-error";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

const addMovieSchema = z.object({
	imdbId: z.string().min(1, "Title is required."),
	title: z.string().min(1, "Title is required."),
	plot: z.string().min(1, "Plot is required."),
	youtubeId: z.string().min(1, "Youtube ID is required."),
	posterPath: z.string().min(6, "Poster path is required"),
	genre: z.array(z.number()).min(1, "Select at least one genre."),
});

const AddMovieInterface = () => {
	const { user } = useAuthStore();
	const { genres, isLoading } = useGenres();
	const { movieHandler, isPending, isError } = useAddUpdateMovie("add");
	const { handleSubmit, control, reset } = useForm({
		resolver: zodResolver(addMovieSchema),
		defaultValues: {
			imdbId: "",
			title: "",
			plot: "",
			posterPath: "",
			youtubeId: "",
			genre: [],
		},
	});

	const onSubmit = (data) => {
		const { genre, ...rest } = data;
		const genreObjects = genre?.map((id) => {
			const found = genres.find((g) => g.genre_id === id);
			return {
				genre_id: found?.genre_id,
				genre_name: found?.genre_name,
			};
		});

		const payload = toSnakeCase({
			...rest,
			genre: genreObjects,
			uploaded_by: {
				user_id: user.user_id,
				first_name: user.first_name,
				last_name: user.last_name,
			},
		});

		movieHandler(payload, {
			onSuccess: () => {
				toast.success("🎉 Movie added!");
				reset();
			},
			onError: (error) => {
				toast.error("Failed to add movie!", {
					description: parseError(error),
				});
			},
		});
	};

	return (
		<div className="pt-5">
			<form id="update-movie" onSubmit={handleSubmit(onSubmit)} className="w-full pb-2">
				<FieldGroup>
					<div className="grid mdl:grid-cols-2 gap-4">
						<Controller
							name="imdbId"
							control={control}
							disabled={isLoading || isPending}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Imdb ID</FieldLabel>
									<Input {...field} />
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>

						<Controller
							name="title"
							control={control}
							disabled={isLoading || isPending}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Title</FieldLabel>
									<Input {...field} />
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>
					</div>

					<Controller
						name="plot"
						control={control}
						disabled={isLoading || isPending}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel>Plot</FieldLabel>
								<Textarea {...field} className={"resize-none max-h-20"} />
								{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
							</Field>
						)}
					/>

					<div className="grid mdl:grid-cols-2 gap-4">
						<Controller
							name="posterPath"
							control={control}
							disabled={isLoading || isPending}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Poster Path</FieldLabel>
									<Input {...field} />
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>

						<Controller
							name="youtubeId"
							control={control}
							disabled={isLoading || isPending}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Youtube ID</FieldLabel>
									<Input {...field} />
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>
					</div>

					<Controller
						name="genre"
						control={control}
						disabled={isLoading || isPending}
						render={({ field, fieldState }) => {
							return (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Genre</FieldLabel>
									<FieldDescription>Select movie genres from below</FieldDescription>

									<div className="mt-2 flex flex-wrap gap-4 max-h-40 overflow-y-auto px-2 py-3 rounded-md border content-start contain-[layout_paint]">
										{isLoading ? (
											<RegisterPage.GenreSkeleton />
										) : genres && genres?.length > 0 ? (
											genres.map((genre) => {
												const checked = field.value.includes(genre.genre_id);
												return (
													<Label key={genre.genre_id} className="flex items-center gap-2 cursor-pointer">
														<Checkbox
															checked={checked}
															onCheckedChange={(isChecked) => {
																if (isChecked) {
																	field.onChange([...field.value, genre.genre_id]);
																} else {
																	field.onChange(field.value.filter((id) => id !== genre.genre_id));
																}
															}}
														/>
														<span>{genre.genre_name}</span>
													</Label>
												);
											})
										) : (
											<p className="text-destructive text-sm">No Genres Found.</p>
										)}
									</div>

									{genres && genres?.length && fieldState.invalid ? (
										<FieldError errors={[fieldState.error]} />
									) : (
										<></>
									)}
								</Field>
							);
						}}
					/>

					<Field className={"justify-center mt-5"} orientation="horizontal">
						<Button
							type="button"
							size="sm"
							variant="outline"
							disabled={isLoading || isPending}
							onClick={() => {
								reset();
								onCancel();
							}}>
							Cancel
						</Button>
						<Button type="submit" size={"sm"} disabled={isLoading || isPending} form="update-movie">
							Add Movie
						</Button>
					</Field>
				</FieldGroup>
			</form>
		</div>
	);
};

export default AddMovieInterface;
