import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/shared/button";
import { Checkbox } from "@/components/shared/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/shared/field";
import { Input } from "@/components/shared/input";
import { useGenres } from "@/hooks/movies/useGenres";
import RegisterPage from "@/pages/Register";
import { Label } from "../shared/label";
import { useRegister } from "@/hooks/auth/useRegister";
import { toSnakeCase } from "@/utils/case-convert";
import { DEFAULT_ROLE } from "@/utils/constants";
import { Link, useNavigate } from "react-router-dom";

const registerSchema = z
	.object({
		firstName: z.string().min(1, "First name is required."),
		lastName: z.string().min(1, "Last name is required."),
		email: z.email("Invalid email address."),
		password: z.string().min(6, "Password must be at least 6 characters."),
		confirmPassword: z.string().min(1, "Confirm your password."),
		favouriteGenres: z.array(z.number()).min(1, "Select at least one favourite genre."),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match.",
		path: ["confirmPassword"],
	});

export function RegisterForm() {
	const { genres, isLoading } = useGenres();
	const { registerUser, isPending, isSuccess, errorMessage } = useRegister();
	const navigate = useNavigate();

	const { handleSubmit, control, reset } = useForm({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			confirmPassword: "",
			favouriteGenres: [],
		},
	});

	const onSubmit = (data) => {
		const { confirmPassword, favouriteGenres, ...rest } = data;
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
			role: DEFAULT_ROLE,
		});

		registerUser(payload, {
			onSuccess: () => {
				toast.success("🎉 Registration successful!", {
					description: "Congratulations! Get ready to explore VStream",
					className: "bg-gradient",
				});
				reset();
				navigate("/login", { replace: true });
			},
			onError: (error) => {
				toast.error("Registration failed", {
					description: parseError(error),
				});
			},
		});
	};

	return (
		<form id="register-form" onSubmit={handleSubmit(onSubmit)}>
			<div className="pb-10">
				<h2 className={"text-2xl font-semibold"}>Register Now!</h2>
				<p className="text-muted-foreground">Continue to enjoy movies in VStream</p>
			</div>
			<FieldGroup>
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
					name="password"
					control={control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel>Password</FieldLabel>
							<Input {...field} type="password" placeholder="******" />
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>

				<Controller
					name="confirmPassword"
					control={control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel>Confirm Password</FieldLabel>
							<Input {...field} type="password" placeholder="******" />
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>

				<Controller
					name="favouriteGenres"
					control={control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel>Favourite Genres</FieldLabel>
							<FieldDescription>Select your favourite genres below:</FieldDescription>

							<div className="overflow-hidden">
								<div className="mt-2 flex flex-wrap gap-4 h-40 overflow-y-scroll px-2 py-3 rounded-md border content-start contain-[layout_paint]">
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
							</div>

							{genres && genres?.length && fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>

				<Field className={"mt-6"}>
					<Button type="submit" form="register-form">
						Submit
					</Button>
					<Button type="button" variant="outline" onClick={() => reset()}>
						Cancel
					</Button>
				</Field>

				<div className="text-sm mt-5 text-center text-muted-foreground">
					Already have an account?
					<Link to="/login" className="ml-2 text-gradient transition-colors">
						Login
					</Link>
				</div>
			</FieldGroup>
		</form>
	);
}
