import React from "react";
import authBg from "../assets/auth_bg.jpg";
import LogoText from "@/components/shared/logo-text";

const AuthLayout = ({ children }) => {
	return (
		<div className="relative w-full h-screen lg:flex">
			<div className="absolute left-4 top-4">
				<LogoText textColor={"white"} />
			</div>
			<div className="hidden lg:block">
				<img src={authBg} className="w-full h-full" alt="watch movie image file" />
			</div>

			<div className="absolute overflow-y-auto left-1/2 top-0 w-full lg:w-1/2 h-full  bg-linear-to-tr from-red-100 via-white to-orange-100">
				{children}
			</div>
		</div>
	);
};

export default AuthLayout;
