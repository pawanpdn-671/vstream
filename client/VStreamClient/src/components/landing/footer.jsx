import { Sparkles } from "lucide-react";

export function Footer() {
	return (
		<footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
			<div className="max-w-7xl mx-auto">
				<div className="grid md:grid-cols-4 gap-8 mb-8">
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
								<Sparkles className="w-5 h-5 text-white" />
							</div>
							<span className="font-bold font-poppins">VStream</span>
						</div>
						<p className="text-sm text-muted-foreground">AI-powered movie recommendations for everyone.</p>
					</div>

					<div className="space-y-3">
						<h4 className="font-bold font-poppins">Product</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<a href="#features" className="hover:text-foreground transition-colors">
									Features
								</a>
							</li>
							<li>
								<a href="#testimonials" className="hover:text-foreground transition-colors">
									Testimonials
								</a>
							</li>
							<li>
								<a
									href="https://github.com/pawanpdn-671/vstream/tree/main/server/VStreamServer"
									className="hover:text-foreground transition-colors">
									API
								</a>
							</li>
						</ul>
					</div>

					{/* <div className="space-y-3">
						<h4 className="font-bold font-poppins">Company</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<a href="#" className="hover:text-foreground transition-colors">
									About
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-foreground transition-colors">
									Blog
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-foreground transition-colors">
									Careers
								</a>
							</li>
						</ul>
					</div> */}

					{/* <div className="space-y-3">
						<h4 className="font-bold font-poppins">Legal</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>
								<a href="#" className="hover:text-foreground transition-colors">
									Privacy
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-foreground transition-colors">
									Terms
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-foreground transition-colors">
									Contact
								</a>
							</li>
						</ul>
					</div> */}
				</div>

				<div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
					<p>&copy; {new Date().getFullYear()} VStream. All rights reserved.</p>
					<div className="flex gap-6 mt-4 sm:mt-0">
						<a
							href="https://www.github.com/pawanpdn-671"
							target={"_blank"}
							className="hover:text-foreground transition-colors">
							@PawanPdn
						</a>
						<a
							href="https://www.github.com/pawanpdn-671/vstream"
							target={"_blank"}
							className="hover:text-foreground transition-colors">
							GitHub
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
