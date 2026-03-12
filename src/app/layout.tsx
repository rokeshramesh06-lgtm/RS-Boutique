import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'RS Boutique | Premium Women\'s Indian Clothing',
    template: '%s | RS Boutique',
  },
  description:
    'Discover exquisite women\'s Indian fashion at RS Boutique. Shop premium sarees, churidars, and nightwear — crafted with the finest fabrics and timeless designs.',
  keywords: [
    'Indian clothing',
    'sarees',
    'churidar',
    'nighty',
    'women Indian fashion',
    'premium ethnic wear',
    'RS Boutique',
    'buy sarees online',
    'Indian ethnic wear',
    'women nightwear India',
    'handcrafted Indian clothing',
  ],
  metadataBase: new URL('https://rsboutique.net'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'RS Boutique',
    title: 'RS Boutique | Premium Women\'s Indian Clothing',
    description:
      'Shop premium sarees, churidars, and nightwear at RS Boutique. Handcrafted Indian fashion with timeless designs.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RS Boutique - Premium Indian Fashion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RS Boutique | Premium Women\'s Indian Clothing',
    description:
      'Shop premium sarees, churidars, and nightwear. Handcrafted Indian fashion with timeless designs.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${dmSans.variable}`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6B0F1A" />
      </head>
      <body className="font-body bg-ivory-100 text-[#1A1A1A] antialiased">
        <AuthProvider>
          <CartProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1 pt-[70px]">{children}</main>
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
