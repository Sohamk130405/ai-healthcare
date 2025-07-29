import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
}
