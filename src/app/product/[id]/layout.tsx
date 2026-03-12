import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: product } = await supabase
      .from('products')
      .select('name, description, category, price, image_url')
      .eq('id', id)
      .single();

    if (!product) {
      return { title: 'Product Not Found' };
    }

    const title = `${product.name} - ${product.category}`;
    const description =
      product.description ||
      `Shop ${product.name} at RS Boutique. Premium ${product.category} starting at ₹${product.price.toLocaleString('en-IN')}.`;

    return {
      title,
      description,
      alternates: {
        canonical: `/product/${id}`,
      },
      openGraph: {
        title: `${title} | RS Boutique`,
        description,
        url: `/product/${id}`,
        images: product.image_url
          ? [{ url: product.image_url, width: 800, height: 800, alt: product.name }]
          : undefined,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | RS Boutique`,
        description,
        images: product.image_url ? [product.image_url] : undefined,
      },
    };
  } catch {
    return { title: 'Product | RS Boutique' };
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
