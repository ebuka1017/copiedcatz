import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const query = searchParams.get('q') || '';
    const tag = searchParams.get('tag') || '';

    const skip = (page - 1) * limit;

    // Base query
    let queryBuilder = db.from('Template')
      .select(`
            *,
            user:User(name),
            variations:Variation(id)
        `, { count: 'exact' })
      .eq('is_public', true);

    if (tag) {
      queryBuilder = queryBuilder.contains('tags', [tag]);
    }

    if (query) {
      // SECURITY: Escape query to prevent SQL injection
      // PostgREST uses pattern matching, so we need to escape special chars
      const sanitizedQuery = query
        .replace(/[%_\\]/g, '\\$&') // Escape SQL LIKE wildcards
        .replace(/[{}]/g, ''); // Remove PostgREST special chars

      // Search by name or tags
      queryBuilder = queryBuilder.or(`name.ilike.%${sanitizedQuery}%,tags.cs.{${sanitizedQuery}}`);
    }

    // Pagination
    queryBuilder = queryBuilder
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    const { data: templates, count, error } = await queryBuilder;

    if (error) throw error;

    // Transform response to match Prisma shape if needed, 
    // specifically _count.variations which is now variations.length
    const formattedTemplates = templates?.map((t: any) => ({
      ...t,
      _count: {
        variations: t.variations?.length || 0
      },
      // Remove variations array to keep payload similar to original if desired, 
      // or keep it but the client might expect _count.
      // Original code: _count: { select: { variations: true } }
    }));

    return NextResponse.json({
      data: formattedTemplates,
      meta: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Marketplace fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marketplace templates' },
      { status: 500 }
    );
  }
}
