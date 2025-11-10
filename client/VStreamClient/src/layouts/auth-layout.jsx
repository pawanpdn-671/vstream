import React from "react";
import authBg from "../assets/auth_bg.jpg";
import LogoText from "@/components/shared/logo-text";

const AuthLayout = ({ children }) => {
	return (
		<div className="relative w-full h-screen flex">
			<div className="absolute left-4 top-4">
				<LogoText textColor={"white"} />
			</div>
			<div className="block">
				<img src={authBg} className="w-full h-full" alt="watch movie image file" />
			</div>

			<div className="absolute overflow-y-auto left-0 lg:left-1/2 top-0 w-full lg:w-1/2 h-full bg-transparent px-3 xs:px-0 lg:bg-linear-to-tr lg:from-red-100 lg:via-white lg:to-orange-100">
				{children}
			</div>
		</div>
	);
};

export default AuthLayout;
