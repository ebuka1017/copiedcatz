import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch usage stats
        const [
            totalTemplates,
            totalVariations,
            creditsUsed
        ] = await Promise.all([
            db.template.count({ where: { user_id: user.id } }),
            db.variation.count({ where: { template: { user_id: user.id } } }),
            db.usageLog.aggregate({
                where: { user_id: user.id },
                _sum: { credits_used: true }
            })
        ]);

        // Get recent activity
        const recentActivity = await db.usageLog.findMany({
            where: { user_id: user.id },
            orderBy: { created_at: 'desc' },
            take: 5,
            select: {
                action: true,
                created_at: true,
                credits_used: true
            }
        });

        return NextResponse.json({
            stats: {
                templates: totalTemplates,
                variations: totalVariations,
                credits: creditsUsed._sum.credits_used || 0
            },
            recentActivity
        });
    } catch (error) {
        console.error('Analytics fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
