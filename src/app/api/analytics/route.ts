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
        // 1. Total Templates
        const templatesQuery = db.from('Template')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        // 2. Total Variations (using inner join on Template)
        const variationsQuery = db.from('Variation')
            .select('id, Template!inner(user_id)', { count: 'exact', head: true })
            .eq('Template.user_id', user.id);

        // 3. Credits Used (Sum)
        const creditsQuery = db.from('UsageLog')
            .select('credits_used')
            .eq('user_id', user.id);

        const [templatesRes, variationsRes, creditsRes] = await Promise.all([
            templatesQuery,
            variationsQuery,
            creditsQuery
        ]);

        const totalTemplates = templatesRes.count || 0;
        const totalVariations = variationsRes.count || 0;
        const creditsUsed = creditsRes.data?.reduce((sum, log) => sum + (log.credits_used || 0), 0) || 0;

        // Get recent activity
        const { data: recentActivity } = await db.from('UsageLog')
            .select('action, created_at, credits_used')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

        return NextResponse.json({
            stats: {
                templates: totalTemplates,
                variations: totalVariations,
                credits: creditsUsed
            },
            recentActivity: recentActivity || []
        });
    } catch (error) {
        console.error('Analytics fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
