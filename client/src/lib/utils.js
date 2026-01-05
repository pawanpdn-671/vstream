import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export function getInitials(input, lastName) {
	let first = "";
	let last = "";

	if (typeof input === "object" && input !== null) {
		first = input.first_name ?? input.firstName ?? "";
		last = input.last_name ?? input.lastName ?? "";
	} else if (typeof input === "string" && !lastName) {
		const parts = input.trim().split(/\s+/);
		first = parts[0] ?? "";
		last = parts[1] ?? "";
	} else {
		first = input ?? "";
		last = lastName ?? "";
	}

	const safeFirst = first?.trim()?.[0]?.toUpperCase() ?? "";
	const safeLast = last?.trim()?.[0]?.toUpperCase() ?? "";

	return `${safeFirst}${safeLast}`;
}
