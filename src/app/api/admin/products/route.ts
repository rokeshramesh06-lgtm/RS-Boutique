import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
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

    const db = getDb();
    const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Admin products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    if (!name || !description || !price || !original_price || !image_gradient || !category || !gender) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    const db = getDb();

    const result = db.prepare(
      `INSERT INTO products (name, description, price, original_price, image_gradient, category, gender, sizes, colors, in_stock, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      name,
      description,
      price,
      original_price,
      image_gradient,
      category,
      gender,
      sizes || '[]',
      colors || '[]',
      in_stock ?? 1,
      featured ?? 0
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Admin create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
