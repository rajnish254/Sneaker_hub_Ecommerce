'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f1621] border-t border-[#232a3a]">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">SneakHub</h3>
            <p className="text-[#7a8ba8] text-sm leading-relaxed">
              Your ultimate destination for premium sneakers. We connect you with authentic shoes from top global brands with fast shipping and secure checkout.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Navigation</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-[#7a8ba8] hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-[#7a8ba8] hover:text-white transition">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-[#7a8ba8] hover:text-white transition">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-[#7a8ba8] hover:text-white transition">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:support@sneakhub.com" className="text-[#7a8ba8] hover:text-white transition">
                  Email Support
                </a>
              </li>
              <li>
                <a href="tel:+1-800-SNEAK-HUB" className="text-[#7a8ba8] hover:text-white transition">
                  Call Us
                </a>
              </li>
              <li>
                <Link href="/products" className="text-[#7a8ba8] hover:text-white transition">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-[#7a8ba8] hover:text-white transition">
                  Shipping Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-[#7a8ba8] hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-[#7a8ba8] hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-[#7a8ba8] hover:text-white transition">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-[#7a8ba8] hover:text-white transition">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#232a3a] mb-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Copyright */}
          <p className="text-[#7a8ba8] text-sm text-center md:text-left mb-4 md:mb-0">
            © {currentYear} SneakHub. All rights reserved. | Crafted with ❤️ for sneaker enthusiasts
          </p>

          {/* Social Links */}
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-[#1a2332] hover:bg-purple-600 flex items-center justify-center text-[#7a8ba8] hover:text-white transition"
              aria-label="Twitter"
            >
              𝕏
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-[#1a2332] hover:bg-pink-600 flex items-center justify-center text-[#7a8ba8] hover:text-white transition"
              aria-label="Instagram"
            >
              📷
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-[#1a2332] hover:bg-blue-600 flex items-center justify-center text-[#7a8ba8] hover:text-white transition"
              aria-label="Facebook"
            >
              f
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-[#1a2332] hover:bg-red-600 flex items-center justify-center text-[#7a8ba8] hover:text-white transition"
              aria-label="YouTube"
            >
              ▶
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
