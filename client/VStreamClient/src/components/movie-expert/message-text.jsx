import React from "react";

const MessageText = ({ text }) => {
	const parts = text.split(/(\*[^*]+\*|_[^_]+_|\\n)/g).filter(Boolean);
	return (
		<div className="text-xs leading-5">
			{parts.map((p, i) => {
				if (/^\*[^*]+\*$/.test(p)) {
					return (
						<em key={i} className="italic">
							{p.slice(1, -1)}
						</em>
					);
				}
				if (/^_[^_]+_$/.test(p)) {
					return (
						<em key={i} className="italic">
							{p.slice(1, -1)}
						</em>
					);
				}
				if (p === "\\n") {
					return <br key={i} />;
				}
				return <span key={i}>{p}</span>;
			})}
		</div>
	);
};

export default MessageText;
