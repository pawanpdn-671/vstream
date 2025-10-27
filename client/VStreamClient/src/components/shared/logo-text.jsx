import { Sparkles } from "lucide-react";
import React from "react";

const LogoText = ({ noText = false, size = "lg", textSize = "xl" }) => {
	const sizeOptions = {
		sm: "w-4 h-4",
		md: "w-6 h-6",
		lg: "w-8 h-8",
	};

	return (
		<div className="flex items-center gap-2">
			<div className={`${sizeOptions[size]} bg-linear-to-br bg-primary rounded-lg flex items-center justify-center`}>
				<Sparkles className="w-5 h-5 text-white" />
			</div>
			{!noText && <span className={`text-${textSize} font-bold font-poppins`}>VStream</span>}
		</div>
	);
};

export default LogoText;
