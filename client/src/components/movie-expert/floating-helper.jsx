import React, { useEffect, useRef, useState } from "react";
import { Button } from "../shared/button";
import { Input } from "../shared/input";
import { Minimize2, RotateCcw, Send, Sparkles } from "lucide-react";
import { Label } from "../shared/label";
import LogoText from "../shared/logo-text";
import { useMutation } from "@tanstack/react-query";
import { userApi } from "@/service/userApi";
import MessageText from "./message-text";
import TypingDots from "../shared/typing-dots";
import { SUGGESTED_PROMPTS } from "@/utils/constants";
import { Separator } from "../shared/separator";

export default function FloatingMovieChat({
	position = "bottom-right", // bottom-right | bottom-left
	subtitle = "Your Movie Expert",
}) {
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState([
		{
			id: 1,
			role: "assistant",
			content: "Hi! I'm VStream — ask me movie related topics eg.recommendations, explanations, trivia, etc.",
		},
	]);
	const [input, setInput] = useState("");
	const [sending, setSending] = useState(false);
	const [hasInteracted, setHasInteracted] = useState(false);
	const panelRef = useRef(null);
	const messagesRef = useRef(null);
	const toggleButtonRef = useRef(null);
	const posClass = position === "bottom-left" ? "left-4" : "right-2 xs:right-4";

	const { mutate: getExpert } = useMutation({
		mutationFn: userApi.getExpertHelp,
		onSuccess: (data) => {
			setMessages((prev) => [
				...prev,
				{
					id: Date.now(),
					role: "assistant",
					content: data?.response || "Sorry, I couldn't generate a reply.",
				},
			]);
			setSending(false);
			setInput("");
		},
		onError: (err) => {
			setSending(false);
			console.error(err);
			setMessages((prev) => [
				...prev,
				{
					id: Date.now(),
					role: "assistant",
					content: "⚠️ Something went wrong — please try again.",
				},
			]);
		},
	});

	useEffect(() => {
		if (messagesRef.current) {
			messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
		}
	}, [messages, open]);

	function handleSend(text) {
		if (!text?.trim()) return;
		setHasInteracted(true);
		setMessages((prev) => [
			...prev,
			{
				id: Date.now(),
				role: "user",
				content: text,
			},
		]);

		setSending(true);
		setInput("");

		const filteredMessages = [...messages.slice(1), { role: "user", content: text }].map(({ id, ...rest }) => rest);

		const payload = { messages: filteredMessages };

		getExpert(payload);
	}

	useEffect(() => {
		function onKey(e) {
			if (e.key === "Escape" && open) {
				setOpen(false);
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, setOpen]);

	function handleResetChat() {
		setMessages([
			{
				id: 1,
				role: "assistant",
				content: "Hi! I'm VStream — ask me for recommendations, explanations, trivia, or cast info.",
			},
		]);
		setInput("");
		setHasInteracted(false);
	}

	return (
		<div className={`fixed ${posClass} bottom-4 md:bottom-6 z-50 touch-auto`}>
			<div
				ref={panelRef}
				className={`transform transition-all duration-200 ${
					open
						? "translate-y-0 opacity-100 pointer-events-auto"
						: "translate-y-4 opacity-0 pointer-events-none hidden"
				}`}
				style={{ transitionProperty: "transform, opacity" }}
				aria-hidden={!open}>
				<div
					className="w-80 md:w-96 
               rounded-xl 
               bg-background 
               border border-border/50 
               shadow-[0_2px_10px_rgba(0,0,0,0.08),0_8px_40px_rgba(0,0,0,0.12)] 
               dark:shadow-[0_2px_10px_rgba(0,0,0,0.5),0_8px_40px_rgba(0,0,0,0.8)]
               transition-all 
               duration-300 
               hover:shadow-[0_4px_15px_rgba(0,0,0,0.12),0_10px_50px_rgba(0,0,0,0.16)]
               dark:hover:shadow-[0_4px_15px_rgba(0,0,0,0.6),0_10px_50px_rgba(0,0,0,0.9)]
               overflow-hidden">
					<div className="flex items-center justify-between px-4 py-3">
						<div className="flex flex-col">
							<LogoText size="sm" textSize="sm" />
							<div className="text-xs text-muted-foreground pl-6">{subtitle}</div>
						</div>

						<div className="flex items-center gap-2">
							<Button
								title="Reset Chat"
								size="icon"
								variant="ghost"
								onClick={handleResetChat}
								className="h-auto p-1.5 w-auto"
								aria-label="Reset chat">
								<RotateCcw size={18} className="text-muted-foreground" />
							</Button>
							<Button
								title="Minimize"
								size="icon"
								variant="ghost"
								onClick={() => setOpen(false)}
								className="h-auto p-1.5 w-auto"
								aria-label="Close chat">
								<Minimize2 size={24} className="w-[18px]! h-[18px]! text-muted-foreground" />
							</Button>
						</div>
					</div>
					<Separator />

					<div ref={messagesRef} className={`p-3 space-y-3 overflow-y-auto h-[50vh] max-h-[500px]`}>
						{messages?.map((m) => (
							<div key={m.id} className={`flex ${m.role === "assistant" ? "justify-start" : "justify-end"}`}>
								<div
									className={`${
										m.role === "assistant"
											? "bg-secondary"
											: "bg-linear-to-r from-red-400 via-orange-400 to-orange-400 text-white"
									} max-w-[82%] wrap-break-word px-2 py-1 rounded-sm`}>
									<MessageText text={m?.content} />
								</div>
							</div>
						))}
						{sending && (
							<div className="flex justify-start">
								<div className="bg-secondary max-w-[82%] px-3 py-2 rounded-lg">
									<TypingDots />
								</div>
							</div>
						)}
						{!hasInteracted && (
							<div className="mt-auto pb-2">
								<div className="flex gap-2 flex-wrap">
									{SUGGESTED_PROMPTS?.map((s) => (
										<Button
											key={s}
											size="sm"
											onClick={() => handleSend(s)}
											variant="outline"
											className="text-xs">
											{s}
										</Button>
									))}
								</div>
							</div>
						)}
					</div>

					<div className="p-3 border-t">
						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleSend(input);
							}}
							className="flex items-center gap-2 relative">
							<Label htmlFor="fmchat_input" className="sr-only">
								Message
							</Label>
							<Input
								id="fmchat_input"
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										handleSend(input);
									}
								}}
								placeholder="Ask about movies...'"
								className="rounded-3xl pr-10 text-xs!"
								aria-label="Type your message"
								disabled={sending}
							/>
							<Button
								type="submit"
								disabled={sending}
								size="icon"
								className="rounded-full absolute right-0 top-0"
								aria-label="Send message">
								<Send />
							</Button>
						</form>
					</div>
				</div>
			</div>

			<div className="mt-1 sm:mt-3 flex justify-end">
				<Button
					ref={toggleButtonRef}
					onClick={() => {
						if (open) {
							requestAnimationFrame(() => {
								toggleButtonRef.current?.focus();
							});
						}
						setOpen((o) => !o);
					}}
					aria-expanded={open}
					aria-label={open ? "Close movie chat" : "Open movie chat"}
					className="relative inline-flex items-center justify-center w-12 h-12 xs:w-14 xs:h-14 rounded-full shadow-lg transform hover:scale-105 transition-transform focus:outline-none">
					<span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 font-semibold">
						AI
					</span>
					<div className="text-2xl">
						<Sparkles className="text-white w-5! h-5!" size={24} />
					</div>
				</Button>
			</div>
		</div>
	);
}
