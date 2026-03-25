/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, ShoppingCart, ExternalLink, Star, Tag, CheckCircle2, AlertCircle, Loader2, TrendingDown, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { comparePrices, ComparisonResult, ProductComparison } from './services/geminiService';
import { cn } from './lib/utils';

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await comparePrices(query);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-orange-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white">
              <ShoppingCart size={18} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">PriceWise <span className="text-orange-600">India</span></h1>
          </div>
          <div className="hidden md:block text-sm text-gray-500 font-medium">
            Real-time price comparison across major stores
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Search Section */}
        <section className="max-w-2xl mx-auto mb-12 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold mb-4 tracking-tight"
          >
            Find the best deals in seconds.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 mb-8"
          >
            Compare prices across Amazon, Flipkart, Croma, Reliance Digital and more.
          </motion.p>

          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a product (e.g., iPhone 15 Pro 256GB)"
              className="w-full h-14 pl-14 pr-32 bg-white border-2 border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-lg shadow-sm group-hover:border-gray-300"
              disabled={loading}
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={24} />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 bottom-2 px-6 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Compare'}
            </button>
          </form>
        </section>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin" />
                <ShoppingCart className="absolute inset-0 m-auto text-orange-600" size={24} />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">Scanning multiple stores...</p>
                <p className="text-sm text-gray-500">Fetching latest prices and availability</p>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto p-6 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4 text-red-800"
            >
              <AlertCircle className="shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-1">Search Failed</h3>
                <p className="text-sm opacity-90">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-3 text-sm font-bold underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            </motion.div>
          ) : result ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Product Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-2 block">Comparison Results</span>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{result.productName}</h3>
                </div>
                <div className="flex gap-3">
                  <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-bold flex items-center gap-2 border border-green-100">
                    <TrendingDown size={16} />
                    Lowest: {result.lowestPrice.split(':')[1] || result.lowestPrice}
                  </div>
                </div>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Best Deal</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{result.bestDeal}</p>
                  </div>
                </div>
                <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                    <TrendingDown size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Lowest Price</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{result.lowestPrice}</p>
                  </div>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Platform</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product Details</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.comparisons.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-6 py-5">
                            <span className="font-bold text-gray-900">{item.platform}</span>
                          </td>
                          <td className="px-6 py-5 max-w-xs">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</p>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-lg font-bold text-gray-900">{item.price}</span>
                              {item.discount && (
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded w-fit mt-1">
                                  {item.discount} OFF
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
                              <Star size={14} className="fill-yellow-400 text-yellow-400" />
                              {item.rating || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className={cn(
                              "flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full w-fit",
                              item.availability.toLowerCase().includes('in stock') 
                                ? "bg-green-50 text-green-700" 
                                : "bg-orange-50 text-orange-700"
                            )}>
                              <CheckCircle2 size={12} />
                              {item.availability}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-all group-hover:shadow-md"
                            >
                              View <ExternalLink size={14} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                <Tag size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to compare?</h3>
              <p className="text-gray-500">Enter a product name above to see prices from major Indian retailers.</p>
              
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {['iPhone 15', 'Sony WH-1000XM5', 'MacBook Air M3', 'Samsung S24 Ultra'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:border-orange-500 hover:text-orange-600 transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-12 border-t border-gray-200 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
          <p>© 2026 PriceWise India. All prices are approximate and subject to change.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-orange-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-orange-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-orange-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
