import { Button } from "@/components/shared/button";
import { Play, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Hero() {
	const navigate = useNavigate();

	return (
		<section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
			<div className="absolute inset-0 bg-linear-to-b from-red-500/10 via-transparent to-transparent pointer-events-none" />

			<div className="max-w-7xl mx-auto relative z-10">
				<div className="grid lg:grid-cols-2 gap-12 items-center">
					<div className="space-y-8">
						<div className="space-y-4">
							<div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
								<Zap className="w-4 h-4 text-red-500" />
								<span className="text-sm text-red-400">Powered by Groq AI</span>
							</div>

							<h1 className="text-5xl lg:text-6xl font-bold font-poppins leading-tight text-balance">
								Discover Movies{" "}
								<span className="bg-linear-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
									Your Way
								</span>
							</h1>

							<p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
								Experience intelligent movie recommendations powered by advanced AI. Get personalized rankings
								based on real reviews and your unique taste.
							</p>
						</div>

						<div className="flex flex-col sm:flex-row gap-4">
							<Button
								size="lg"
								onClick={() => navigate("/home")}
								className="bg-linear-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white gap-2">
								<Play className="w-4 h-4" />
								Start Watching
							</Button>
						</div>
					</div>

					<div className="relative h-96 lg:h-full min-h-96">
						<div className="absolute inset-0 bg-linear-to-br from-red-500/20 to-orange-500/20 rounded-2xl blur-3xl" />
						<div className="relative h-full bg-linear-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center overflow-hidden">
							<div className="text-center space-y-4">
								<div className="w-20 h-20 bg-linear-to-br from-red-500 to-orange-500 rounded-full mx-auto flex items-center justify-center">
									<Play className="w-10 h-10 text-white fill-white" />
								</div>
								<p className="text-muted-foreground">Featured Movie</p>
								<p className="font-bold text-lg">AI-Ranked #1</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
