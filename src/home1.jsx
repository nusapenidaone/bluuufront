/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { Check, Star, Plus, Camera, ArrowRight, Menu, X, Globe, Coins } from "lucide-react";
import Footer from "./components/common/Footer";
import { cn } from "./lib/utils";

const STATIC_GALLERY = [
  { id: 1, thumb: "https://bluuu.tours/storage/app/media/image-30-1.jpg", src: "https://bluuu.tours/storage/app/media/image-30-1.jpg" },
  { id: 2, thumb: "https://bluuu.tours/storage/app/uploads/public/689/100/4eb/6891004eb5ab4353781057.webp", src: "https://bluuu.tours/storage/app/uploads/public/689/100/4eb/6891004eb5ab4353781057.webp" },
  { id: 3, thumb: "https://bluuu.tours/storage/app/media/image-30-1.jpg", src: "https://bluuu.tours/storage/app/media/image-30-1.jpg" },
  { id: 4, thumb: "https://bluuu.tours/storage/app/uploads/public/689/100/4eb/6891004eb5ab4353781057.webp", src: "https://bluuu.tours/storage/app/uploads/public/689/100/4eb/6891004eb5ab4353781057.webp" },
  { id: 5, thumb: "https://bluuu.tours/storage/app/media/image-30-1.jpg", src: "https://bluuu.tours/storage/app/media/image-30-1.jpg" }
];

const FADE_UP = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const STAGGER = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const CustomNavbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-primary-950/95 backdrop-blur-md py-4 shadow-lg border-b border-white/10" : "bg-transparent py-6"
      )}
    >
      <div className="container px-6 mx-auto max-w-[1400px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Using text for logo to ensure it's white as requested, or invert filter */}
            <span className="text-2xl font-bold text-white tracking-widest uppercase">BLUUU</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-white/80 hover:text-white transition">Tours</a>
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-white/80 hover:text-white transition">Comfort</a>
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-white/80 hover:text-white transition">Routes</a>
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-white/80 hover:text-white transition">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="hidden md:block px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-full transition shadow-lg">
              Check Availability
            </button>
            <button className="md:hidden text-white">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default function Home1() {
  const openFancybox = (startIndex = 0) => {
    Fancybox.show(
      STATIC_GALLERY.map((item) => ({
        src: item.src,
        thumb: item.thumb,
      })),
      { startIndex }
    );
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-primary-950 text-white selection:bg-primary-400/20 selection:text-primary-400">
      <CustomNavbar />
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen w-full flex flex-col overflow-hidden bg-primary-950">
        {/* Background Video */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-primary-950">
          <video 
            src="https://bluuu.tours/storage/app/media/video-xl.webm" 
            poster="https://bluuu.tours/storage/app/media/image-30-1.jpg"
            autoPlay loop muted playsInline
            className="w-full h-full object-cover brightness-75 scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/30 to-transparent"></div>
        </div>

        {/* Hero Content Wrapper */}
        <div className="relative z-10 w-full flex-1 flex flex-col container px-4 max-w-6xl mx-auto pt-32 pb-12">
          
          {/* Main Title Center */}
          <motion.div 
            initial="hidden" animate="show" variants={STAGGER}
            className="flex-1 flex flex-col items-center justify-center text-center mt-8"
          >
            <motion.div variants={FADE_UP} className="mb-8 rounded-full bg-white/5 backdrop-blur-md px-5 py-2 border border-white/10 shadow-lg">
              <span className="text-xs font-bold uppercase tracking-widest text-primary-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400"></span>
                Award-winning tours
              </span>
            </motion.div>
            
            <motion.h1 variants={FADE_UP} className="text-5xl sm:text-7xl leading-none font-bold tracking-tight text-white mb-6 drop-shadow-2xl">
              Discover <span className="italic font-medium text-primary-400">Nusa Penida</span>
            </motion.h1>

            <motion.p variants={FADE_UP} className="mt-3 max-w-2xl text-lg sm:text-xl text-neutral-200 mb-12 drop-shadow-md leading-relaxed">
              Manta rays, snorkeling, diving, and a land tour <br></br> all in one unforgettable day from Bali.
            </motion.p>

            <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
              {/* PRIMARY BUTTON */}
              <button className="px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-full transition-transform active:scale-95 w-full sm:w-auto text-lg shadow-primary-500/30 shadow-xl">
                View Tours
              </button>
              {/* GLASS PILL BUTTON */}
              <button className="px-10 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-full transition-all active:scale-95 w-full sm:w-auto text-lg shadow-lg">
                How It Works
              </button>
            </motion.div>
          </motion.div>

          {/* Bottom Ratings bar */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-auto flex flex-col items-center w-full pt-16"
          >
            <div className="flex flex-wrap items-center gap-8 sm:gap-14 justify-center bg-transparent backdrop-blur-sm border-white/10 px-8 py-5 rounded-2xl">
               <Rating content="GOOGLE" score="4.9" />
               <Rating content="TRIPADVISOR" score="4.9" />
               <Rating content="AIRBNB" score="4.9" />
               <div className="hidden sm:block w-[1px] h-14 bg-white/20"></div>
               <div className="flex flex-col items-start translate-y-1">
                 <span className="text-2xl sm:text-3xl font-bold text-white leading-none mb-1">10,629</span>
                 <span className="text-xs uppercase font-bold tracking-widest text-neutral-400">Reviews</span>
               </div>
            </div>
            <div className="mt-8 flex flex-col items-center gap-3 text-neutral-400 opacity-60">
              <span className="text-xs uppercase font-bold tracking-widest">Explore</span>
              <div className="w-[1px] h-10 bg-neutral-400/50"></div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 2. TOUR TYPE SECTION */}
      <section className="py-16 md:py-24 lg:py-32 bg-white text-primary-950 border-t border-neutral-100">
        <div className="container max-w-[1400px] mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
            className="text-center mb-10 md:mb-16"
          >
            <span className="text-xs font-black uppercase tracking-widest text-primary-400 mb-4 block">002 / TOUR FORMAT</span>
            <h2 className="text-4xl md:text-5xl leading-tight font-bold tracking-tight mb-5 text-primary-950">
              Choose your <span className="italic font-medium text-primary-400">tour type</span>
            </h2>
            <p className="text-primary-950/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Same island, same iconic spots, different experience. Pick the format that fits your group best.
            </p>
          </motion.div>
          
          <MobileSlider gridClass="lg:grid-cols-2 max-w-[1240px] mx-auto">
            {/* Shared Tour Card */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}
               className="w-10/12 shrink-0 md:w-full min-w-0 md:flex-auto relative overflow-hidden rounded-5xl group min-h-96 md:aspect-square lg:aspect-[4/3] flex flex-col justify-end p-6 md:p-10 shadow-xl hover:shadow-2xl transition-shadow duration-500"
            >
               <img 
                 src="https://bluuu.tours/storage/app/media/image-30-1.jpg" 
                 alt="Shared Tour"
                 className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] ease-out group-hover:scale-105"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/40 to-transparent"></div>
               
               <div className="relative z-10 text-white flex flex-col items-start w-full">
                 <div className="inline-block px-4 py-2 rounded-full bg-primary-400 text-primary-950 text-xs sm:text-xs font-black tracking-widest mb-4 md:mb-6 shadow-xl">
                   BEST VALUE
                 </div>
                 <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 drop-shadow-xl tracking-tight">Shared Tour</h3>
                 <p className="text-white/80 mb-6 md:mb-8 max-w-[340px] drop-shadow-md text-sm md:text-sm leading-relaxed mix-blend-screen">
                   Explore Nusa Penida with other travellers on a guided full-day trip. Affordable, social, and smooth from pickup to drop-off.
                 </p>
                 <div className="w-full flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 text-sm md:text-sm font-semibold border-t border-white/20 pt-5 md:pt-6 mt-2">
                   <span className="flex items-center gap-2 text-white/90"><div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>Up to 10 guests</span>
                   <span className="flex items-center gap-2 text-white/90"><div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>Fixed departure</span>
                   <span className="text-2xl md:text-3xl font-bold text-primary-400 sm:ml-auto drop-shadow-sm">from $77</span>
                 </div>
               </div>
            </motion.div>

            {/* Private Tour Card */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: 0.2 }}
               className="w-10/12 shrink-0 md:w-full min-w-0 md:flex-auto relative overflow-hidden rounded-5xl group min-h-96 md:aspect-square lg:aspect-[4/3] flex flex-col justify-end p-6 md:p-10 shadow-xl hover:shadow-2xl transition-shadow duration-500"
            >
               <img 
                 src="https://bluuu.tours/storage/app/uploads/public/689/100/4eb/6891004eb5ab4353781057.webp" 
                 alt="Private Charter"
                 className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] ease-out group-hover:scale-105"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/40 to-transparent"></div>
               
               <div className="relative z-10 text-white flex flex-col items-start w-full">
                 <div className="inline-block px-4 py-2 rounded-full bg-primary-600 text-white text-xs sm:text-xs font-black tracking-widest mb-4 md:mb-6 shadow-xl">
                   PRIVATE
                 </div>
                 <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 drop-shadow-xl tracking-tight">Private Charter</h3>
                 <p className="text-white/80 mb-6 md:mb-8 max-w-[340px] drop-shadow-md text-sm md:text-sm leading-relaxed mix-blend-screen">
                   The entire boat is yours. Choose the timing, adjust the stops, and set the pace for your group.
                 </p>
                 <div className="w-full flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 text-sm md:text-sm font-semibold border-t border-white/20 pt-5 md:pt-6 mt-2">
                   <span className="flex items-center gap-2 text-white/90"><div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>2-45 guests</span>
                   <span className="flex items-center gap-2 text-white/90"><div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>Flexible routing</span>
                   <div className="flex items-baseline gap-1 sm:ml-auto">
                      <span className="text-2xl md:text-3xl font-bold text-primary-400 drop-shadow-sm">from $858</span>
                      <span className="text-sm md:text-sm font-medium text-white/60">/boat</span>
                   </div>
                 </div>
               </div>
            </motion.div>
          </MobileSlider>
        </div>
      </section>

      {/* 3. COMFORT LEVEL SECITON */}
      <section className="py-16 md:py-24 lg:py-32 bg-primary-950 relative z-10 selection:bg-primary-400/20 selection:text-primary-400">
        <div className="container px-6 max-w-[1400px] mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10 md:mb-16"
          >
            <span className="text-xs font-black uppercase tracking-widest text-primary-400 mb-4 block">003 / COMFORT LEVEL</span>
            <h2 className="text-4xl md:text-5xl leading-tight font-bold tracking-tight mb-5 text-white">
              Pick your <span className="italic font-medium text-primary-400">comfort level</span>
            </h2>
            <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Same incredible route, same manta rays. Choose how much comfort, space, and extras you want on the water.
            </p>
          </motion.div>

          {/* Cards wrapper */}
          <MobileSlider gridClass="md:grid-cols-2 lg:grid-cols-3 max-w-[1240px] mx-auto items-stretch">
            <motion.div
              className="w-10/12 shrink-0 md:w-full min-w-0 md:flex-auto h-full"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.1 }}
            >
              <PricingCard 
                tier="Classic"
                price={99}
                pillLabel="BEST PRICE"
                pillColor="bg-primary-400 text-primary-950"
                desc="The essentials, done right. Everything you need, nothing you don't."
                boatInfo={"SPEEDBOAT • 12M\nMax 13 guests • Partial shade • Open deck"}
                features={[
                  "Snorkeling at 4 top spots + manta rays",
                  "Land tour to Kelingking Cliff",
                  "Lunch at cliff restaurant",
                  "Snorkel gear, towels, GoPro photos",
                  "Hotel transfer & insurance"
                ]}
                buttonText="Select Classic"
                buttonClass="bg-white/5 border border-white/20 hover:bg-white/10 text-white"
              />
            </motion.div>
            
            <motion.div
              className="w-10/12 shrink-0 md:w-full min-w-0 md:flex-auto h-full"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.2 }}
            >
              <PricingCard 
                tier="Premium"
                price={129}
                bgClass="bg-gradient-to-b from-primary-800 to-primary-950"
                pillLabel="BEST SELLER"
                pillColor="bg-orange-500 text-white"
                desc="More space, more time, more fun. Bigger boat, extra hour, sunset prosecco."
                boatInfo={"PREMIUM SPEEDBOAT • 13M • 2024-2025\nMax 13 guests • Shaded lounge • Extra deck space"}
                features={[
                  "Everything in Classic, plus:",
                  "Extra 1h on the route — more snorkeling",
                  "Lunch at La Rossa beach club",
                  "Pro photographer — 20-30 edited photos",
                  "Underwater GoPro photos & video",
                  "Sunset prosecco on the cruise back",
                  "Sound system on board"
                ]}
                buttonText="Select Premium"
                buttonClass="bg-primary-600 hover:bg-primary-700 text-white"
                isFeatured
                borderColor="border-primary-500/40"
                featureIcon={<Check className="w-5 h-5 text-orange-500 mt-[2px]" strokeWidth={2.5} />}
              />
            </motion.div>

            <motion.div
              className="w-10/12 shrink-0 md:w-full min-w-0 md:flex-auto h-full"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.3 }}
            >
              <PricingCard 
                tier="Elite"
                price={149}
                pillLabel="TOP TIER"
                pillColor="bg-yellow-400 text-primary-950"
                desc="The best we offer. Handcrafted Eldorado yacht, premium service, the most relaxed pace."
                boatInfo={"ELDORADO YACHT • 13M • 2026\nMax 13 guests • Full shade • Bow lounge with sofas"}
                features={[
                  "Everything in Premium, plus:",
                  "Brand-new Fortune Yachts Eldorado",
                  "Drone photos & video included",
                  "All photos & videos delivered next day",
                  "Free GoPro rental — shoot your own content",
                  "Lunch at luxury cliff-top hotel restaurant",
                  "Photo stop at secret spot"
                ]}
                buttonText="Select Elite"
                buttonClass="bg-white/5 border border-white/20 hover:bg-white/10 text-white"
                isFeatured
                borderColor="border-white/10"
                shadowColor="shadow-none"
                featureIcon={<Check className="w-5 h-5 text-orange-500 mt-[2px]" strokeWidth={2.5} />}
              />
            </motion.div>
          </MobileSlider>
        </div>
      </section>

      {/* 4. QUICK COMPARISON SECTION */}
      <section className="py-16 md:py-24 lg:py-32 bg-primary-950 relative z-10 selection:bg-primary-400/20 selection:text-primary-400">
        <div className="container max-w-[1240px] mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}
            className="text-center mb-10 md:mb-16"
          >
            <h3 className="text-xs font-black uppercase tracking-widest text-white/50">Quick Comparison</h3>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="w-full overflow-x-auto rounded-2xl md:rounded-5xl border border-white/5 bg-white/5 backdrop-blur-xl custom-scrollbar"
          >
            <table className="w-full min-w-[860px] text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="py-7 px-8 font-normal w-1/4 text-white/40">Feature</th>
                  <th className="py-7 px-4 text-center font-bold text-xs tracking-widest text-white/70 uppercase w-1/4">Classic</th>
                  <th className="py-7 px-4 text-center font-bold text-xs tracking-widest text-white/70 uppercase w-1/4">Premium</th>
                  <th className="py-7 px-4 text-center font-bold text-xs tracking-widest text-amber-500 uppercase w-1/4">Elite</th>
                </tr>
              </thead>
              <tbody className="text-sm sm:text-sm divide-y divide-white/5">
                <CompareRow label="Boat" c="Speedboat 12m" p="Premium 13m" e="Eldorado yacht 13m" />
                <CompareRow label="Year" c="Mixed fleet" p="2024-2025" e="2026" />
                <CompareRow label="Shade" c="Partial" p="Shaded lounge" e="Full + bow lounge" />
                <CompareRow label="Snorkeling spots" c="4 spots" p="4 spots" e="4 spots" />
                <CompareRow label="Manta rays" 
                  c={<Check className="w-5 h-5 mx-auto text-white/30" strokeWidth={3} />} 
                  p={<Check className="w-5 h-5 mx-auto text-primary-400" strokeWidth={3} />} 
                  e={<Check className="w-5 h-5 mx-auto text-amber-500" strokeWidth={3} />} />
                <CompareRow label="Extra time" c="—" p={<span className="text-primary-400 font-semibold">+1 hour</span>} e={<span className="text-amber-500 font-semibold">+1 hour</span>} />
                <CompareRow label="Lunch" c="Cliff restaurant" p="La Rossa beach club" e="Luxury restaurant" />
                <CompareRow label="Photographer" c="—" p={<span className="text-primary-400 font-semibold">20-30 photos</span>} e={<span className="text-amber-500 font-semibold">20-30 photos</span>} />
                <CompareRow label="Drone" c="—" p="—" e={<Check className="w-5 h-5 mx-auto text-amber-500" strokeWidth={3} />} />
                <CompareRow label="Sunset prosecco" c="—" p={<Check className="w-5 h-5 mx-auto text-primary-400" strokeWidth={3} />} e={<Check className="w-5 h-5 mx-auto text-amber-500" strokeWidth={3} />} />
                <tr className="bg-white/5">
                  <td className="py-8 px-8 text-white/50 font-medium">Price / person</td>
                  <td className="py-8 px-4 text-center font-bold text-white text-lg">$99</td>
                  <td className="py-8 px-4 text-center font-bold text-primary-400 text-xl">$129</td>
                  <td className="py-8 px-4 text-center font-bold text-amber-500 text-xl">$149</td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* 5. PRIVATE ROUTES */}
      <section className="py-16 md:py-24 lg:py-32 bg-orange-50 text-primary-950 border-t border-neutral-100 relative z-10">
        <div className="container max-w-[1400px] mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
            className="mb-10 md:mb-16 text-center"
          >
            <span className="text-xs font-black uppercase tracking-widest text-primary-600 mb-4 block">004 / PRIVATE ROUTES</span>
            <h2 className="text-4xl md:text-5xl leading-tight font-bold tracking-tight mb-5 text-primary-950">
              Pick your <span className="italic font-medium text-primary-600">private route</span>
            </h2>
            <p className="text-secondary-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Your own yacht, your own pace — select the route for your group.
            </p>
          </motion.div>

          <MobileSlider gridClass="md:grid-cols-3 items-stretch">
            <div className="w-10/12 shrink-0 md:w-full min-w-0 md:flex-auto h-full">
              <RouteCard 
                img="https://bluuu.tours/storage/app/media/image-30-1.jpg"
                title="Classic Route"
                desc="A comfortable one-day journey through the most beautiful spots in Nusa Penida."
                pills={["Swim with mantas", "Kelingking Cliff", "Snorkeling"]}
              />
            </div>
            <div className="w-10/12 shrink-0 md:w-full min-w-0 md:flex-auto h-full">
              <RouteCard 
                img="https://bluuu.tours/storage/app/uploads/public/689/100/4eb/6891004eb5ab4353781057.webp"
                title="Chill & Relax"
                desc="Snorkel if you want, or just swim and relax — beautiful spots, prosecco, and sunshine."
                pills={["Lago Pontoon", "Scenic cruise", "Calm bays"]}
              />
            </div>
            <div className="w-10/12 shrink-0 md:w-full min-w-0 md:flex-auto h-full">
              <RouteCard 
                img="https://bluuu.tours/storage/app/media/image-30-1.jpg"
                title="Family-First Day"
                desc="Fewer stops, more time at each — kids can swim, play, and won't feel rushed."
                pills={["Kid-friendly", "Calm bays", "Flexible"]}
              />
            </div>
          </MobileSlider>
        </div>
      </section>

      {/* 6. YOUR DAY TIMELINE */}
      <section className="py-16 md:py-24 lg:py-32 bg-white text-primary-950 border-t border-neutral-100 relative z-10">
        <div className="container max-w-4xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8 }}
            className="text-center mb-12 md:mb-20"
          >
            <span className="text-xs font-black uppercase tracking-widest text-primary-400 mb-4 block">005 / YOUR DAY</span>
            <h2 className="text-4xl md:text-5xl leading-tight font-bold tracking-tight mb-5 text-primary-950">
              What your day <span className="italic font-medium text-primary-400">looks like</span>
            </h2>
            <p className="text-secondary-600 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              A smooth full-day flow with snorkeling, lunch, land highlights, and manta time.
            </p>
          </motion.div>

          <div className="ml-4 sm:ml-8 space-y-0 text-left">
            <TimelineItem 
              color="text-primary-400" 
              time="MORNING" 
              title="Cruise & Snorkel" 
              desc="Board the yacht and visit curated snorkel spots with calm, crystal-clear waters. Your crew guides you to the best reefs and marine life." 
              isLast={false}
            />
            <TimelineItem 
              color="text-primary-950" 
              time="MIDDAY" 
              title="Lunch & Relax" 
              desc="Lunch with panoramic ocean views and time to refresh before the second half of the day." 
              isLast={false}
            />
            <TimelineItem 
              color="text-orange-500" 
              time="AFTERNOON" 
              title="Land Highlights" 
              desc="Short land stops for iconic viewpoints — Kelingking Cliff, Crystal Bay, and photo moments at every turn." 
              isLast={false}
            />
            <TimelineItem 
              color="text-primary-400" 
              time="LATE AFTERNOON" 
              title="Swim with Mantas" 
              desc="Manta ray swim (conditions permitting), guided by the crew in one of the world's best manta spots." 
              isLast={false}
            />
            <TimelineItem 
              color="text-orange-500" 
              time="SUNSET" 
              title="Back to Bali" 
              desc="Return crossing with sunset views. Premium and Elite enjoy prosecco on the cruise back." 
              isLast={true}
            />
          </div>
        </div>
      </section>

      {/* 7. ALL INCLUSIVE */}
      <section className="py-16 md:py-24 lg:py-32 bg-primary-950 text-white relative z-10 selection:bg-primary-400/20 selection:text-primary-400">
        <div className="container max-w-[1240px] mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8 }}
            className="text-center mb-10 md:mb-16"
          >
            <span className="text-xs font-black uppercase tracking-widest text-primary-400 mb-4 block">006 / ALL INCLUSIVE</span>
            <h2 className="text-4xl md:text-5xl leading-tight font-bold tracking-tight mb-5 text-white">
              Everything is <span className="italic font-medium text-primary-400">already covered</span>
            </h2>
            <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Simple, transparent inclusions — so you can focus on the day, not the fine print.
            </p>
          </motion.div>

          <MobileSlider gridClass="sm:grid-cols-2 lg:grid-cols-3 items-stretch">
             <div className="w-10/12 shrink-0 md:w-full min-w-0 md:flex-auto h-full"><InclusiveCard emoji="🛥️" title="Comfort Yacht" desc="Premium seating, a smoother ride, and attentive crew service all day." /></div>
             <div className="w-10/12 shrink-0 md:w-full min-w-0 md:flex-auto h-full"><InclusiveCard emoji="🍲" title="Curated Lunch" desc="Lunch with ocean views and thoughtful service to recharge the day." /></div>
             <div className="w-10/12 shrink-0 md:w-full min-w-0 md:flex-auto h-full"><InclusiveCard emoji="⛰️" title="Land Highlights" desc="Short land stops for iconic views, photos, and a relaxed pace." /></div>
             <div className="w-10/12 shrink-0 md:w-full min-w-0 md:flex-auto h-full"><InclusiveCard emoji="📷" title="Underwater GoPro" desc="Underwater GoPro coverage keeps your snorkel moments on film." /></div>
             <div className="w-10/12 shrink-0 md:w-full min-w-0 md:flex-auto h-full"><InclusiveCard emoji="🥽" title="Snorkeling Gear" desc="High-quality snorkeling gear supplied for every guest." /></div>
             <div className="w-10/12 shrink-0 md:w-full min-w-0 md:flex-auto h-full"><InclusiveCard emoji="🎫" title="All Entrance Tickets" desc="Entrance fees and passes handled so you can skip the queues." /></div>
          </MobileSlider>
        </div>
      </section>

      {/* 8. WHAT GUESTS SAY */}
      <section className="py-16 md:py-24 lg:py-32 bg-orange-50 text-primary-950 relative z-10 border-b border-neutral-100">
        <div className="container max-w-[1400px] mx-auto px-6">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-16">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <span className="text-xs font-black uppercase tracking-widest text-primary-600 mb-4 block">007 / TRUSTED BY TRAVELERS</span>
                <h2 className="text-4xl md:text-5xl leading-tight font-bold tracking-tight text-primary-950">
                  What guests <span className="italic font-medium text-primary-600">say</span>
                </h2>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="flex gap-10 border-t border-neutral-200 md:border-none pt-6 md:pt-0">
                 <div className="flex flex-col">
                   <span className="text-4xl md:text-5xl font-bold tracking-tight mb-1">10,629</span>
                   <span className="text-xs font-bold uppercase tracking-widest text-secondary-500">Reviews</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-4xl md:text-5xl font-bold tracking-tight mb-1">4.9</span>
                   <span className="text-xs font-bold uppercase tracking-widest text-secondary-500">Average</span>
                 </div>
              </motion.div>
           </div>
           
           <MobileSlider gridClass="md:grid-cols-3 items-stretch">
              <div className="w-10/12 shrink-0 md:w-full min-w-0 md:flex-auto h-full"><ReviewCard initial="M" initialColor="bg-orange-500" name="Marcello" text="Very excellent tour recommended 100% worth the money. A special thanks to the guides Dena and Ryan." /></div>
              <div className="w-10/12 shrink-0 md:w-full min-w-0 md:flex-auto h-full"><ReviewCard initial="M" initialColor="bg-primary-950" name="Matthew" text="Simply brilliant tour to Nusa Penida! We got to see turtles and manta rays. The stop at the scenic Cliff was spectacular. Would love to do it again!" /></div>
              <div className="w-10/12 shrink-0 md:w-full min-w-0 md:flex-auto h-full"><ReviewCard initial="J" initialColor="bg-amber-500" name="Jenisse" text="We had an amazing time at Nusa Penida. Everything was smooth sailing — all thanks to Ceco and Ringgo who were our amazing guides." /></div>
           </MobileSlider>
        </div>
      </section>

      {/* 9. GALLERY SECTION */}
      <section className="py-16 md:py-24 bg-white text-secondary-900 border-b border-neutral-100">
        <div className="container max-w-[1400px] mx-auto px-6">
          <div className="mb-10 flex items-end justify-between gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            >
              <span className="text-xs font-black uppercase tracking-widest text-primary-400 mb-4 block">008 / FROM OUR GUESTS</span>
              <h2 className="text-4xl md:text-5xl leading-tight font-bold tracking-tight mb-5 text-primary-950">
                Captured by <span className="italic font-medium text-primary-400">our guests</span>
              </h2>
            </motion.div>
          </div>

          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
             className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-100"
          >
            {/* Desktop Grid */}
            <div className="hidden min-h-96 grid-cols-2 gap-1.5 sm:grid bg-white">
              <button type="button" className="group relative overflow-hidden bg-neutral-100" onClick={() => openFancybox(0)}>
                <img src={STATIC_GALLERY[0].thumb} alt="Gallery" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
              </button>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="grid grid-rows-gallery-asymmetric-alt gap-1.5">
                  <button type="button" className="group relative h-full overflow-hidden bg-neutral-100" onClick={() => openFancybox(1)}>
                    <img src={STATIC_GALLERY[1].thumb} alt="Gallery" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
                  </button>
                  <button type="button" className="group relative h-full overflow-hidden bg-neutral-100" onClick={() => openFancybox(3)}>
                    <img src={STATIC_GALLERY[3].thumb} alt="Gallery" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
                  </button>
                </div>
                <div className="grid grid-rows-gallery-asymmetric-rev gap-1.5">
                  <button type="button" className="group relative h-full overflow-hidden bg-neutral-100" onClick={() => openFancybox(2)}>
                    <img src={STATIC_GALLERY[2].thumb} alt="Gallery" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
                  </button>
                  <button type="button" className="group relative h-full overflow-hidden bg-neutral-100" onClick={() => openFancybox(4)}>
                    <img src={STATIC_GALLERY[4].thumb} alt="Gallery" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Grid */}
            <div className="grid min-h-96 grid-rows-gallery-asymmetric gap-1.5 sm:hidden bg-white">
              <button type="button" className="group relative overflow-hidden bg-neutral-100" onClick={() => openFancybox(0)}>
                <img src={STATIC_GALLERY[0].thumb} alt="Gallery" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
              </button>
              <div className="grid grid-cols-2 gap-1.5">
                {[STATIC_GALLERY[1], STATIC_GALLERY[2]].map((item, i) => (
                  <button key={i} type="button" className="group relative overflow-hidden bg-neutral-100" onClick={() => openFancybox(i + 1)}>
                    <img src={item.thumb} alt="Gallery" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
                  </button>
                ))}
              </div>
            </div>

            {/* Floating "Show all photos" pill */}
            <button
              type="button"
              className="absolute bottom-6 right-6 flex items-center gap-3 rounded-full border border-neutral-200 bg-white shadow-2xl px-6 py-3.5 text-sm font-bold text-primary-950 transition-transform hover:scale-105 active:scale-95"
              onClick={() => openFancybox(0)}
            >
              <Camera className="h-5 w-5 text-primary-400" />
              Show all photos
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Rating({ content, score }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-end gap-1 mb-1.5">
        <span className="text-2xl sm:text-[26px] font-bold text-white leading-none tracking-tight">{score}</span>
      </div>
      <div className="flex gap-[4px] mb-[10px]">
        <Star className="w-3.5 h-3.5 fill-primary-600 text-primary-600" />
        <Star className="w-3.5 h-3.5 fill-primary-600 text-primary-600" />
        <Star className="w-3.5 h-3.5 fill-primary-600 text-primary-600" />
        <Star className="w-3.5 h-3.5 fill-primary-600 text-primary-600" />
        <Star className="w-3.5 h-3.5 fill-primary-600 text-primary-600" />
      </div>
      <span className="text-xs uppercase font-bold tracking-widest text-white/50">{content}</span>
    </div>
  )
}

function PricingCard({ tier, price, priceColor = "text-white", pillLabel, pillColor, desc, boatInfo, features, buttonText, buttonClass, isFeatured, featureIcon, borderColor, shadowColor, bgClass }) {
  const IconToUse = featureIcon || <Check className="w-5 h-5 text-primary-400" />;
  const defaultBorder = isFeatured ? "border-primary-600/50" : "border-white/10";
  const border = borderColor || defaultBorder;
  const defaultShadow = isFeatured ? "shadow-primary-500/20 shadow-2xl" : "";
  const shadow = shadowColor || defaultShadow;
  const background = bgClass || "bg-white/5";

  return (
    <div 
      className={cn(
        "flex flex-col p-6 sm:p-8 rounded-5xl border transition-all duration-500 relative h-full",
        background, border, shadow,
        "hover:border-opacity-100 hover:-translate-y-2 hover:shadow-2xl hover:brightness-110"
      )}
    >
      <div className={cn("self-start px-5 py-2.5 rounded-full text-xs sm:text-xs font-black tracking-widest shadow-lg mb-6", pillColor)}>
        {pillLabel}
      </div>
      <h3 className="text-4xl sm:text-[36px] font-bold text-white mb-3 block leading-tight tracking-tight drop-shadow-sm">{tier}</h3>
      <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-6 block min-h-[48px]">{desc}</p>
      
      <div className="text-xs sm:text-[12px] font-bold text-white/40 uppercase tracking-widest mb-6 whitespace-pre-line leading-relaxed pb-6 border-b border-white/10 block">
        {boatInfo}
      </div>

      <div className="flex items-baseline gap-2 mb-8">
        <span className="text-white/50 text-sm font-bold tracking-widest uppercase">FROM</span>
        <span className={cn("text-5xl sm:text-6xl font-bold leading-none tracking-tight drop-shadow-sm", priceColor)}>${price}</span>
        <span className="text-white/50 text-base font-medium">/ person</span>
      </div>

      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feat, idx) => (
          <li key={idx} className="flex gap-4 text-sm sm:text-sm text-white/80 items-start leading-[1.4] tracking-tight">
            <span className="mt-[2px] flex-shrink-0 opacity-90 drop-shadow-sm">
              {idx === 0 && isFeatured ? <Check className="w-5 h-5 text-primary-400" strokeWidth={2.5}/> : IconToUse}
            </span>
            <span className={idx === 0 && isFeatured ? "text-white font-semibold" : ""}>{feat}</span>
          </li>
        ))}
      </ul>

      <button className={cn("w-full py-4 rounded-full font-bold text-[16px] tracking-wide transition-transform hover:scale-105 active:scale-95 shadow-lg", buttonClass)}>
        {buttonText}
      </button>
    </div>
  )
}

function CompareRow({ label, c, p, e }) {
  return (
    <tr className="hover:bg-white/5 transition-colors group">
      <td className="py-5 px-8 text-white/50 font-medium group-hover:text-white transition-colors">{label}</td>
      <td className="py-5 px-4 text-center text-white/80 font-medium">{c}</td>
      <td className="py-5 px-4 text-center text-primary-400 font-semibold">{p}</td>
      <td className="py-5 px-4 text-center text-amber-500 font-semibold">{e}</td>
    </tr>
  )
}

function RouteCard({ img, title, desc, pills }) {
  return (
    <div className="bg-white rounded-5xl overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-xl transition-all duration-500 group border border-neutral-100 text-left">
      <div className="h-64 overflow-hidden bg-neutral-100">
         <img src={img} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      </div>
      <div className="p-8 sm:p-10 flex-1 flex flex-col items-start">
        <h3 className="text-3xl font-bold mb-4 tracking-tight text-primary-950">{title}</h3>
        <p className="text-secondary-600 text-sm mb-8 leading-relaxed flex-1">{desc}</p>
        <div className="flex flex-wrap gap-2">
          {pills.map(p => (
            <span key={p} className="px-4 py-2 bg-orange-50 text-primary-950 text-xs font-bold tracking-widest rounded-full border border-orange-200">
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function TimelineItem({ color, time, title, desc, isLast }) {
  return (
    <div className="relative pl-8 sm:pl-16 pb-16 sm:pb-24 group">
      {/* Line connecting to next */}
      {!isLast && <div className="absolute left-[7px] top-[14px] bottom-[-14px] w-[2px] bg-primary-900/10" />}
      {/* Circle Marker */}
      <div className={cn("absolute left-0 top-1.5 w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-white border-[3px] bg-white transition-transform duration-300 group-hover:scale-125 z-10", color.replace("text-", "border-"))}>
         <div className={cn("w-1.5 h-1.5 rounded-full", color.replace("text-", "bg-"))} />
      </div>

      <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
        <span className={cn("text-xs font-black uppercase tracking-widest mb-3 block", color)}>{time}</span>
        <h3 className="text-3xl sm:text-[34px] font-bold text-primary-950 mb-4 tracking-tight">{title}</h3>
        <p className="text-secondary-600 text-base sm:text-lg leading-relaxed">{desc}</p>
      </motion.div>
    </div>
  )
}

function InclusiveCard({ emoji, title, desc }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5 }} className="bg-white/5 border border-white/10 rounded-5xl p-8 sm:p-10 flex flex-col items-center justify-center text-center hover:bg-white/10 hover:-translate-y-2 hover:shadow-2xl hover:border-white/20 transition-all duration-300">
      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-3xl mb-6 shadow-inner ring-1 ring-white/10">
        {emoji}
      </div>
      <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  )
}

function ReviewCard({ initial, initialColor, name, text }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5 }} className="bg-white rounded-5xl p-8 sm:p-10 shadow-xl shadow-primary-950/5 border border-neutral-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 text-left">
      <div className="flex items-center gap-4 mb-6">
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl", initialColor)}>
          {initial}
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg text-primary-950">{name}</span>
          <span className="text-xs font-semibold text-secondary-400 uppercase tracking-widest mt-0.5">Recent</span>
        </div>
      </div>
      <div className="flex gap-[4px] mb-6">
        <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
        <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
        <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
        <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
        <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
      </div>
      <p className="text-secondary-600 text-sm leading-relaxed font-medium">"{text}"</p>
    </motion.div>
  )
}

function MobileSlider({ children, gridClass }) {
  const [emblaRef] = useEmblaCarousel({ 
    align: 'start', 
    dragFree: true,
    breakpoints: { '(min-width: 768px)': { active: false } }
  });

  return (
    <div className="overflow-hidden -mx-6 -my-12 py-12 md:overflow-visible md:mx-0 md:my-0 md:py-0" ref={emblaRef}>
      <div className={cn("flex md:grid px-6 md:px-0 gap-4 md:gap-6 lg:gap-8 style-slider", gridClass)}>
        {children}
      </div>
    </div>
  );
}
