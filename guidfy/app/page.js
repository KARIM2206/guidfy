import Image from "next/image";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FautureSction";
import TestimonialsSection from "./components/SuccessStories";


export default function Home() {
  return (
    <div className=" ">
  <HeroSection />
<FeaturesSection />
<TestimonialsSection />
    </div>
  );
}
