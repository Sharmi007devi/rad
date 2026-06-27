/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShopifySnippet, FirebaseLog } from '../types';
import { INITIAL_SHOPIFY_SNIPPETS } from '../data/products';
import { 
  Code, 
  Copy, 
  Check, 
  Sparkles, 
  RefreshCw, 
  Terminal, 
  Play, 
  HelpCircle,
  Cpu,
  Send,
  Smartphone,
  Globe,
  Plus
} from 'lucide-react';

interface ShopifyIntegrationProps {
  onLogFirebaseEvent: (log: FirebaseLog) => void;
}

export default function ShopifyIntegration({ onLogFirebaseEvent }: ShopifyIntegrationProps) {
  const [snippets, setSnippets] = useState<ShopifySnippet[]>(INITIAL_SHOPIFY_SNIPPETS);
  const [selectedSnippet, setSelectedSnippet] = useState<ShopifySnippet>(INITIAL_SHOPIFY_SNIPPETS[0]);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Shopify Sync Simulation State
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  
  // Gemini Custom Liquid Generator State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShopifySync = () => {
    setSyncing(true);
    setSyncSuccess(false);

    // Simulate batch pushing metafields to Shopify Admin REST/GraphQL
    setTimeout(() => {
      setSyncing(false);
      setSyncSuccess(true);

      // Log Shopify webhook config node in Firestore simulator
      onLogFirebaseEvent({
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        collection: 'shopify_connections',
        documentId: 'active-store-sync',
        action: 'UPDATE',
        payload: JSON.stringify({
          storeUrl: "my-meesho-resell-store.myshopify.com",
          syncedProductsCount: 6,
          metafieldsConfigured: ["meesho.supplier_price", "meesho.supplier_code", "meesho.resell_allowed"],
          lastSync: new Date().toISOString()
        })
      });

      setTimeout(() => setSyncSuccess(false), 4000);
    }, 2500);
  };

  const handleGenerateCustomLiquid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setGeneratedResult(null);
    setAiError(null);

    onLogFirebaseEvent({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      collection: 'gemini_queries',
      documentId: `prompt-${Math.random().toString(36).substr(2, 5)}`,
      action: 'CREATE',
      payload: JSON.stringify({ query: aiPrompt })
    });

    try {
      const response = await fetch('/api/generate-liquid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate Liquid code.");
      }

      setGeneratedResult(data.result);
      
      // Save custom snippet to user library for testing
      const newSnippet: ShopifySnippet = {
        id: `snip-${Date.now()}`,
        title: `AI Generated: ${aiPrompt.substring(0, 30)}...`,
        description: "Bespoke snippet drafted live by Gemini AI.",
        category: 'utility',
        liquidCode: data.result
      };
      
      setSnippets(prev => [newSnippet, ...prev]);
      setSelectedSnippet(newSnippet);

      onLogFirebaseEvent({
        id: `log-${Date.now() + 1}`,
        timestamp: new Date().toLocaleTimeString(),
        collection: 'gemini_queries',
        documentId: 'response',
        action: 'UPDATE',
        payload: JSON.stringify({ status: 'SUCCESS', byteLength: data.result.length })
      });

    } catch (err) {
      console.error(err);
      setAiError(err instanceof Error ? err.message : "Error contacting full-stack Gemini service.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="shopify-integration-section" className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans font-bold text-2xl text-slate-800 tracking-tight">Shopify Merchant Integration</h2>
          <p className="text-sm text-slate-500 mt-1">Export products as Shopify inventory metafields and embed social reselling widgets into Liquid themes.</p>
        </div>

        {/* Sync Button */}
        <button
          id="shopify-sync-btn"
          onClick={handleShopifySync}
          disabled={syncing}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm flex items-center gap-2 ${
            syncSuccess 
              ? 'bg-emerald-500 text-white shadow-emerald-100' 
              : syncing 
              ? 'bg-slate-100 text-slate-400' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
          }`}
        >
          {syncing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Syncing Metafields...
            </>
          ) : syncSuccess ? (
            <>
              <Check className="w-4 h-4" />
              Synced successfully to Shopify!
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Sync Meesho Products to Shopify
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 5 Columns: Selector & AI Generator */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Preset templates list */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h4 className="font-sans font-bold text-xs text-slate-700 mb-4 uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-4 h-4 text-emerald-600" /> Embedded Liquid Templates
            </h4>
            <div className="space-y-2">
              {snippets.map((snip) => (
                <button
                  id={`snippet-btn-${snip.id}`}
                  key={snip.id}
                  onClick={() => { setSelectedSnippet(snip); setGeneratedResult(null); }}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${
                    selectedSnippet.id === snip.id 
                      ? 'bg-vibrant-pink-light border-vibrant-pink font-semibold text-slate-900' 
                      : 'bg-white hover:bg-slate-50/50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between gap-2">
                    <span className="truncate">{snip.title}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-mono">
                      {snip.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                    {snip.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* AI Generator Box */}
          <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
              <Cpu className="w-36 h-36 text-emerald-400" />
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-vibrant-pink" />
              <h4 className="font-sans font-bold text-sm text-white">Gemini Liquid Customizer</h4>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Need a tailored Shopify snippet? Let our Gemini engine write custom Liquid, HTML, and styling tags designed specifically to bridge your Meesho reseller features.
            </p>

            <form onSubmit={handleGenerateCustomLiquid} className="space-y-3">
              <textarea
                id="gemini-liquid-prompt"
                rows={3}
                placeholder="e.g., Create a product badge displaying 'Meesho Partner Product' with inline CSS and an estimated earnings calculated by product price"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={isGenerating}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-vibrant-pink focus:ring-1 focus:ring-vibrant-pink/20"
              />

              {aiError && (
                <div className="bg-rose-900/40 border border-rose-800 text-rose-300 text-[11px] p-2.5 rounded-lg leading-relaxed">
                  <strong>Gemini Error:</strong> {aiError}
                </div>
              )}

              <button
                id="gemini-liquid-submit"
                type="submit"
                disabled={isGenerating || !aiPrompt.trim()}
                className="w-full py-2 bg-vibrant-pink hover:bg-vibrant-pink/90 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-vibrant-pink-light/20"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    Generating Theme Snippet...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Draft Snippet with AI
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Right 7 Columns: Code Viewer & Instructions */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Code display card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[520px]">
            {/* Header tab */}
            <div className="bg-slate-900 px-5 py-3 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-medium text-slate-300">
                  {selectedSnippet.title.replace("AI Generated: ", "").substring(0, 32)}...
                </span>
              </div>

              <button
                id="copy-liquid-code-btn"
                onClick={() => handleCopyCode(selectedSnippet.liquidCode)}
                className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-white transition-colors py-1 px-2.5 rounded bg-slate-800/80 border border-slate-750"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Template
                  </>
                )}
              </button>
            </div>

            {/* Code pane */}
            <div className="flex-1 p-5 overflow-auto font-mono text-[11px] leading-relaxed text-slate-300 select-all selection:bg-emerald-500/25">
              <pre className="whitespace-pre-wrap">{selectedSnippet.liquidCode}</pre>
            </div>

            {/* How to use */}
            <div className="bg-slate-900 p-4 border-t border-slate-850">
              <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">How to embed this on Shopify:</p>
              <ol className="list-decimal list-inside text-[11px] text-slate-400 space-y-1">
                <li>Go to Shopify Admin &rarr; Online Store &rarr; Themes &rarr; Edit Code</li>
                <li>Create a new snippet under the <strong>Snippets</strong> folder with matching file name.</li>
                <li>Render it inside your <code>sections/main-product.liquid</code> using: <code className="bg-slate-950 px-1 py-0.5 rounded text-emerald-300 font-mono text-[10px]">{"{% render 'filename' %}"}</code></li>
              </ol>
            </div>
          </div>

          {/* Quick theme mock sandbox preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="font-sans font-bold text-xs text-slate-700 uppercase tracking-wider">Simulated Shopify Render Sandbox</h4>
            <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[9px] font-bold font-mono">
                Storefront Preview
              </div>

              {/* Simulated theme body */}
              <div className="space-y-3 font-sans text-xs">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span>Home</span> / <span>Ethnic Wear</span> / <span className="text-slate-600 font-medium">Bollywood Saree</span>
                </div>
                
                <h3 className="text-sm font-bold text-slate-800">Shopify Product Template Detail View</h3>
                
                {/* Visual rendering of the selected liquid widget mockup */}
                {selectedSnippet.id === 'snip-1' ? (
                  <div className="border border-rose-500 p-3 rounded-lg bg-rose-50/20 max-w-xs my-2">
                    <div className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mb-1.5">
                      Meesho Resell Active
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Supplier Cost:</span>
                      <span className="font-bold">₹349.00</span>
                    </div>
                    <div className="mt-2 pt-1 border-t border-dashed border-rose-200 text-[10px]">
                      <span className="text-slate-600">Drag profit margin slider:</span>
                      <input type="range" className="w-full accent-rose-500 h-1 mt-1" defaultValue={30} />
                      <div className="flex justify-between font-bold text-rose-600 mt-1">
                        <span>Your Margin:</span>
                        <span>+₹104.70 (30%)</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-800 mt-1">
                        <span>Your Client Price:</span>
                        <span className="text-emerald-600">₹453.70</span>
                      </div>
                    </div>
                  </div>
                ) : selectedSnippet.id === 'snip-2' ? (
                  <div className="my-2 max-w-xs">
                    <button className="w-full bg-[#25d366] hover:bg-opacity-95 text-white font-bold py-2 rounded-full flex items-center justify-center gap-1.5 text-xs shadow-sm">
                      <Smartphone className="w-4 h-4" />
                      Resell & Order via WhatsApp
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-1">Pre-filled order detail text will copy dynamically</p>
                  </div>
                ) : (
                  <div className="bg-slate-100 border border-slate-200 rounded p-3 text-[11px] text-slate-600 my-2 max-w-xs">
                    <strong>🏷️ Shopify Metafield Node:</strong><br />
                    <code>product.metafields.meesho.supplier_code</code> = Verified
                  </div>
                )}

                <div className="w-full h-8 bg-slate-200 rounded flex items-center justify-center text-[10px] text-slate-400 font-mono">
                  Shopify Default Theme Footer
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
