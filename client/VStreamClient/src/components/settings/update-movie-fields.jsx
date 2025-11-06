import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../shared/field";
import { Input } from "../shared/input";
import { Textarea } from "../shared/textarea";
import { Button } from "../shared/button";

const updateMovieSchema = z.object({
	title: z.string().min(1, "Title is required."),
	plot: z.string().min(1, "Plot is required."),
	youtubeId: z.string().min(1, "Youtube ID is required."),
	posterPath: z.string().min(6, "Poster path is required"),
});

const UpdateMovieFields = ({ movie, onSubmit, onCancel, isLoading }) => {
	const { handleSubmit, control, reset } = useForm({
		resolver: zodResolver(updateMovieSchema),
		defaultValues: {
			title: movie.title ?? "",
			plot: movie.plot ?? "",
			posterPath: movie.poster_path ?? "",
			youtubeId: movie.youtube_id ?? "",
			genre: movie.genre ?? [],
		},
	});

	return (
		<form id="update-movie" onSubmit={handleSubmit(onSubmit)} className="w-full pb-2">
			<FieldGroup>
				<div className="grid grid-cols-2 gap-4">
					<Controller
						name="title"
						control={control}
						disabled={isLoading}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel>Title</FieldLabel>
								<Input {...field} />
								{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
							</Field>
						)}
					/>

					<Controller
						name="plot"
						control={control}
						disabled={isLoading}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel>Plot</FieldLabel>
								<Textarea {...field} className={"resize-none max-h-20"} />
								{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
							</Field>
						)}
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<Controller
						name="posterPath"
						control={control}
						disabled={isLoading}
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
						disabled={isLoading}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel>Youtube ID</FieldLabel>
								<Input {...field} />
								{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
							</Field>
						)}
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<Controller
						name="genre"
						control={control}
						render={({ field, fieldState }) => {
							return (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Genre</FieldLabel>
									<div className="flex flex-wrap gap-2">
										{field.value?.map((genre) => (
											<span
												key={genre.genre_id}
												className="text-gradient text-sm font-medium w-max! border rounded-sm px-2 py-1">
												{genre.genre_name}
											</span>
										))}
									</div>
								</Field>
							);
						}}
					/>
				</div>

				<Field className={"justify-center mt-5"} orientation="horizontal">
					<Button
						type="button"
						size="sm"
						variant="outline"
						disabled={isLoading}
						onClick={() => {
							reset();
							onCancel();
						}}>
						Cancel
					</Button>
					<Button type="submit" size={"sm"} disabled={isLoading} form="update-movie">
						Update
					</Button>
				</Field>
			</FieldGroup>
		</form>
	);
};

export default UpdateMovieFields;
