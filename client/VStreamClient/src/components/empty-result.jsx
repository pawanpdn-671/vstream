import { Button } from "@/components/shared/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/shared/empty";

export function EmptyResult({ icon: Icon, title, description, buttonText, buttonAction, noAction = false, iconColor }) {
	return (
		<Empty>
			<EmptyHeader>
				{Icon && <Icon className={`${iconColor ? `text-${iconColor}` : ""}`} size={48} />}
				<EmptyTitle>{title}</EmptyTitle>
				<EmptyDescription>{description}</EmptyDescription>
			</EmptyHeader>
			{!noAction && (
				<EmptyContent>
					<div className="flex gap-2">
						<Button>{buttonText}</Button>
					</div>
				</EmptyContent>
			)}
		</Empty>
	);
}
