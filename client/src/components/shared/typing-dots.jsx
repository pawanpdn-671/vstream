import React from "react";

const TypingDots = () => {
	return (
		<div className="flex space-x-1 items-center">
			<div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
			<div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
			<div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
		</div>
	);
};

export default TypingDots;
