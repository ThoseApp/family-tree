import LandingHero from "@/components/landing/hero";
import LandingNav from "@/components/landing/nav-bar";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col relative">
      {/* NAVBAR */}
      <LandingNav />

      {/* HERO SECTION */}
      {/* <LandingHero /> */}
    </main>
  );
}
