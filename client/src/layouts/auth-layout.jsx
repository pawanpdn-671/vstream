import React from "react";
import authBg from "../assets/auth_bg.jpg";
import LogoText from "@/components/shared/logo-text";

const AuthLayout = ({ children }) => {
	return (
		<div className="relative w-full h-screen flex">
			<div className="absolute left-4 top-4">
				<LogoText textColor={"white"} />
			</div>

			{/* Test Credentials Popup */}
			<div className="hidden lg:block absolute left-4 bottom-4 z-10">
				<div className="bg-black/70 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg max-w-[280px]">
					<div className="flex items-center gap-2 mb-2">
						<span className="text-lg">🧪</span>
						<h3 className="font-semibold text-sm">Test Credentials</h3>
					</div>
					<div className="space-y-1 text-sm">
						<p className="flex justify-between">
							<span className="text-gray-300">Email:</span>
							<span className="font-mono text-orange-200">pawantest@gmail.com</span>
						</p>
						<p className="flex justify-between">
							<span className="text-gray-300">Password:</span>
							<span className="font-mono text-orange-200">111111</span>
						</p>
					</div>
				</div>
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
