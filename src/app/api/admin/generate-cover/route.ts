import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { image_base64, product_name, category, material } = await request.json();

    if (!image_base64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    const garmentType = category || 'saree';
    const fabricDesc = material ? `${material} ${garmentType}` : garmentType;

    const prompt = `Generate an e-commerce product photo of exactly ONE Indian woman model wearing this ${fabricDesc}.

STRICT RULES:
- EXACTLY ONE person in the image — no second person, no reflections, no shadows of other people
- ZERO text, watermarks, labels, captions, logos, or any written content anywhere in the image
- NO borders, frames, collages, split screens, or before/after comparisons
- The model wears the EXACT garment from the input image — same colors, patterns, fabric, and design
${material ? `- CRITICAL FABRIC ACCURACY: This is a ${material} garment. The fabric in the generated image MUST look like ${material}. ${
  material.toLowerCase().includes('cotton') ? 'Cotton has a matte, soft finish with visible weave texture — NO silk-like sheen or shimmer.' :
  material.toLowerCase().includes('silk') ? 'Silk has a natural lustrous sheen, smooth drape, and rich appearance.' :
  material.toLowerCase().includes('chiffon') ? 'Chiffon is sheer, lightweight, and flowy with a soft translucent quality.' :
  material.toLowerCase().includes('georgette') ? 'Georgette has a crinkled texture, slightly rough feel, and semi-sheer look.' :
  material.toLowerCase().includes('crepe') ? 'Crepe has a crimped, pebbled texture with a matte to subtle sheen finish.' :
  material.toLowerCase().includes('linen') ? 'Linen has a crisp, textured, slightly rough natural finish with visible slubs.' :
  material.toLowerCase().includes('net') ? 'Net fabric is see-through mesh with a structured, open-weave pattern.' :
  material.toLowerCase().includes('velvet') ? 'Velvet has a dense, plush, soft pile with rich color depth.' :
  material.toLowerCase().includes('satin') ? 'Satin has a glossy, smooth surface on one side and matte on the other.' :
  material.toLowerCase().includes('organza') ? 'Organza is sheer, stiff, and crisp with a slight shimmer.' :
  `Ensure the fabric texture and drape accurately represents ${material}.`
} Do NOT make it look like a different fabric.` : '- The fabric texture, sheen, and drape must match the input image exactly — do not add shine to matte fabrics or flatten shiny ones.'}
- Clean solid or soft gradient studio background (white, cream, or light gray)
- Professional studio lighting, soft and even
- The model must be CENTERED in the frame with equal space on both sides
- Full body shot from head to toe, model standing upright facing the camera
- The model should be vertically centered too — not cropped at top or bottom
- Photorealistic, high-resolution result suitable for an online store

Output: a single clean centered product photograph, nothing else.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: image_base64 } },
            ],
          },
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter generate error:', errText);
      return NextResponse.json({ error: 'Image generation failed' }, { status: 502 });
    }

    const data = await response.json();
    const images = data.choices?.[0]?.message?.images;

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No image generated' }, { status: 502 });
    }

    const generatedDataUrl = images[0].image_url?.url;
    if (!generatedDataUrl) {
      return NextResponse.json({ error: 'Invalid image response' }, { status: 502 });
    }

    // Parse the data URL: "data:image/png;base64,iVBOR..."
    const match = generatedDataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: 'Could not parse generated image' }, { status: 502 });
    }

    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const contentType = `image/${match[1]}`;

    // Upload to Supabase Storage
    const filename = `cover-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
    const storagePath = `covers/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(storagePath, buffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to save generated image' }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(storagePath);

    return NextResponse.json({ url: publicUrl, filename });
  } catch (error) {
    console.error('Generate cover error:', error);
    return NextResponse.json({ error: 'Failed to generate cover image' }, { status: 500 });
  }
}
