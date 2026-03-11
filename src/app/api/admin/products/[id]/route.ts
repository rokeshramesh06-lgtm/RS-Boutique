import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const db = getDb();

    // Check if product exists
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(id));
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const {
      name,
      description,
      price,
      original_price,
      image_gradient,
      category,
      gender,
      sizes,
      colors,
      in_stock,
      featured,
    } = await request.json();

    db.prepare(
      `UPDATE products SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        original_price = COALESCE(?, original_price),
        image_gradient = COALESCE(?, image_gradient),
        category = COALESCE(?, category),
        gender = COALESCE(?, gender),
        sizes = COALESCE(?, sizes),
        colors = COALESCE(?, colors),
        in_stock = COALESCE(?, in_stock),
        featured = COALESCE(?, featured)
       WHERE id = ?`
    ).run(
      name ?? null,
      description ?? null,
      price ?? null,
      original_price ?? null,
      image_gradient ?? null,
      category ?? null,
      gender ?? null,
      sizes ?? null,
      colors ?? null,
      in_stock ?? null,
      featured ?? null,
      Number(id)
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(id));

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Admin update product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const db = getDb();

    // Check if product exists
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(id));
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(Number(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
