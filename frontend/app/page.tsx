/**
 * HOME PAGE
 * Main landing page with hero section and featured products
 */
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { SHOES } from '@/lib/mockShoes';

export default function Home() {
  const featuredShoes = SHOES.slice(0, 8);

  return (
    <>
      <main className="min-h-screen bg-[#101624]">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 via-black to-gray-900 dark:from-gray-950 dark:via-black dark:to-gray-950 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Elevate Your Sole Game
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 leading-relaxed">
              Premium sneakers delivered to your doorstep. Discover the latest collection from the world's top brands.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/products"
                className="inline-block bg-white text-black px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition transform hover:scale-105 duration-200"
              >
                Shop Now →
              </Link>
              <Link 
                href="/products"
                className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-black transition"
              >
                Browse Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">Featured Sneakers</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">Handpicked selection of premium footwear</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredShoes.map((shoe) => (
            <Link key={shoe.id} href={`/products/${shoe.id}`}>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition overflow-hidden cursor-pointer h-full group">
                <div className="relative h-56 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <Image
                    src={shoe.image}
                    alt={shoe.name}
                    fill
                    className="object-cover group-hover:scale-110 transition duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    quality={90}
                  />
                  <div className="absolute top-4 right-4 bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-full text-sm font-bold">
                    Save {Math.round((1 - shoe.price/shoe.originalPrice) * 100)}%
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">{shoe.brand}</p>
                  <h3 className="font-bold text-lg line-clamp-2 text-gray-900 dark:text-white mt-2">{shoe.name}</h3>
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{shoe.price}</span>
                      <span className="text-gray-400 line-through ml-2 text-sm">₹{shoe.originalPrice}</span>
                    </div>
                    <span className="text-yellow-500 font-bold">⭐ {shoe.rating}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{shoe.stock > 0 ? `${shoe.stock} in stock` : 'Out of stock'}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-900 dark:bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Limited Time Offers</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Get up to 40% off on selected items. Limited stock available. Grab yours before they're gone!
          </p>
          <Link 
            href="/products"
            className="inline-block bg-white text-black px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition transform hover:scale-105 duration-200"
          >
            View All Products →
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Fast Shipping</h3>
              <p className="text-gray-600 dark:text-gray-400">Free delivery on all orders. Get your sneakers in 2-3 days.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Secure Checkout</h3>
              <p className="text-gray-600 dark:text-gray-400">100% secure payments with Stripe. Your data is protected.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">↩️</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Easy Returns</h3>
              <p className="text-gray-600 dark:text-gray-400">30-day hassle-free returns. We want you to be happy.</p>
            </div>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}
