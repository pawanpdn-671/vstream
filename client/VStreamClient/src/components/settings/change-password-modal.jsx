import { useChangePassword } from "@/hooks/user/useChangePassword";
import { toSnakeCase } from "@/utils/case-convert";
import { parseError } from "@/utils/parse-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "../shared/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../shared/dialog";
import { Field, FieldError, FieldLabel } from "../shared/field";
import { Input } from "../shared/input";

const userPasswordSchema = z.object({
	oldPassword: z.string().min(6, "Password must be at least 6 characters."),
	newPassword: z.string().min(6, "Password must be at least 6 characters."),
});

const ChangePasswordModal = () => {
	const [open, setOpen] = useState(false);
	const { changePassword, isPending } = useChangePassword();
	const { handleSubmit, control, reset } = useForm({
		resolver: zodResolver(userPasswordSchema),
		defaultValues: {
			oldPassword: "",
			newPassword: "",
		},
	});

	const onSubmit = (data) => {
		const payload = toSnakeCase(data);

		changePassword(payload, {
			onSuccess: () => {
				toast.success("Password change successful!", {
					className: "bg-gradient",
				});
				reset();
				setOpen(false);
			},
			onError: (error) => {
				toast.error("Failed to change password", {
					description: parseError(error),
				});
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<form onSubmit={handleSubmit(onSubmit)} id="change-password-form">
				<DialogTrigger asChild>
					<Button variant="secondary">Change Password</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Change Your Password</DialogTitle>
						<DialogDescription>Update your password and lick change when you&apos;re done.</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4">
						<Controller
							name="oldPassword"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Old Passsword</FieldLabel>
									<Input
										type="password"
										{...field}
										placeholder="******"
										autoComplete="off"
										disabled={isPending}
									/>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>
						<Controller
							name="newPassword"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>New Passsword</FieldLabel>
									<Input
										type="password"
										{...field}
										placeholder="******"
										autoComplete="off"
										disabled={isPending}
									/>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>
					</div>
					<DialogFooter className={"mt-5"}>
						<DialogClose asChild>
							<Button variant="outline" disabled={isPending}>
								Cancel
							</Button>
						</DialogClose>
						<Button type="submit" form="change-password-form" disabled={isPending}>
							Change
						</Button>
					</DialogFooter>
				</DialogContent>
			</form>
		</Dialog>
	);
};

export default ChangePasswordModal;
