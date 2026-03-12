import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop Indian Clothing',
  description:
    'Browse our curated collection of premium Indian women\'s clothing. Filter by sarees, churidars, and nightwear. Free shipping on orders over ₹2,999.',
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    title: 'Shop Indian Clothing | RS Boutique',
    description:
      'Browse premium sarees, churidars, and nightwear. Handcrafted Indian fashion with free shipping over ₹2,999.',
    url: '/shop',
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
