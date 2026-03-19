'use client';

import { useState } from 'react';

interface SizeChartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeChart({ isOpen, onClose }: SizeChartProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a2332] rounded-2xl border border-[#2d3f52] max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a2332] border-b border-[#2d3f52] p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Shoe Size Chart</h2>
          <button
            onClick={onClose}
            className="text-[#7a8ba8] hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Tab Navigation */}
          <div className="flex gap-4 border-b border-[#2d3f52]">
            <button className="px-4 py-2 border-b-2 border-purple-500 text-purple-400 font-semibold">
              Size Chart
            </button>
            <button className="px-4 py-2 text-[#7a8ba8] hover:text-white font-semibold">
              Tips & Fit
            </button>
          </div>

          {/* Size Chart Table */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Men's Shoe Sizes</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-[#bfc8e6]">
                <thead>
                  <tr className="border-b border-[#2d3f52]">
                    <th className="text-left py-3 px-4 font-semibold text-white">US Size</th>
                    <th className="text-left py-3 px-4 font-semibold text-white">EU Size</th>
                    <th className="text-left py-3 px-4 font-semibold text-white">UK Size</th>
                    <th className="text-left py-3 px-4 font-semibold text-white">Length (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { us: '5', eu: '37', uk: '4.5', cm: '23.0' },
                    { us: '6', eu: '38', uk: '5.5', cm: '23.8' },
                    { us: '7', eu: '40', uk: '6.5', cm: '24.6' },
                    { us: '8', eu: '41', uk: '7.5', cm: '25.4' },
                    { us: '9', eu: '42', uk: '8.5', cm: '26.2' },
                    { us: '10', eu: '43', uk: '9.5', cm: '27.0' },
                    { us: '11', eu: '45', uk: '10.5', cm: '27.8' },
                    { us: '12', eu: '46', uk: '11.5', cm: '28.6' },
                    { us: '13', eu: '47', uk: '12.5', cm: '29.4' },
                  ].map((size, idx) => (
                    <tr key={idx} className="border-b border-[#2d3f52] hover:bg-[#232a3a] transition">
                      <td className="py-3 px-4">{size.us}</td>
                      <td className="py-3 px-4">{size.eu}</td>
                      <td className="py-3 px-4">{size.uk}</td>
                      <td className="py-3 px-4">{size.cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Women's Sizes */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Women's Shoe Sizes</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-[#bfc8e6]">
                <thead>
                  <tr className="border-b border-[#2d3f52]">
                    <th className="text-left py-3 px-4 font-semibold text-white">US Size</th>
                    <th className="text-left py-3 px-4 font-semibold text-white">EU Size</th>
                    <th className="text-left py-3 px-4 font-semibold text-white">UK Size</th>
                    <th className="text-left py-3 px-4 font-semibold text-white">Length (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { us: '5', eu: '35', uk: '2.5', cm: '22.2' },
                    { us: '6', eu: '36', uk: '3.5', cm: '23.0' },
                    { us: '7', eu: '37', uk: '4.5', cm: '23.8' },
                    { us: '8', eu: '38', uk: '5.5', cm: '24.6' },
                    { us: '9', eu: '39', uk: '6.5', cm: '25.4' },
                    { us: '10', eu: '40', uk: '7.5', cm: '26.2' },
                    { us: '11', eu: '41', uk: '8.5', cm: '27.0' },
                  ].map((size, idx) => (
                    <tr key={idx} className="border-b border-[#2d3f52] hover:bg-[#232a3a] transition">
                      <td className="py-3 px-4">{size.us}</td>
                      <td className="py-3 px-4">{size.eu}</td>
                      <td className="py-3 px-4">{size.uk}</td>
                      <td className="py-3 px-4">{size.cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sizing Tips */}
          <div className="bg-[#232a3a] rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">💡 Sizing Tips</h3>
            <ul className="space-y-3 text-[#bfc8e6]">
              <li className="flex gap-3">
                <span className="text-purple-400 font-bold">•</span>
                <span><strong>Measure at the end of the day:</strong> Feet swell during the day, so measure when they're at their largest</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-400 font-bold">•</span>
                <span><strong>Wear your typical socks:</strong> Measure with the type of socks you'll wear with these shoes</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-400 font-bold">•</span>
                <span><strong>Leave room for movement:</strong> There should be about 1/2 inch between your longest toe and the shoe end</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-400 font-bold">•</span>
                <span><strong>Consider width:</strong> Some shoes run narrow or wide. Check product reviews for fit feedback</span>
              </li>
              <li className="flex gap-3">
                <span className="text-purple-400 font-bold">•</span>
                <span><strong>Test the heel:</strong> Your heel should fit snugly in the shoe without slipping</span>
              </li>
            </ul>
          </div>

          {/* Fit Guide */}
          <div className="bg-[#232a3a] rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">👟 Understanding Shoe Fit</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1a2332] rounded-lg p-4 border border-[#2d3f52]">
                <div className="text-2xl mb-2">✓</div>
                <p className="font-semibold text-white mb-2">Perfect Fit</p>
                <p className="text-sm text-[#7a8ba8]">Snug around heel, comfortable arch support, half-inch toe space</p>
              </div>
              <div className="bg-[#1a2332] rounded-lg p-4 border border-[#2d3f52]">
                <div className="text-2xl mb-2">⚠️</div>
                <p className="font-semibold text-white mb-2">Tight</p>
                <p className="text-sm text-[#7a8ba8]">Red marks after wearing, pressure points, or heel slipping</p>
              </div>
              <div className="bg-[#1a2332] rounded-lg p-4 border border-[#2d3f52]">
                <div className="text-2xl mb-2">ℹ️</div>
                <p className="font-semibold text-white mb-2">Loose</p>
                <p className="text-sm text-[#7a8ba8]">Heel slips, feet slide forward, or excessive toe space</p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
