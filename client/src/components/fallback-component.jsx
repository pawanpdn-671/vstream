import React from "react";

const FallbackComponent = ({ type = "page" }) => {
	return (
		<div
			className={`relative w-full ${
				type === "page" ? "h-screen" : "h-full"
			} flex justify-center items-center bg-background`}>
			<div className="fallback-loader relative w-16 h-16 rounded-md bg-secondary overflow-hidden"></div>
		</div>
	);
};

export default FallbackComponent;
