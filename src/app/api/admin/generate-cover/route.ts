import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function getUploadDir(): string {
  const base = existsSync('/tmp') ? '/tmp' : process.cwd();
  const dir = path.join(base, 'uploads');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

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

    const { image_base64, product_name, category } = await request.json();

    if (!image_base64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    const garmentType = category || 'saree';
    const name = product_name || garmentType;

    const prompt = `You are a professional fashion photographer. Take this ${garmentType} product image and generate a stunning e-commerce product photo of an Indian woman model elegantly wearing/draping this exact ${garmentType}.

Requirements:
- The model should be wearing the EXACT garment shown in the input image with its exact colors, patterns, and design
- Professional studio lighting with a clean, minimal background (soft gradient or solid)
- The model should have a graceful, confident pose suitable for an ethnic wear e-commerce store
- Full or 3/4 body shot showing the garment properly
- High-quality, photorealistic result
- The product name is "${name}" - style accordingly

Generate ONLY the image, no text.`;

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

    // Extract base64 data from the response
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

    // Save to uploads directory
    const filename = `cover-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
    const uploadDir = getUploadDir();
    const filePath = path.join(uploadDir, filename);
    writeFileSync(filePath, buffer);

    const imageUrl = `/api/uploads/${filename}`;

    return NextResponse.json({ url: imageUrl, filename });
  } catch (error) {
    console.error('Generate cover error:', error);
    return NextResponse.json({ error: 'Failed to generate cover image' }, { status: 500 });
  }
}
