import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import FeaturedProperties from "@/components/FeaturedProperties";
import HowItWorks from "@/components/HowItWorks";
import OurServices from "@/components/OurServices";
import ContactSection from "@/components/ContactSection";
import CTASection from "@/components/CTASection";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="pt-10">
        <Hero />
        <FeaturedProperties />
        <HowItWorks />
        <OurServices />
        <ContactSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
