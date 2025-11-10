import LoginForm from "@/components/auth/login-form";
import AuthLayout from "@/layouts/auth-layout";
import React from "react";

const LoginPage = () => {
	return (
		<AuthLayout>
			<div className="h-full flex justify-center items-center">
				<div className="bg-white px-3 xs:px-5 rounded-lg pt-5 pb-8 xs:py-10 shadow-md w-full xs:w-max mx-auto">
					<div className="w-full xs:w-[380px]">
						<LoginForm />
					</div>
				</div>
			</div>
		</AuthLayout>
	);
};

export default LoginPage;
