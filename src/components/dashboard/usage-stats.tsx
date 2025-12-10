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
            <Card className="p-4 flex items-center gap-4 bg-card border-border">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <Layers className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Templates Created</p>
                    <p className="text-2xl font-bold text-foreground">{data.stats.templates}</p>
                </div>
            </Card>

            <Card className="p-4 flex items-center gap-4 bg-card border-border">
                <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-600">
                    <Wand2 className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Variations Generated</p>
                    <p className="text-2xl font-bold text-foreground">{data.stats.variations}</p>
                </div>
            </Card>

            {/* Tokens counter disabled as per request */}
        </div>
    );
}
