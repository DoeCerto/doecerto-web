import { HeroSection } from '@/components/specific/LandingPage/HeroSection';
import { WhatIsDoeCerto } from '@/components/specific/LandingPage/WhatIsDoeCerto';
import { HowItWorks } from '@/components/specific/LandingPage/HowItWorks';
import { VerificationBadge } from '@/components/specific/LandingPage/VerificationBadge';
import { WhyChooseUs } from '@/components/specific/LandingPage/WhyChooseUs';
import { VisitsCarousel } from '@/components/specific/LandingPage/VisitsCarousel';
import { FAQ } from '@/components/specific/LandingPage/FAQ';
import { Footer } from '@/components/specific/LandingPage/Footer';
import SmoothScroller from "@/components/shared/SmoothScroller";
import "@/components/specific/LandingPage/landing.css";

export default function Home() {
  return (
    // Colocamos o "landing-scope" para ativar nosso CSS isolado e deixamos o fundo branco
    <main className="landing-scope flex flex-col min-h-screen bg-white">
      
      {/* O SmoothScroller agora abraça TODA a sua Landing Page */}
      <SmoothScroller>
        <HeroSection />
        <WhatIsDoeCerto />
        <HowItWorks />
        <VerificationBadge />
        <WhyChooseUs />
        <VisitsCarousel />
        <FAQ />
        <Footer />
      </SmoothScroller>
      
    </main>
  );
}