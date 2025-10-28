import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Field, FieldGroup, FieldLabel } from "../shared/field";
import { Input } from "../shared/input";
import { Button } from "../shared/button";
import { toSnakeCase } from "@/utils/case-convert";
import { useLogin } from "@/hooks/auth/useLogin";
import { toast } from "sonner";
import { parseError } from "@/utils/parse-error";
import { Link, useLocation, useNavigate } from "react-router-dom";

const loginSchema = z.object({
	email: z.email("Invalid email address."),
	password: z.string().min(6, "Password must be at least 6 characters."),
});

const LoginForm = () => {
	const { loginUser, isPending, isSuccess, errorMessage } = useLogin();
	const { handleSubmit, control, reset } = useForm({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});
	const navigate = useNavigate();
	const location = useLocation();
	const from = location.state?.from?.pathname || "/";

	const onSubmit = (data) => {
		const payload = toSnakeCase(data);

		loginUser(payload, {
			onSuccess: () => {
				toast.success("🎉 Login successful!", {
					description: "Welcome back! stay tuned",
					className: "bg-gradient",
				});
				reset();
				navigate(from, { replace: true });
			},
			onError: (error) => {
				toast.error("Login failed", {
					description: parseError(error),
				});
			},
		});
	};

	return (
		<form id="login-form" onSubmit={handleSubmit(onSubmit)}>
			<div className="pb-10">
				<h2 className={"text-2xl font-semibold"}>Login</h2>
				<p className="text-muted-foreground">Welcome Back! Great to see you</p>
			</div>
			<FieldGroup>
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

				<Field className={"mt-6"}>
					<Button type="submit" form="login-form">
						Submit
					</Button>
					<Button type="button" variant="outline" onClick={() => reset()}>
						Cancel
					</Button>
				</Field>

				<div className="text-sm mt-5 text-center text-muted-foreground">
					Don't have an account?
					<Link to="/register" className="ml-2 text-gradient transition-colors">
						Signup now
					</Link>
				</div>
			</FieldGroup>
		</form>
	);
};

export default LoginForm;
