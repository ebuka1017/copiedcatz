'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplateStore } from '@/lib/stores/template-store';
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Loader2, Search, Copy, Store } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface MarketplaceTemplate {
    id: string;
    name: string;
    original_image_url: string;
    user: { name: string | null };
    _count: { variations: number };
    created_at: string;
}

export default function MarketplacePage() {
    const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [remixingId, setRemixingId] = useState<string | null>(null);
    const { remixTemplate } = useTemplateStore();
    const router = useRouter();

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchMarketplace = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (debouncedQuery) params.append('q', debouncedQuery);

            const res = await fetch(`/api/marketplace?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch marketplace');
            const data = await res.json();
            setTemplates(data.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load marketplace');
        } finally {
            setLoading(false);
        }
    }, [debouncedQuery]);

    useEffect(() => {
        fetchMarketplace();
    }, [fetchMarketplace]);

    const handleRemix = async (templateId: string) => {
        if (remixingId) return;
        setRemixingId(templateId);
        try {
            const newId = await remixTemplate(templateId);
            router.push(`/editor/${newId}`);
        } catch (err) {
            console.error('Remix failed:', err);
            // Optional: Show toast error
        } finally {
            setRemixingId(null);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 to-slate-900 text-white">
            <Navbar />

            <main className="flex-grow pt-32 pb-16 px-6">
                <div className="max-w-7xl mx-auto space-y-8">

                    <div className="text-center space-y-4 mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">
                            Template Marketplace
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Discover and clone Visual DNA from the community.
                        </p>
                    </div>

                    <div className="max-w-md mx-auto relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search templates..."
                            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-slate-500 backdrop-blur-sm transition-all"
                        />
                    </div>


                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-full flex flex-col">
                                    <Skeleton className="aspect-video mb-4 rounded-xl" />
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <ErrorDisplay message={error} onRetry={fetchMarketplace} />
                    ) : templates.length === 0 ? (
                        <EmptyState
                            icon={Store}
                            title="Marketplace is empty"
                            description="Be the first to publish a template!"
                            actionLabel="Go to Dashboard"
                            actionHref="/"
                        />
                    ) : (
                        <motion.div
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {templates.map((template) => (
                                <motion.div key={template.id} variants={itemVariants}>
                                    <Card className="h-full flex flex-col p-0 overflow-hidden group hover:border-blue-500/30 transition-colors bg-slate-900 border-slate-800">
                                        <div className="relative aspect-video bg-slate-800">
                                            <Image
                                                src={template.original_image_url}
                                                alt={template.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    onClick={() => handleRemix(template.id)}
                                                    disabled={remixingId === template.id}
                                                    className="px-4 py-2 bg-white text-slate-900 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {remixingId === template.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                    {remixingId === template.id ? 'Cloning...' : 'Clone Template'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-5 flex-grow flex flex-col">
                                            <h3 className="font-bold text-lg mb-1 truncate">{template.name}</h3>
                                            <div className="flex items-center justify-between text-sm text-slate-400 mt-2">
                                                <span>by {template.user.name || 'Anonymous'}</span>
                                                <span>{template._count.variations} uses</span>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </main >

            <Footer />
        </div >
    );
}
