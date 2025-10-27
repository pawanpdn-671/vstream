import { Card } from "@/components/shared/card";
import { Brain, TrendingUp, Users, Zap } from "lucide-react";

const features = [
	{
		icon: Brain,
		title: "AI-Powered Rankings",
		description: "Advanced Groq AI analyzes thousands of reviews to rank movies intelligently for you.",
	},
	{
		icon: TrendingUp,
		title: "Personalized Recommendations",
		description: "Get tailored suggestions based on your viewing history and preferences.",
	},
	{
		icon: Users,
		title: "Community Reviews",
		description: "Read authentic reviews from millions of movie enthusiasts worldwide.",
	},
	{
		icon: Zap,
		title: "Lightning Fast",
		description: "Instant AI analysis and recommendations powered by cutting-edge technology.",
	},
];

export function Features() {
	return (
		<section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
			<div className="max-w-7xl mx-auto">
				<div className="text-center space-y-4 mb-16">
					<h2 className="text-4xl lg:text-5xl font-bold font-poppins">Why Choose VStream?</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Experience the future of movie discovery with intelligent AI-powered recommendations
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
					{features.map((feature, index) => {
						const Icon = feature.icon;
						return (
							<Card key={index} className="p-6 border-border hover:border-red-500/50 transition-colors group">
								<div className="w-12 h-12 bg-linear-to-br from-red-500/20 to-orange-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:from-red-500/30 group-hover:to-orange-500/30 transition-colors">
									<Icon className="w-6 h-6 text-red-500" />
								</div>
								<h3 className="font-bold font-poppins mb-2">{feature.title}</h3>
								<p className="text-sm text-muted-foreground">{feature.description}</p>
							</Card>
						);
					})}
				</div>
			</div>
		</section>
	);
}
