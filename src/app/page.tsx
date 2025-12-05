'use client';

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowRight, Sparkles, Layers, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Abstract Background Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-sm font-medium text-slate-300">v2.0 is now live</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Extract <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Visual DNA</span> from any design.
            </h1>

            <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
              CopiedCatz uses AI to analyze images and extract their stylistic essence—fonts, colors, and layout patterns—so you can remix and reuse them instantly.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/signup">
                <button className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-white/10">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Start Creating Free
                </button>
              </Link>
              <Link href="/#how-it-works">
                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium backdrop-blur-sm transition-all flex items-center gap-2">
                  How it works
                </button>
              </Link>
            </div>

            <div className="pt-8 flex items-center gap-4 text-sm text-slate-500">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                    <Image src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${i * 123}`} width={40} height={40} alt="User" />
                  </div>
                ))}
              </div>
              <p>Trusted by 10,000+ designers</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-pink-500/20 blur-3xl -z-10 rounded-full"></div>
            <GlassCard className="p-2 transform rotate-2 hover:rotate-0 transition-transform duration-700">
              <Image
                src="/hero-visual.png"
                alt="CopiedCatz Interface"
                width={800}
                height={600}
                className="rounded-lg shadow-2xl"
              />
            </GlassCard>

            {/* Floating Elements */}
            <GlassCard className="absolute -bottom-6 -left-6 p-4 flex items-center gap-3 animate-bounce shadow-xl" style={{ animationDuration: '3s' }}>
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Processing Time</div>
                <div className="font-bold text-lg">0.4s</div>
              </div>
            </GlassCard>

            <GlassCard className="absolute -top-6 -right-6 p-4 flex items-center gap-3 animate-bounce shadow-xl" style={{ animationDuration: '4s' }}>
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                <Layers className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Layers Extracted</div>
                <div className="font-bold text-lg">12+</div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">From Image to Code in Seconds</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Stop rebuilding from scratch. CopiedCatz deconstructs visuals into usable components.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Upload Image', desc: 'Drag and drop any screenshot or design file.', icon: Layers, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { title: 'AI Extraction', desc: 'Our engine identifies fonts, palettes, and layout structures.', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { title: 'Export & Remix', desc: 'Get clean CSS/Tailwind code or edit directly in our studio.', icon: Zap, color: 'text-pink-400', bg: 'bg-pink-500/10' }
            ].map((feature, i) => (
              <GlassCard key={i} className="p-8 hover:bg-white/5 transition-colors group">
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Preview */}
      <section id="use-cases" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Endless Possibilities</h2>
              <p className="text-slate-400">See what you can build with CopiedCatz.</p>
            </div>
            <Link href="/marketplace" className="text-blue-400 hover:text-white flex items-center gap-2 transition-colors">
              View Marketplace <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Link href="/use-cases/landing-pages" className="group">
              <GlassCard className="h-64 p-8 flex items-end relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                <Image src="/hero-visual.png" alt="Landing Pages" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="relative z-20">
                  <h3 className="text-2xl font-bold text-white mb-2">Modern Landing Pages</h3>
                  <p className="text-slate-300">Clone high-converting structures instantly.</p>
                </div>
              </GlassCard>
            </Link>
            <Link href="/use-cases/dashboards" className="group">
              <GlassCard className="h-64 p-8 flex items-end relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                <Image src="/hero-visual.png" alt="Dashboards" fill className="object-cover group-hover:scale-105 transition-transform duration-700 hue-rotate-30" />
                <div className="relative z-20">
                  <h3 className="text-2xl font-bold text-white mb-2">Complex Dashboards</h3>
                  <p className="text-slate-300">Replicate intricate data visualization layouts.</p>
                </div>
              </GlassCard>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <h2 className="text-4xl font-bold mb-6">Ready to copy the cat?</h2>
            <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">Join thousands of developers using CopiedCatz to speed up their workflow by 10x.</p>
            <Link href="/signup">
              <button className="px-10 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-200 transition-colors shadow-xl shadow-blue-500/20">
                Get Started Now
              </button>
            </Link>
          </GlassCard>
        </div>
      </section>

      <Footer />
    </div>
  );
}
