import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Use Case Data
const useCases = {
    "digital-artists": {
        title: "Digital Artists",
        subtitle: "Expand Your Stylistic Horizons",
        description: "Don't get stuck in a rut. Analyze the masters, understand their lighting and composition, and apply those principles to your own unique creations.",
        benefits: [
            "Break through creative blocks by analyzing inspiring art.",
            "Learn complex lighting setups instantly.",
            "Maintain consistent style across a series of works.",
            "Generate high-quality reference material."
        ],
        gradient: "from-pink-500 to-rose-500"
    },
    "brand-designers": {
        title: "Brand Designers",
        subtitle: "Maintain Visual Consistency",
        description: "Ensure every asset you generate aligns perfectly with your brand guidelines. Extract the DNA of your hero imagery and replicate it across campaigns.",
        benefits: [
            "Create infinite on-brand assets from a single reference.",
            "Standardize visual style across large teams.",
            "Rapidly iterate on campaign concepts.",
            "Reduce stock photo costs."
        ],
        gradient: "from-blue-500 to-cyan-500"
    },
    "game-developers": {
        title: "Game Developers",
        subtitle: "Accelerate Asset Production",
        description: "Generate textures, concept art, and skyboxes that match your game's unique art style perfectly. Streamline your pipeline.",
        benefits: [
            "Generate consistent concept art for environments.",
            "Create style-matched textures and UI elements.",
            "Rapidly prototype different visual directions.",
            "Maintain art direction fidelity."
        ],
        gradient: "from-purple-500 to-violet-500"
    }
};

export default async function UseCasePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const data = useCases[slug as keyof typeof useCases];

    if (!data) {
        notFound();
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
            <Navbar />

            <main className="flex-grow pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r ${data.gradient}`}>
                            Use Case
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                            For <span className={`text-transparent bg-clip-text bg-gradient-to-r ${data.gradient}`}>{data.title}</span>
                        </h1>

                        <p className="text-xl text-slate-300 leading-relaxed">
                            {data.subtitle}. {data.description}
                        </p>

                        <div className="space-y-4 pt-4">
                            {data.benefits.map((benefit, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <CheckCircle2 className={`w-6 h-6 shrink-0 text-transparent bg-clip-text bg-gradient-to-r ${data.gradient}`} />
                                    <span className="text-slate-300 text-lg">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8">
                            <Link href="/editor/new">
                                <button className={`px-8 py-4 bg-gradient-to-r ${data.gradient} rounded-full font-bold text-lg hover:shadow-lg transition-all transform hover:-translate-y-1 flex items-center gap-2`}>
                                    Start Creating Now
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${data.gradient} blur-3xl opacity-20 rounded-full`}></div>
                        <GlassCard className="relative aspect-square flex items-center justify-center p-12 border-white/10">
                            <div className="text-center space-y-4">
                                <div className="text-6xl">✨</div>
                                <h3 className="text-2xl font-bold">Visual DNA Extracted</h3>
                                <p className="text-slate-400">Ready to replicate style...</p>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
