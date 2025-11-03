import { Button } from "@/components/shared/button";
import { Checkbox } from "@/components/shared/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/shared/field";
import { Input } from "@/components/shared/input";
import { Label } from "@/components/shared/label";
import { useGenres } from "@/hooks/movies/useGenres";
import { useAuthStore } from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import RegisterPage from "../Register";
import { toSnakeCase } from "@/utils/case-convert";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import UserProfile from "@/components/settings/user-profile";
import { useUpdateProfile } from "@/hooks/user/useUpdateProfile";
import ChangePasswordModal from "@/components/settings/change-password-modal";

const updateUserSchema = z.object({
	firstName: z.string().min(1, "First name is required."),
	lastName: z.string().min(1, "Last name is required."),
	email: z.email("Invalid email address."),
	favouriteGenres: z.array(z.number()).min(1, "Select at least one favourite genre."),
});

const ProfileSettingsPage = () => {
	const { genres, isLoading } = useGenres();
	const { user } = useAuthStore();
	const { updateUser, isPending, errorMessage } = useUpdateProfile();
	const queryClient = useQueryClient();

	const { handleSubmit, control, reset } = useForm({
		resolver: zodResolver(updateUserSchema),
		defaultValues: {
			firstName: user?.first_name ?? "",
			lastName: user?.last_name ?? "",
			email: user?.email ?? "",
			favouriteGenres: user?.favourite_genres?.map((g) => g.genre_id) ?? [],
		},
	});

	const onSubmit = (data) => {
		const { favouriteGenres, ...rest } = data;
		const favouriteGenreObjects = favouriteGenres?.map((id) => {
			const found = genres.find((g) => g.genre_id === id);
			return {
				genre_id: found?.genre_id,
				genre_name: found?.genre_name,
			};
		});

		const payload = toSnakeCase({
			...rest,
			favouriteGenres: favouriteGenreObjects,
		});

		updateUser(payload, {
			onSuccess: () => {
				toast.success("User update successful!", {
					className: "bg-gradient",
				});
				queryClient.invalidateQueries({ queryKey: ["profile"] });
				queryClient.invalidateQueries({ queryKey: ["recommended-movies"] });
			},
			onError: (error) => {
				toast.error("User update failed", {
					description: parseError(error),
				});
			},
		});
	};

	return (
		<div className="w-full">
			<div className="mx-auto">
				<div className="flex justify-end">
					<ChangePasswordModal />
				</div>
				<div className="flex justify-center pb-8">
					<UserProfile />
				</div>
				<form id="update-user-form" onSubmit={handleSubmit(onSubmit)}>
					<FieldGroup className={"grid grid-cols-2 gap-4"}>
						<Controller
							name="firstName"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>First Name</FieldLabel>
									<Input {...field} placeholder="John" autoComplete="off" />
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>

						<Controller
							name="lastName"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Last Name</FieldLabel>
									<Input {...field} placeholder="Doe" autoComplete="off" />
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>

						<Controller
							name="email"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Email</FieldLabel>
									<Input {...field} type="email" placeholder="abc@gmail.com" />
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>

						<Controller
							name="favouriteGenres"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid} className={"col-span-full"}>
									<FieldLabel>Favourite Genres</FieldLabel>
									<FieldDescription>Select your favourite genres below:</FieldDescription>

									<div className="mt-2 flex flex-wrap gap-4">
										{isLoading && <RegisterPage.GenreSkeleton />}
										{!isLoading && genres?.length > 0 ? (
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

									{genres && genres?.length && fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
					</FieldGroup>
					<Field className={"mt-20 items-center flex justify-center"} orientation="horizontal">
						<Button type="button" variant="outline" onClick={() => reset()}>
							Cancel
						</Button>
						<Button type="submit" form="update-user-form">
							Submit
						</Button>
					</Field>
				</form>
			</div>
		</div>
	);
};

export default ProfileSettingsPage;
