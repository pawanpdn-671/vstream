import { Button } from "@/components/shared/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
	return (
		<section className="py-20 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto">
				<div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 p-12 lg:p-16">
					<div className="absolute inset-0 bg-linear-to-br from-red-500/10 via-transparent to-orange-500/10 pointer-events-none" />

					<div className="relative z-10 text-center space-y-6">
						<h2 className="text-4xl lg:text-5xl font-bold font-poppins">
							Ready to Discover Your Next Favorite Movie?
						</h2>

						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Join millions of movie lovers and experience AI-powered recommendations tailored just for you.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
							<Button size="lg" className="text-white gap-2">
								Start Free Trial
								<ArrowRight className="w-4 h-4" />
							</Button>
							<Button size="lg" variant="outline" className="border-border hover:bg-muted bg-transparent">
								Learn More
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
