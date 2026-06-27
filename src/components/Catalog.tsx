/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Product, ResellOrder, FirebaseLog } from '../types';
import { MEESHO_PRODUCTS } from '../data/products';
import { 
  Search, 
  Filter, 
  Share2, 
  Plus, 
  Check, 
  Copy, 
  DollarSign, 
  Smartphone, 
  Info,
  ChevronRight,
  Database
} from 'lucide-react';

interface CatalogProps {
  onAddOrder: (order: ResellOrder) => void;
  onLogFirebaseEvent: (log: FirebaseLog) => void;
  isResellerMode: boolean;
  setIsResellerMode: (mode: boolean) => void;
}

export default function Catalog({ 
  onAddOrder, 
  onLogFirebaseEvent,
  isResellerMode,
  setIsResellerMode
}: CatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [margins, setMargins] = useState<Record<string, number>>({}); // map of productId -> custom margin amount (₹)
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<Product | null>(null);
  
  // Order Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(MEESHO_PRODUCTS.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return MEESHO_PRODUCTS.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleMarginChange = (productId: string, value: string) => {
    const num = parseInt(value) || 0;
    setMargins(prev => ({
      ...prev,
      [productId]: num >= 0 ? num : 0
    }));

    // Log simulated Firestore read/write when state changes
    onLogFirebaseEvent({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      collection: 'resellers',
      documentId: 'current-session',
      action: 'UPDATE',
      payload: JSON.stringify({ margins: { ...margins, [productId]: num } })
    });
  };

  const getProductPricing = (product: Product) => {
    const margin = margins[product.id] !== undefined ? margins[product.id] : (product.suggestedPrice - product.supplierPrice);
    const finalPrice = product.supplierPrice + margin;
    return {
      margin,
      finalPrice
    };
  };

  const handleCopyShareText = (product: Product) => {
    const { finalPrice } = getProductPricing(product);
    const shareText = `🔥 *EXCLUSIVE DEAL:* ${product.title}\n\n` +
                      `💸 *Special Reseller Price:* ₹${finalPrice}\n` +
                      `🚚 *Shipping:* Free Home Delivery & Cash on Delivery (COD) Available\n` +
                      `⭐ *Rating:* ${product.rating}/5 (${product.reviewsCount} verified reviews)\n\n` +
                      `👉 *Product Details:*\n${product.description}\n\n` +
                      `💬 *To Order:* Reply to this message with your full Name, Phone, and Delivery Address. Direct shipping to your doorstep!`;
    
    navigator.clipboard.writeText(shareText);
    setCopiedId(product.id);
    setTimeout(() => setCopiedId(null), 2500);

    onLogFirebaseEvent({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      collection: 'products',
      documentId: product.id,
      action: 'READ',
      payload: JSON.stringify({ action: "SHARE_CATALOG_PRODUCT", customPrice: finalPrice })
    });
  };

  const handleOpenOrderModal = (product: Product) => {
    setSelectedProductForOrder(product);
    setOrderSuccess(false);
    // Preset customer fields
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForOrder) return;

    const { margin, finalPrice } = getProductPricing(selectedProductForOrder);

    const newOrder: ResellOrder = {
      id: `order-${Math.random().toString(36).substr(2, 9)}`,
      productId: selectedProductForOrder.id,
      productTitle: selectedProductForOrder.title,
      supplierPrice: selectedProductForOrder.supplierPrice,
      customerPrice: finalPrice,
      marginEarned: margin,
      customerName,
      customerPhone,
      customerAddress,
      status: 'Pending',
      createdAt: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    onAddOrder(newOrder);

    // Simulate pushing to Firestore
    onLogFirebaseEvent({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      collection: 'orders',
      documentId: newOrder.id,
      action: 'CREATE',
      payload: JSON.stringify(newOrder)
    });

    setOrderSuccess(true);
    setTimeout(() => {
      setSelectedProductForOrder(null);
      setOrderSuccess(false);
    }, 1800);
  };

  return (
    <div id="catalog-section" className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-sans font-black text-2xl text-slate-800 tracking-tight">MEESHO<span className="text-vibrant-pink">+</span> RESELLER CATALOG</h2>
          <p className="text-sm text-slate-500 mt-1">Select products, set custom margins, and share directly to earn commissions.</p>
        </div>

        {/* Reseller Mode Toggle */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-2 self-start md:self-auto border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 pl-3">Reseller Mode</span>
          <button
            id="reseller-mode-toggle"
            onClick={() => {
              setIsResellerMode(!isResellerMode);
              onLogFirebaseEvent({
                id: `log-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                collection: 'config',
                documentId: 'reseller-mode',
                action: 'UPDATE',
                payload: JSON.stringify({ enabled: !isResellerMode })
              });
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm flex items-center gap-1.5 ${
              isResellerMode 
                ? 'bg-vibrant-pink text-white shadow-md shadow-vibrant-pink-light' 
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            {isResellerMode ? "ON (+Margin Active)" : "OFF (Supplier Cost)"}
          </button>
        </div>
      </div>

      {/* Promo Banner from Vibrant Palette */}
      <div className="mb-8 h-40 bg-gradient-to-r from-orange-400 to-pink-500 rounded-3xl p-6 sm:p-8 flex items-center justify-between text-white shadow-inner relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none"></div>
        <div className="absolute right-12 top-4 w-24 h-24 bg-white/5 rounded-full pointer-events-none"></div>
        <div className="z-10">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-85">Flash Sale Ending In 02:45:12</p>
          <h1 className="text-2xl sm:text-4xl font-black mt-1 leading-tight tracking-tight">MEGA BLOCKBUSTER</h1>
          <p className="text-sm sm:text-lg opacity-90 mt-0.5">Flat 70% Off on Ethnic Wear</p>
        </div>
        <div className="h-full flex items-end z-10 shrink-0">
          <div className="bg-white text-[#ff477e] px-4 sm:px-6 py-2 rounded-full font-black text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer select-none">
            SHOP NOW
          </div>
        </div>
      </div>

      {/* Intro reselling tip */}
      {isResellerMode && (
        <div className="mb-6 bg-vibrant-pink-light border border-vibrant-pink/20 p-4 rounded-2xl flex gap-3 items-start animate-fade-in">
          <div className="bg-vibrant-pink text-white p-1.5 rounded-lg shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-sans font-bold text-sm text-vibrant-pink">How Reselling Works on Meesho+</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              We deliver packages directly to your customers with <strong className="text-slate-800">your name</strong> as the sender. 
              The supplier price is deducted, and your adjusted profit margin (e.g., ₹200) is credited straight to your 
              <strong className="text-slate-800"> Reseller Wallet</strong> as soon as the customer accepts and pays for the Cash-On-Delivery package.
            </p>
          </div>
        </div>
      )}

      {/* Filters & Search Row */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="product-search-input"
            type="text"
            placeholder="Search ethnic fashion, jewellery, kitchenware..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-vibrant-pink focus:ring-2 focus:ring-vibrant-pink/15 transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 shrink-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              id={`cat-filter-${cat}`}
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                selectedCategory === cat 
                  ? 'bg-slate-800 text-white border-slate-800' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto mt-8">
          <p className="text-slate-400 text-sm">No items found matching your filter criteria.</p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            className="mt-4 text-xs text-vibrant-pink font-bold hover:underline"
          >
            Clear Filters & Reset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const { margin, finalPrice } = getProductPricing(product);
            const isCustomized = margins[product.id] !== undefined;
            return (
              <div 
                id={`product-card-${product.id}`}
                key={product.id} 
                className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 flex flex-col group"
              >
                {/* Image Section */}
                <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden shrink-0">
                  <img 
                    referrerPolicy="no-referrer"
                    src={product.image} 
                    alt={product.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-slate-800 font-mono text-[10px] font-bold px-2 py-1 rounded-md shadow-sm border border-slate-100">
                    {product.category}
                  </span>
                  
                  {/* Rating Badge */}
                  <div className="absolute bottom-3 left-3 bg-emerald-500/95 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm">
                    ★ {product.rating}
                    <span className="text-emerald-100 font-normal">({product.reviewsCount})</span>
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium tracking-tight">Supplied by {product.supplierName}</div>
                    <h3 className="font-sans font-bold text-sm text-slate-800 mt-1 line-clamp-2 min-h-[40px] leading-snug">
                      {product.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Pricing and Action Panel */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    
                    {/* Supplier vs Selling Price row */}
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Supplier Base</div>
                        <div className="text-base font-extrabold text-slate-600">₹{product.supplierPrice}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-vibrant-pink uppercase tracking-wider font-bold">
                          {isResellerMode ? "Your Sell Price" : "Sugg. Retail"}
                        </div>
                        <div className={`text-xl font-black ${isResellerMode ? 'text-vibrant-pink' : 'text-slate-800'}`}>
                          ₹{finalPrice}
                        </div>
                      </div>
                    </div>

                    {/* Reseller margin adjuster panel if mode active */}
                    {isResellerMode ? (
                      <div className="bg-vibrant-pink-light rounded-xl p-3 border border-vibrant-pink/20 mb-4 animate-fade-in">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[11px] font-bold text-slate-850">Custom Profit Margin (₹):</label>
                          <span className="text-xs font-bold text-emerald-600 font-mono">
                            Profit: +₹{margin} ({Math.round((margin / product.supplierPrice) * 100)}%)
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <input
                            id={`margin-input-${product.id}`}
                            type="number"
                            placeholder="Profit Margin"
                            value={margins[product.id] ?? (product.suggestedPrice - product.supplierPrice)}
                            onChange={(e) => handleMarginChange(product.id, e.target.value)}
                            className="bg-white border border-vibrant-pink/20 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 w-full focus:outline-none focus:border-vibrant-pink focus:ring-1 focus:ring-vibrant-pink/20 font-mono"
                          />
                          <button
                            id={`reset-margin-${product.id}`}
                            onClick={() => {
                              const defaultMargin = product.suggestedPrice - product.supplierPrice;
                              handleMarginChange(product.id, String(defaultMargin));
                            }}
                            className="text-[10px] text-slate-400 font-semibold px-2 hover:text-vibrant-pink transition-colors shrink-0"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 mb-4 flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
                        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Resell margin locked. Turn on Reseller Mode.</span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        id={`share-btn-${product.id}`}
                        onClick={() => handleCopyShareText(product)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          copiedId === product.id 
                            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-100' 
                            : 'bg-vibrant-pink-light text-vibrant-pink hover:bg-vibrant-pink hover:text-white border border-vibrant-pink/20'
                        }`}
                      >
                        {copiedId === product.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Copied Post!
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5" />
                            Share & Earn
                          </>
                        )}
                      </button>

                      <button
                        id={`order-btn-${product.id}`}
                        onClick={() => handleOpenOrderModal(product)}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-3.5 rounded-xl text-xs transition-colors"
                        title="Order on behalf of customer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Place Order Modal (Simulated Order Entry) */}
      {selectedProductForOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 overflow-hidden shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-sans font-bold text-base text-slate-800">New Reseller Client Order</h3>
                <p className="text-xs text-slate-500 mt-1">Submit client details to dispatch package directly.</p>
              </div>
              <button 
                onClick={() => setSelectedProductForOrder(null)}
                className="text-slate-400 hover:text-slate-600 font-sans font-bold text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            {orderSuccess ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full mb-4 animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="font-sans font-bold text-lg text-emerald-950">Customer Order Dispatched!</h4>
                <p className="text-xs text-emerald-700/80 mt-2 max-w-xs leading-relaxed">
                  Your custom order has been initialized on Firestore. The supplier has started packaging! Your reseller profit will be unlocked once delivered.
                </p>
                <div className="mt-4 flex items-center gap-1.5 bg-emerald-50 text-emerald-800 font-mono text-[10px] px-3 py-1.5 rounded-lg border border-emerald-100">
                  <Database className="w-3.5 h-3.5" />
                  <span>Firestore Node Created in /orders</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitOrder} className="p-6 space-y-4">
                {/* Product Summary */}
                <div className="flex gap-3 bg-vibrant-pink-light border border-vibrant-pink/25 p-3 rounded-xl">
                  <img 
                    referrerPolicy="no-referrer"
                    src={selectedProductForOrder.image} 
                    alt={selectedProductForOrder.title} 
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate leading-snug">{selectedProductForOrder.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Supplier Base: ₹{selectedProductForOrder.supplierPrice}</p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-[11px] text-vibrant-pink font-semibold">Sell Price: ₹{getProductPricing(selectedProductForOrder).finalPrice}</span>
                      <span className="text-[11px] text-emerald-600 font-bold">Resell Margin: +₹{getProductPricing(selectedProductForOrder).margin}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Customer Name *</label>
                    <input
                      id="order-cust-name"
                      required
                      type="text"
                      placeholder="e.g. Ayyanar S"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-vibrant-pink focus:ring-1 focus:ring-vibrant-pink/20"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Customer Contact Phone *</label>
                    <input
                      id="order-cust-phone"
                      required
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-vibrant-pink focus:ring-1 focus:ring-vibrant-pink/20"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Customer Shipping Address *</label>
                    <textarea
                      id="order-cust-address"
                      required
                      rows={3}
                      placeholder="Flat No, Block, Street Address, City, State, PIN Code"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-vibrant-pink focus:ring-1 focus:ring-vibrant-pink/20"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-2">
                  <button
                    id="submit-order-cancel"
                    type="button"
                    onClick={() => setSelectedProductForOrder(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-order-confirm"
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    Confirm Order (₹{getProductPricing(selectedProductForOrder).finalPrice})
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
