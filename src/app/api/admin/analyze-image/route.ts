import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const CATEGORIES = ['Sarees', 'Churidar', 'Nighty'];

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

    const { image_base64, image_url } = await request.json();

    if (!image_base64 && !image_url) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    const imageContent = image_base64
      ? { type: 'image_url' as const, image_url: { url: image_base64 } }
      : { type: 'image_url' as const, image_url: { url: image_url } };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'user',
            content: [
              imageContent,
              {
                type: 'text',
                text: `You are a product cataloging assistant for an Indian ethnic wear boutique called "RS Boutique". Analyze this product image and return a JSON object with these fields:

- "name": A descriptive product name (e.g., "Royal Blue Banarasi Silk Saree", "Floral Print Cotton Churidar Set"). Be specific about material, color, and style.
- "description": A compelling 2-3 sentence product description highlighting fabric, design, occasion, and key features.
- "price": Estimated selling price in INR (number only, no symbol). Use realistic Indian ethnic wear pricing.
- "original_price": The MRP/original price (slightly higher than price to show discount).
- "category": One of: ${CATEGORIES.map(c => `"${c}"`).join(', ')}. Determine based on the garment type.
- "colors": Comma-separated list of visible colors (e.g., "Red, Gold, Maroon").

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no explanation.`,
              },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter error:', errText);
      return NextResponse.json({ error: 'AI analysis failed' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 502 });
    }

    // Parse the JSON response, stripping markdown code blocks if present
    let cleaned = content;
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    const result = JSON.parse(cleaned);

    // Validate and normalize the category
    if (result.category && !CATEGORIES.includes(result.category)) {
      result.category = 'Sarees'; // default fallback
    }

    // Sarees are always Free Size
    if (result.category === 'Sarees') {
      result.sizes = ['Free Size'];
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
  }
}
