import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/checkout', '/orders', '/auth/'],
      },
    ],
    sitemap: 'https://rsboutique.net/sitemap.xml',
  };
}
