'use client';

import React from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { Chrome, ArrowRight, Wand2, Layers } from 'lucide-react';

export default function OnboardingPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <div className="relative w-full max-w-4xl space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">
                        Welcome to CopiedCatz
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        You're moments away from unlocking the Visual DNA of the web.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <GlassCard className="p-6 space-y-4 text-center">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto text-blue-400">
                            <Chrome size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-white">1. Install Extension</h3>
                        <p className="text-sm text-slate-400">
                            Add our Chrome extension to your browser to enable the capture tools.
                        </p>
                    </GlassCard>

                    <GlassCard className="p-6 space-y-4 text-center">
                        <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mx-auto text-cyan-400">
                            <Layers size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-white">2. Capture Style</h3>
                        <p className="text-sm text-slate-400">
                            Right-click any image or select an area to extract its lighting, composition, and mood.
                        </p>
                    </GlassCard>

                    <GlassCard className="p-6 space-y-4 text-center">
                        <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mx-auto text-pink-400">
                            <Wand2 size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-white">3. Remix & Create</h3>
                        <p className="text-sm text-slate-400">
                            Use the extracted DNA to generate new visuals that match the exact vibe you want.
                        </p>
                    </GlassCard>
                </div>

                <div className="flex justify-center gap-4 pt-8">
                    <GlassButton
                        href="/dashboard"
                        variant="secondary"
                        className="px-8"
                    >
                        Skip to Dashboard
                    </GlassButton>
                    <GlassButton
                        href="https://chrome.google.com/webstore/detail/your-extension-id"
                        variant="primary"
                        className="px-8"
                    >
                        <Chrome size={20} className="mr-2" />
                        Install Extension
                        <ArrowRight size={20} className="ml-2" />
                    </GlassButton>
                </div>
            </div>
        </div>
    );
}
