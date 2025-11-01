import React from "react";
import { Separator } from "./separator";

const TitleWithLine = ({ title, includeLine = true }) => {
	return (
		<div className="py-2">
			<h1 className="w-max text-3xl font-bold text-gradient">{title}</h1>
			{includeLine && <Separator className={"mt-2"} />}
		</div>
	);
};

export default TitleWithLine;
