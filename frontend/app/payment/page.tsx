'use client';


import Link from 'next/link';

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-[#0f1621]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/checkout" className="text-blue-500 hover:text-blue-400 text-sm mb-4 inline-block">
          ← Back to Checkout
        </Link>
        <h1 className="text-4xl font-bold text-white mb-8">Payment Processing</h1>

        <div className="bg-gradient-to-br from-[#181e2a] to-[#1a2535] border border-[#232a3a] rounded-2xl p-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-6">
              <span className="text-2xl">💳</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Payment Gateway Integration</h2>
            <p className="text-[#7a8ba8] mb-8">
              This page will integrate with Stripe or other payment processors for handling secure payments.
            </p>
            <div className="space-y-2 text-left max-w-md mx-auto mb-8 bg-[#1a2332] p-6 rounded-lg border border-[#232a3a]">
              <p className="text-[#bfc8e6]">
                <strong>Features to implement:</strong>
              </p>
              <ul className="text-[#7a8ba8] text-sm space-y-1 mt-3">
                <li>✓ Card payment integration</li>
                <li>✓ UPI/Wallet options</li>
                <li>✓ Net Banking support</li>
                <li>✓ Secure transaction handling</li>
                <li>✓ Order confirmation</li>
              </ul>
            </div>
            <Link
              href="/checkout"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg transition-all"
            >
              Back to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
