'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-maroon-900 text-ivory-200">
      {/* Gold Ornament Divider */}
      <div className="flex items-center justify-center pt-8">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
        <div className="mx-4 flex items-center gap-2">
          <div className="h-1 w-1 rotate-45 bg-gold-500" />
          <div className="h-2 w-2 rotate-45 bg-gold-500" />
          <div className="h-1 w-1 rotate-45 bg-gold-500" />
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* About Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="group inline-flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold tracking-wide text-ivory-100 transition-colors group-hover:text-gold-400">
                RS
              </span>
              <span className="font-display text-sm font-medium tracking-[0.2em] text-gold-500 uppercase">
                Boutique
              </span>
            </Link>
            <p className="mt-4 max-w-xs font-body text-sm leading-relaxed text-ivory-200/70">
              Celebrating the artistry of Indian fashion since 2025. We bring
              you handcrafted garments that blend timeless tradition with
              contemporary elegance, using the finest fabrics and meticulous
              craftsmanship.
            </p>
            {/* Social Icons */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/30 text-gold-400 transition-all hover:border-gold-500 hover:bg-gold-500/10 hover:text-gold-300"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/30 text-gold-400 transition-all hover:border-gold-500 hover:bg-gold-500/10 hover:text-gold-300"
                aria-label="Facebook"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/30 text-gold-400 transition-all hover:border-gold-500 hover:bg-gold-500/10 hover:text-gold-300"
                aria-label="Twitter"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold tracking-wide text-gold-400">
              Quick Links
            </h3>
            <div className="mt-1 mb-4 h-px w-12 bg-gold-500/40" />
            <ul className="space-y-2.5">
              {[
                { label: 'Home', href: '/' },
                { label: 'Shop All', href: '/shop' },
                { label: 'My Orders', href: '/orders' },
                { label: 'Shopping Cart', href: '/cart' },
                { label: 'Sign In', href: '/auth/login' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-ivory-200/70 transition-colors hover:text-gold-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display text-lg font-semibold tracking-wide text-gold-400">
              Categories
            </h3>
            <div className="mt-1 mb-4 h-px w-12 bg-gold-500/40" />
            <ul className="space-y-2.5">
              {[
                { label: 'Sarees', href: '/shop?category=Sarees' },
                { label: 'Churidar', href: '/shop?category=Churidar' },
                { label: 'Nighty', href: '/shop?category=Nighty' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-ivory-200/70 transition-colors hover:text-gold-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="font-display text-lg font-semibold tracking-wide text-gold-400">
              Stay Connected
            </h3>
            <div className="mt-1 mb-4 h-px w-12 bg-gold-500/40" />
            <ul className="space-y-2.5 text-sm text-ivory-200/70">
              <li className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
                <span>Thanjavur, Tamil Nadu, India</span>
              </li>
              <li className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4 flex-shrink-0 text-gold-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
                <span>sharmigandhi13@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4 flex-shrink-0 text-gold-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                  />
                </svg>
                <span>+91 94425 23376</span>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="mb-3 text-sm text-ivory-200/70">
                Get exclusive offers and style updates
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex gap-0"
              >
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full rounded-l-lg border border-gold-500/30 bg-maroon-950/50 px-3 py-2.5 font-body text-sm text-ivory-200 placeholder-ivory-300/40 outline-none transition-colors focus:border-gold-500"
                />
                <button
                  type="submit"
                  className="flex-shrink-0 rounded-r-lg bg-gold-500 px-4 py-2.5 font-body text-sm font-medium text-maroon-900 transition-colors hover:bg-gold-400"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-ivory-200/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
          <p className="font-body text-xs text-ivory-200/50">
            &copy; {currentYear} RS Boutique. All rights reserved.
          </p>
          <p className="font-body text-xs text-ivory-200/40">
            Crafted with love in India
          </p>
        </div>
      </div>
    </footer>
  );
}
