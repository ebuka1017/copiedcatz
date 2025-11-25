import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <GlassCard className="max-w-2xl w-full text-center p-12 space-y-8">
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
          CopiedCatz
        </h1>
        <p className="text-xl text-white/80 leading-relaxed">
          Extract visual DNA from any image.
          <br />
          Replicate styles, lighting, and composition in seconds.
        </p>

        <div className="flex justify-center gap-4 pt-4">
          <Link
            href="/editor/new"
            className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-white/90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Start New Project
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
