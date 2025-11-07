import React from "react";
import { Skeleton } from "../shared/skeleton";

const PopularWords = ({ isLoading, data }) => {
	return (
		<div className="border p-3 rounded-sm">
			<h4 className="w-max text-base font-medium text-gradient">What Others Say About This Movie</h4>
			<div className="mt-4 flex flex-wrap gap-3">
				{isLoading ? (
					<>
						<Skeleton className={"w-24 h-10"} />
						<Skeleton className={"w-24 h-10"} />
						<Skeleton className={"w-24 h-10"} />
						<Skeleton className={"w-24 h-10"} />
						<Skeleton className={"w-24 h-10"} />
					</>
				) : (
					data?.map((topic, i) => (
						<span
							key={i}
							className="capitalize rounded-sm inline-block py-1 px-2 text-xs font-medium bg-linear-to-tr from-orange-50 via-orange-50 to-red-100 dark:from-orange-900 dark:via-orange-950 dark:to-black shadow-sm">
							{topic}
						</span>
					))
				)}
			</div>
		</div>
	);
};

export default PopularWords;
