import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Fetch templates with latest variation
        // Logic: Get templates, and maybe get latest variation.
        // Supabase select: "*, variations:Variation(*)" order by created_at.
        // Complication: limiting nested relation items (take: 1) in a single query is tricky in Supabase/PostgREST.
        // It fetches ALL variations unless we restrict it.
        // Strategy: Fetch templates, then maybe fetch latest variations separately? Or just fetch basic template info?
        // Original code includes `variations` take 1. This is for the thumbnail usually.
        // Let's fetch variations:Variation(...) and limit? PostgREST doesn't support limit on nested easily.
        // We'll fetch all templates, and maybe 1 variation per template? 
        // For now, let's just fetch all variations?? No, too heavy.
        // Function-based approach or simplified query:
        // `select('*, variations:Variation(*)')` - this fetches all.
        // We can optimize later. For now, fetch `variations:Variation(id, image_url)`?
        // Or better: Let's assume low volume and fetch up to 10?
        // For this migration, to keep it simple, we'll fetch variations but only select necessary fields.
        const { data: templates, error } = await db.from('Template')
            .select(`
                *,
                variations:Variation(id, image_url, created_at)
            `)
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        // Manual sorting of nested variations if needed, though client likely handles it or we map
        // Original code: `variations: { take: 1, orderBy: desc }`.
        // We can't guarantee order of nested result in PostgREST easily without `.order()` on the nested resource?
        // Actually: `variations:Variation(id, image_url, created_at).order(created_at.desc).limit(1)` is NOT supported directly in select string like that for all rows.
        // It applies to the whole result set joins.
        // We'll do it in JS: sort variations and slice.
        const processedTemplates = templates?.map(t => ({
            ...t,
            variations: (t.variations as any[])?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 1)
        }));

        return NextResponse.json(processedTemplates);
    } catch (error) {
        console.error('Failed to list templates:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, original_image_url, structured_prompt, folder_id, is_public, tags } = body;

        if (!name || !original_image_url || !structured_prompt) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const { data: template, error } = await db.from('Template')
            .insert({
                user_id: user.id,
                name,
                original_image_url,
                structured_prompt,
                folder_id: folder_id || null,
                is_public: is_public || false,
                tags: tags || [],
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(template);
    } catch (error) {
        console.error('Failed to create template:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
