'use client';

import Link from "next/link";
import Image from "next/image";
import { GlassCard } from "@/components/ui/glass-card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, Wand2, ScanEye, Copy, Layers, Palette, Gamepad2, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden">

      <Navbar />

      <main className="flex-grow flex flex-col">

        {/* Hero Section */}
        <section className="relative pt-32 pb-32 px-6">
          <motion.div
            className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="space-y-8" variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                V2 Platform Live
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                Steal the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Style</span>.<br />
                Keep the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Soul</span>.
              </h1>

              <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
                Extract Visual DNA from any image. Replicate lighting, composition, and atmosphere in your own creations with AI-powered precision.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/editor/new">
                  <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-bold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all transform hover:-translate-y-1 flex items-center gap-2">
                    Start Creating
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-all">
                  View Gallery
                </button>
              </div>
            </motion.div>

            <motion.div className="relative" variants={itemVariants}>
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-3xl opacity-20 animate-pulse"></div>
              <GlassCard className="relative overflow-hidden aspect-square md:aspect-video flex items-center justify-center p-0 border-white/10">
                <Image
                  src="/hero-visual.png"
                  alt="Visual DNA Extraction Interface"
                  width={800}
                  height={600}
                  className="w-full h-full object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>

                {/* Floating UI Elements Simulation */}
                <div className="absolute bottom-6 left-6 right-6 flex gap-4">
                  <div className="flex-1 p-4 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
                    <div className="text-xs text-slate-400 mb-1">Lighting</div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[85%] bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
                    <div className="text-xs text-slate-400 mb-1">Composition</div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[92%] bg-purple-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </section>

        {/* Use Cases Section */}
        <section id="use-cases" className="py-24 px-6 bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Built for Creators</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Tailored workflows for every type of visual artist.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Link href="/use-cases/digital-artists" className="group">
                <GlassCard className="p-8 h-full hover:bg-white/5 transition-colors border-pink-500/20 hover:border-pink-500/40">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-6 text-pink-400 group-hover:scale-110 transition-transform">
                    <Palette className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-pink-400 transition-colors">Digital Artists</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Expand your stylistic horizons. Analyze masters and apply their techniques to your art.
                  </p>
                  <div className="mt-6 flex items-center text-sm font-bold text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    Learn more <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </GlassCard>
              </Link>

              <Link href="/use-cases/brand-designers" className="group">
                <GlassCard className="p-8 h-full hover:bg-white/5 transition-colors border-blue-500/20 hover:border-blue-500/40">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">Brand Designers</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Maintain visual consistency across campaigns. Create on-brand assets instantly.
                  </p>
                  <div className="mt-6 flex items-center text-sm font-bold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    Learn more <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </GlassCard>
              </Link>

              <Link href="/use-cases/game-developers" className="group">
                <GlassCard className="p-8 h-full hover:bg-white/5 transition-colors border-purple-500/20 hover:border-purple-500/40">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors">Game Developers</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Accelerate asset production. Generate textures and concept art that match your game's style.
                  </p>
                  <div className="mt-6 flex items-center text-sm font-bold text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    Learn more <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </GlassCard>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 px-6 bg-slate-900/50">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">From Inspiration to Creation in Seconds</h2>
              <div className="space-y-6">
                {[
                  { title: "Capture", desc: "Use our Chrome Extension to grab any image from the web.", icon: <ScanEye className="w-5 h-5" /> },
                  { title: "Analyze", desc: "Our AI breaks down the image into editable parameters.", icon: <Wand2 className="w-5 h-5" /> },
                  { title: "Generate", desc: "Create unlimited variations with the same visual DNA.", icon: <Layers className="w-5 h-5" /> }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1 text-white/80 border border-white/10">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-1 flex items-center gap-2">
                        {step.title}
                      </h4>
                      <p className="text-slate-400">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl rounded-full"></div>
              <GlassCard className="relative p-8 border-white/10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="space-y-3 font-mono text-sm text-slate-300">
                    <div className="flex gap-2">
                      <span className="text-purple-400">subject:</span>
                      <span>"cyberpunk street food vendor"</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-blue-400">lighting:</span>
                      <span>"neon noir, volumetric fog, blue and pink rim light"</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-pink-400">camera:</span>
                      <span>"35mm, f/1.8, low angle shot"</span>
                    </div>
                    <div className="h-px bg-white/10 my-4"></div>
                    <div className="flex items-center gap-2 text-green-400">
                      <span className="animate-pulse">●</span> Generating variations...
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
