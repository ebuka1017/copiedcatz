import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const query = searchParams.get('q') || '';
    const tag = searchParams.get('tag') || '';

    const skip = (page - 1) * limit;

    const where: any = {
      is_public: true,
    };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { tags: { has: query } },
      ];
    }

    if (tag) {
      where.tags = { has: tag };
    }

    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          _count: {
            select: { variations: true },
          },
        },
      }),
      prisma.template.count({ where }),
    ]);

    return NextResponse.json({
      data: templates,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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
