import { RegisterForm } from "@/components/auth/register-form";
import { Skeleton } from "@/components/shared/skeleton";
import AuthLayout from "@/layouts/auth-layout";

const RegisterPage = () => {
	return (
		<AuthLayout>
			<div className="py-10 px-5">
				<div className="w-[380px] mx-auto">
					<RegisterForm />
				</div>
			</div>
		</AuthLayout>
	);
};

export default RegisterPage;

RegisterPage.GenreSkeleton = function SkeletonLoading() {
	return (
		<div className="flex flex-wrap gap-2">
			<Skeleton className={"w-20 h-5"} />
			<Skeleton className={"w-20 h-5"} />
			<Skeleton className={"w-20 h-5"} />
			<Skeleton className={"w-20 h-5"} />
			<Skeleton className={"w-20 h-5"} />
			<Skeleton className={"w-20 h-5"} />
			<Skeleton className={"w-20 h-5"} />
			<Skeleton className={"w-20 h-5"} />
		</div>
	);
};
