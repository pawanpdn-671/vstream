import { RegisterForm } from "@/components/auth/register-form";
import { Skeleton } from "@/components/shared/skeleton";
import AuthLayout from "@/layouts/auth-layout";

const RegisterPage = () => {
	return (
		<AuthLayout>
			<div className="bg-white lg:bg-transparent mt-16 lg:mt-0 rounded-lg xs:rounded-none pt-4 pb-8 xs:py-10 px-3 xs:px-5">
				<div className="w-full xs:w-[380px] mx-auto">
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
