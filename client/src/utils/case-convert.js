export const toSnakeCase = (obj) => {
	if (Array.isArray(obj)) {
		return obj.map(toSnakeCase);
	} else if (obj && typeof obj === "object") {
		return Object.keys(obj).reduce((acc, key) => {
			const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
			acc[snakeKey] = toSnakeCase(obj[key]);
			return acc;
		}, {});
	}
	return obj;
};
