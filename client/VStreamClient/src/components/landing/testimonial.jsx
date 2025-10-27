import { Card } from "@/components/shared/card";
import { Avatar, AvatarFallback } from "@/components/shared/avatar";
import { Star } from "lucide-react";

const testimonials = [
	{
		name: "Sarah Chen",
		role: "Movie Enthusiast",
		content:
			"VStream helped me discover movies I would never have found otherwise. The AI rankings are incredibly accurate!",
		initials: "SC",
	},
	{
		name: "Marcus Johnson",
		role: "Film Critic",
		content:
			"The Groq AI analysis is remarkably sophisticated. It understands nuance in reviews better than any algorithm I've seen.",
		initials: "MJ",
	},
	{
		name: "Elena Rodriguez",
		role: "Casual Viewer",
		content: "Finally, a streaming platform that gets my taste! The recommendations are spot-on every single time.",
		initials: "ER",
	},
];

export function Testimonials() {
	return (
		<section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
			<div className="max-w-7xl mx-auto">
				<div className="text-center space-y-4 mb-16">
					<h2 className="text-4xl lg:text-5xl font-bold font-poppins">Loved by Movie Fans</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Join millions of users who trust VStream for their movie recommendations
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					{testimonials.map((testimonial, index) => (
						<Card key={index} className="p-6 border-border hover:border-red-500/50 transition-colors">
							<div className="flex gap-1 mb-4">
								{[...Array(5)].map((_, i) => (
									<Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
								))}
							</div>

							<p className="text-muted-foreground mb-6 leading-relaxed">{testimonial.content}</p>

							<div className="flex items-center gap-3">
								<Avatar className="w-10 h-10">
									<AvatarFallback className="bg-linear-to-br from-red-500 to-orange-500 text-white font-bold">
										{testimonial.initials}
									</AvatarFallback>
								</Avatar>
								<div>
									<p className="font-bold font-poppins text-sm">{testimonial.name}</p>
									<p className="text-xs text-muted-foreground">{testimonial.role}</p>
								</div>
							</div>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
