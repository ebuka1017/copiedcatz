import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, Layers, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Subtle Light Mode Gradient */}
        <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white -z-10"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">New: v2.0 Released</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Extract <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-600">Visual DNA</span> from any design.
            </h1>

            <p className="text-xl text-slate-600 max-w-lg leading-relaxed font-medium">
              CopiedCatz uses AI to analyze images and extract their stylistic essence—fonts, colors, and layout patterns—so you can remix and reuse them instantly.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/signup">
                <button className="px-8 py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-primary-600/20 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Start Creating Free
                </button>
              </Link>
              <Link href="/#how-it-works">
                <button className="px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-medium transition-all flex items-center gap-2 hover:shadow-md">
                  How it works
                </button>
              </Link>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-500 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
                ))}
              </div>
              <span>Trusted by 2,000+ designers</span>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-100 to-accent-100 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000 -z-10"></div>

            <Card className="p-2 transform rotate-1 group-hover:rotate-0 transition-transform duration-700 bg-white border-slate-200 shadow-2xl">
              <Image
                src="/hero-visual.png"
                alt="CopiedCatz Interface"
                width={800}
                height={600}
                className="rounded-lg border border-slate-100 bg-slate-50"
              />
            </Card>

            {/* Floating Elements (Light Mode Style) */}
            <Card className="absolute -bottom-8 -left-8 p-4 flex items-center gap-3 animate-bounce shadow-xl shadow-slate-200/50 bg-white border-slate-100" style={{ animationDuration: '3s' }}>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">Processing</div>
                <div className="font-bold text-lg text-slate-900">0.4s</div>
              </div>
            </Card>

            <Card className="absolute -top-8 -right-8 p-4 flex items-center gap-3 animate-bounce shadow-xl shadow-slate-200/50 bg-white border-slate-100" style={{ animationDuration: '4s' }}>
              <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center">
                <Layers className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">Layers</div>
                <div className="font-bold text-lg text-slate-900">12+</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900">From Image to Remix in Seconds</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Stop guessing visual parameters. CopiedCatz extracts the DNA so you can generate new variations.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Upload Image', desc: 'Drag and drop any reference image.', icon: Layers, color: 'text-blue-600', bg: 'bg-blue-100' },
              { title: 'DNA Extraction', desc: 'Our engine identifies lighting, composition, and style.', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-100' },
              { title: 'Generate & Remix', desc: 'Create infinite new image variations based on the source style.', icon: Zap, color: 'text-pink-600', bg: 'bg-pink-100' }
            ].map((feature, i) => (
              <Card key={i} className="p-8 bg-white border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all group">
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Preview */}
      <section id="use-cases" className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900">Endless Possibilities</h2>
              <p className="text-slate-600 text-lg">See what you can build with CopiedCatz.</p>
            </div>
            <Link href="/marketplace" className="text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-2 transition-colors">
              View Marketplace <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Link href="/use-cases/digital-artists" className="group">
              <Card className="h-80 p-8 flex items-end relative overflow-hidden border-0 shadow-lg group-hover:shadow-2xl transition-all">
                <div className="absolute inset-0 bg-slate-900 z-10 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <Image src="/hero-visual.png" alt="Digital Artists" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-20"></div>
                <div className="relative z-30">
                  <h3 className="text-3xl font-bold text-white mb-2">Digital Artists</h3>
                  <p className="text-slate-200 font-medium">Expand your stylistic horizons and break blocks.</p>
                </div>
              </Card>
            </Link>
            <Link href="/use-cases/brand-designers" className="group">
              <Card className="h-80 p-8 flex items-end relative overflow-hidden border-0 shadow-lg group-hover:shadow-2xl transition-all">
                <div className="absolute inset-0 bg-slate-900 z-10 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <Image src="/hero-visual.png" alt="Brand Designers" fill className="object-cover group-hover:scale-105 transition-transform duration-700 hue-rotate-15" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-20"></div>
                <div className="relative z-30">
                  <h3 className="text-3xl font-bold text-white mb-2">Brand Designers</h3>
                  <p className="text-slate-200 font-medium">Maintain visual consistency across campaigns.</p>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <Card className="p-16 text-center relative overflow-hidden bg-slate-900 text-white rounded-[2.5rem] shadow-2xl">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to copy the cat?</h2>
              <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">Join thousands of developers using CopiedCatz to speed up their workflow by 10x. Start remixing today.</p>
              <div className="flex justify-center gap-4">
                <Link href="/signup">
                  <button className="px-10 py-5 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-100 transition-colors shadow-xl shadow-white/10 hover:shadow-white/20 hover:-translate-y-1 transform duration-200">
                    Get Started Now
                  </button>
                </Link>
              </div>

              <div className="mt-12 flex justify-center gap-8 text-slate-400 text-sm font-medium">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> No credit card required</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 14-day free trial</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
