import { Card } from "@/components/shared/card";
import { Badge } from "@/components/shared/badge";
import { Star } from "lucide-react";

const movies = [
	{
		title: "Cinematic Masterpiece",
		rating: 9.2,
		reviews: 15420,
		aiScore: 94,
		trend: "+12%",
	},
	{
		title: "Epic Adventure",
		rating: 8.8,
		reviews: 12890,
		aiScore: 89,
		trend: "+8%",
	},
	{
		title: "Thrilling Drama",
		rating: 8.5,
		reviews: 10240,
		aiScore: 85,
		trend: "+5%",
	},
];

export function AIShowcase() {
	return (
		<section id="ai" className="py-20 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				<div className="text-center space-y-4 mb-16">
					<h2 className="text-4xl lg:text-5xl font-bold font-poppins">AI Ranking in Action</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						See how Groq AI intelligently ranks movies based on comprehensive review analysis
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					{movies.map((movie, index) => (
						<Card
							key={index}
							className="p-6 border-border hover:border-red-500/50 transition-all hover:shadow-lg hover:shadow-red-500/10">
							<div className="space-y-4">
								<div className="flex items-start justify-between">
									<h3 className="font-bold font-poppins text-lg flex-1">{movie.title}</h3>
									<Badge className="bg-linear-to-r from-red-500 to-orange-500 text-white">#{index + 1}</Badge>
								</div>

								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">User Rating</span>
										<div className="flex items-center gap-1">
											<Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
											<span className="font-bold">{movie.rating}</span>
										</div>
									</div>

									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">Reviews Analyzed</span>
										<span className="font-bold">{movie.reviews.toLocaleString()}</span>
									</div>

									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">AI Score</span>
										<div className="flex items-center gap-2">
											<div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
												<div
													className="h-full bg-linear-to-r from-red-500 to-orange-500 rounded-full"
													style={{ width: `${movie.aiScore}%` }}
												/>
											</div>
											<span className="font-bold text-sm">{movie.aiScore}%</span>
										</div>
									</div>

									<div className="pt-2 border-t border-border">
										<span className="text-sm text-green-500 font-semibold">{movie.trend} this week</span>
									</div>
								</div>
							</div>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
