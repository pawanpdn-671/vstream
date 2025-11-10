import React from "react";
import { useLocation } from "react-router-dom";

const PageWrapper = ({ children }) => {
	const { pathname } = useLocation();

	return (
		<div className="max-w-7xl pt-[80px] px-4 xs:px-5 pb-20 mx-auto min-h-screen">
			{pathname && pathname?.includes("get-your-movie") && (
				<div className="fixed inset-0 -z-50">
					<div className="relative h-full w-full [&>div]:absolute [&>div]:inset-0 [&>div]:bg-[radial-gradient(circle_at_center,#FF7112,transparent)] [&>div]:opacity-30 [&>div]:mix-blend-multiply">
						<div></div>
					</div>
				</div>
			)}
			{children}
		</div>
	);
};

export default PageWrapper;
