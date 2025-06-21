import CTASection from "@/components/CTA";
import FeaturesSection from "@/components/Features";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar"

const Home = () => {
  return (
    <section className="bg-[#fdfdfb] text-[#1a1a1a] ">
      <Navbar />
      <HeroSection />
      <FeaturesSection/>
      <CTASection />
      <Footer />
    </section>
  );
}

export default Home