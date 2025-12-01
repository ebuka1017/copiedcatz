'use client';

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { Mail, Twitter } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white">
            <Navbar />

            <main className="flex-grow flex items-center justify-center p-6 pt-20">
                <GlassCard className="max-w-md w-full p-8 space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">
                            Get in Touch
                        </h1>
                        <p className="text-slate-400">
                            We'd love to hear from you.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Email</div>
                                <a href="mailto:isaacokwuzi@gmail.com" className="text-white hover:text-blue-300 transition-colors">
                                    isaacokwuzi@gmail.com
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
                                <Twitter className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Twitter / X</div>
                                <a href="https://x.com/nothiro__" target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-300 transition-colors">
                                    @nothiro__
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 text-center">
                        <p className="text-sm text-slate-500">
                            Built by <span className="text-white font-medium">hiro__</span>
                        </p>
                    </div>
                </GlassCard>
            </main>

            <Footer />
        </div>
    );
}
