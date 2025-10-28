import LoginForm from "@/components/auth/login-form";
import AuthLayout from "@/layouts/auth-layout";
import React from "react";

const LoginPage = () => {
	return (
		<AuthLayout>
			<div className="bg-white px-5 rounded-lg py-10 shadow-md">
				<div className="w-[380px] mx-auto">
					<LoginForm />
				</div>
			</div>
		</AuthLayout>
	);
};

export default LoginPage;
