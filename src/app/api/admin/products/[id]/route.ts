import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function getAdminUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return null;
  return user;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const adminUser = await getAdminUser(supabase);

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const {
      name,
      description,
      price,
      original_price,
      image_url,
      image_gradient,
      category,
      gender,
      sizes,
      colors,
      in_stock,
      featured,
    } = await request.json();

    // Build update object with only defined fields
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (original_price !== undefined) updates.original_price = original_price;
    if (image_url !== undefined) updates.image_url = image_url;
    if (image_gradient !== undefined) updates.image_gradient = image_gradient;
    if (category !== undefined) updates.category = category;
    if (gender !== undefined) updates.gender = gender;
    if (sizes !== undefined) updates.sizes = sizes;
    if (colors !== undefined) updates.colors = colors;
    if (in_stock !== undefined) updates.in_stock = in_stock;
    if (featured !== undefined) updates.featured = featured;

    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', Number(id))
      .select()
      .single();

    if (error || !product) {
      if (error?.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      console.error('Supabase update product error:', error);
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      );
    }

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
    const supabase = await createClient();
    const adminUser = await getAdminUser(supabase);

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', Number(id));

    if (error) {
      console.error('Supabase delete product error:', error);
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
