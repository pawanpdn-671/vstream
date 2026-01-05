import { CTA } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { AIShowcase } from "@/components/landing/showcase";
import { Testimonials } from "@/components/landing/testimonial";
import React from "react";

const LandingPage = () => {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<Header />
			<Hero />
			<Features />
			<AIShowcase />
			<Testimonials />
			<CTA />
			<Footer />
		</div>
	);
};

export default LandingPage;
