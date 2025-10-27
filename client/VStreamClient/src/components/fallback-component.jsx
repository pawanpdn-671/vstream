import React from "react";

const FallbackComponent = () => {
	return (
		<div className="relative w-full h-screen flex justify-center items-center bg-background">
			<div className="fallback-loader relative w-16 h-16 rounded-md bg-white overflow-hidden"></div>
		</div>
	);
};

export default FallbackComponent;
