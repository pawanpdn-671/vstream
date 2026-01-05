import React from "react";

const GradientBorder = ({ children, radius }) => {
	return (
		<div className={`p-[2px] bg-linear-to-r from-red-300 to-orange-400 ${radius}`}>
			<div className={`${radius} bg-background`}>{children}</div>
		</div>
	);
};

export default GradientBorder;
