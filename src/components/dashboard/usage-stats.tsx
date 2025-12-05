'use client';

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Layers, Wand2, Coins } from "lucide-react";

interface AnalyticsData {
    stats: {
        templates: number;
        variations: number;
        credits: number;
    };
    recentActivity: {
        action: string;
        created_at: string;
        credits_used: number;
    }[];
}

export function UsageStats() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/analytics')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setData(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading || !data) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 flex items-center gap-4 bg-slate-900 border-slate-800">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Layers className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm text-slate-400">Templates Created</p>
                    <p className="text-2xl font-bold">{data.stats.templates}</p>
                </div>
            </Card>

            <Card className="p-4 flex items-center gap-4 bg-slate-900 border-slate-800">
                <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
                    <Wand2 className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm text-slate-400">Variations Generated</p>
                    <p className="text-2xl font-bold">{data.stats.variations}</p>
                </div>
            </Card>

            <Card className="p-4 flex items-center gap-4 bg-slate-900 border-slate-800">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                    <Coins className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm text-slate-400">Credits Used</p>
                    <p className="text-2xl font-bold">{data.stats.credits}</p>
                </div>
            </Card>
        </div>
    );
}
