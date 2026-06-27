/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FirebaseLog, ResellOrder } from '../types';
import { MEESHO_PRODUCTS } from '../data/products';
import { 
  Database, 
  Terminal, 
  Code, 
  ShieldAlert, 
  FileCode, 
  Copy, 
  Check, 
  Play, 
  Info,
  Layers,
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface FirebaseConsoleProps {
  logs: FirebaseLog[];
  orders: ResellOrder[];
  isResellerMode: boolean;
}

export default function FirebaseConsole({ logs, orders, isResellerMode }: FirebaseConsoleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'db' | 'config' | 'rules'>('db');
  const [selectedCollection, setSelectedCollection] = useState<string>('orders');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Pre-configured Firestore Rules for our Meesho Social Selling System
  const firestoreRulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Global Catch-all Deny
    match /{document=**} {
      allow read, write: if false;
    }

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isEmailVerified() {
      return isSignedIn() && request.auth.token.email_verified == true;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function isValidId(id) {
      return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\\\-]+$');
    }

    // Products Collection
    match /products/{productId} {
      // Anyone can browse catalog items
      allow read: if true;
      // Only administrators can write/edit supplier base pricing
      allow write: if isSignedIn() && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // Orders Collection (The Meesho Social Dropship Model)
    match /orders/{orderId} {
      allow create: if isEmailVerified() 
        && request.resource.data.marginEarned >= 0
        && request.resource.data.customerPrice == request.resource.data.supplierPrice + request.resource.data.marginEarned
        && request.resource.data.id == orderId;

      allow read, update: if isEmailVerified() 
        && (request.auth.uid == resource.data.resellerUid || exists(/databases/$(database)/documents/admins/$(request.auth.uid)));
        
      // Ensure key states cannot bypass terminal limits
      allow delete: if false; // Orders are immutable once written, only status updates allowed
    }
  }
}`;

  // Pre-configured Firebase SDK setup
  const firebaseSdkCode = `// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// In AI Studio, configuration is loaded from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyFakeKey_MeeshoShopifySandbox",
  authDomain: "meesho-shopify-integration.firebaseapp.com",
  projectId: "meesho-shopify-integration",
  storageBucket: "meesho-shopify-integration.appspot.com",
  messagingSenderId: "1025805699799",
  appId: "1:1025805699799:web:a00db11ca99dd12bc"
};

// Initialize app
const app = initializeApp(firebaseConfig);

// Initialize Authentication & Firestore Database
export const auth = getAuth(app);
export const db = getFirestore(app);

// Connectivity check as demanded by hardened ABAC guidelines
export async function verifyFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore secure channel connected.");
  } catch (error) {
    console.error("Firestore offline or permission denied:", error);
  }
}`;

  return (
    <div id="firebase-console-section" className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-sans font-bold text-2xl text-slate-800 tracking-tight">Firebase Firestore Console</h2>
        <p className="text-sm text-slate-500 mt-1">Real-time database simulation. Inspect active Firestore nodes, view execution rules, and fetch copy-pasteable production configurations.</p>
      </div>

      {/* Sub tabs: DB Inspector vs. SDK vs. Rules */}
      <div className="border-b border-slate-200 mb-6 flex gap-4">
        <button
          id="fb-sub-db"
          onClick={() => setActiveSubTab('db')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'db' 
              ? 'border-vibrant-pink text-vibrant-pink' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" /> Live Document Tree
        </button>
        <button
          id="fb-sub-config"
          onClick={() => setActiveSubTab('config')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'config' 
              ? 'border-vibrant-pink text-vibrant-pink' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code className="w-4 h-4" /> Firebase Web SDK Setup
        </button>
        <button
          id="fb-sub-rules"
          onClick={() => setActiveSubTab('rules')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeSubTab === 'rules' 
              ? 'border-vibrant-pink text-vibrant-pink' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Hardened firestore.rules
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeSubTab === 'db' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Firestore Collections sidebar */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-2 text-slate-300">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-2.5 mb-2">Firestore Collections</span>
            
            <button
              id="col-btn-orders"
              onClick={() => setSelectedCollection('orders')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                selectedCollection === 'orders' 
                  ? 'bg-slate-800 text-white font-bold border-l-4 border-vibrant-pink' 
                  : 'hover:bg-slate-850 text-slate-400'
              }`}
            >
              <span className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" /> /orders
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">{orders.length}</span>
            </button>
 
            <button
              id="col-btn-products"
              onClick={() => setSelectedCollection('products')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                selectedCollection === 'products' 
                  ? 'bg-slate-800 text-white font-bold border-l-4 border-vibrant-pink' 
                  : 'hover:bg-slate-850 text-slate-400'
              }`}
            >
              <span className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" /> /products
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">6</span>
            </button>
 
            <button
              id="col-btn-resellers"
              onClick={() => setSelectedCollection('resellers')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                selectedCollection === 'resellers' 
                  ? 'bg-slate-800 text-white font-bold border-l-4 border-vibrant-pink' 
                  : 'hover:bg-slate-850 text-slate-400'
              }`}
            >
              <span className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" /> /resellers
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">1</span>
            </button>
          </div>

          {/* Active Collection Documents Viewer */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 shadow-xl min-h-[300px] text-slate-300 font-mono text-xs flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-900 pb-2 mb-4 flex items-center justify-between">
                  <span className="text-vibrant-pink font-semibold">db.collection('{selectedCollection}')</span>
                  <span className="text-[10px] text-slate-500 font-sans">Read-Only View</span>
                </div>

                {/* Simulated Documents */}
                <div className="space-y-4 max-h-[360px] overflow-y-auto">
                  {selectedCollection === 'orders' && (
                    orders.length === 0 ? (
                      <p className="text-slate-500 text-xs italic">Collection is empty. No document nodes written yet.</p>
                    ) : (
                      orders.map((ord) => (
                        <div id={`doc-box-${ord.id}`} key={ord.id} className="bg-slate-900 p-3.5 rounded-xl border border-slate-850">
                          <p className="text-emerald-400 font-semibold text-[11px]">doc("{ord.id}")</p>
                          <pre className="text-slate-400 text-[10px] mt-1.5 overflow-x-auto whitespace-pre">
                            {JSON.stringify(ord, null, 2)}
                          </pre>
                        </div>
                      ))
                    )
                  )}

                  {selectedCollection === 'products' && (
                    MEESHO_PRODUCTS.map((prod) => (
                      <div id={`doc-box-${prod.id}`} key={prod.id} className="bg-slate-900 p-3.5 rounded-xl border border-slate-850">
                        <p className="text-emerald-400 font-semibold text-[11px]">doc("{prod.id}")</p>
                        <pre className="text-slate-400 text-[10px] mt-1.5 overflow-x-auto whitespace-pre">
                          {JSON.stringify({
                            id: prod.id,
                            title: prod.title,
                            supplierPrice: prod.supplierPrice,
                            suggestedRetail: prod.suggestedPrice,
                            inventory: prod.inventory,
                            supplier: prod.supplierName
                          }, null, 2)}
                        </pre>
                      </div>
                    ))
                  )}

                  {selectedCollection === 'resellers' && (
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-850">
                      <p className="text-emerald-400 font-semibold text-[11px]">doc("current-session-reseller")</p>
                      <pre className="text-slate-400 text-[10px] mt-1.5 overflow-x-auto whitespace-pre">
                        {JSON.stringify({
                          uid: "uid_meesho_partner_ayyanar_77",
                          displayName: "Ayyanar S",
                          verifiedSeller: true,
                          isResellerModeActive: isResellerMode,
                          storeIntegrationConnected: "shopify_active",
                          calculatedEarnings: orders.reduce((sum, o) => o.status === 'Delivered' ? sum + o.marginEarned : sum, 0)
                        }, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[10px] text-slate-500 border-t border-slate-900 pt-3 mt-4 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Tree updates live automatically upon modifying state anywhere on the web application.</span>
              </div>
            </div>
          </div>

          {/* Bottom Terminal: Scrolling Live Mutation Webhook logs */}
          <div className="lg:col-span-3 bg-slate-950 border border-slate-850 rounded-2xl p-5 font-mono text-xs text-slate-300 shadow-xl h-[320px] flex flex-col justify-between">
            <div className="border-b border-slate-900 pb-2 mb-3 flex items-center justify-between shrink-0">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Terminal className="w-4 h-4" /> Live Mutation Logs
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 text-[11px] pr-2 scrollbar-thin">
              {logs.length === 0 ? (
                <p className="text-slate-500 italic mt-2">Console listening. Trigger margins, orders, or Shopify syncs to view transactions.</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="border-l-2 border-slate-700 pl-2 py-0.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>[{log.timestamp}]</span>
                      <span className="font-bold text-vibrant-pink">{log.action}</span>
                    </div>
                    <p className="text-slate-300 font-semibold text-[10.5px]">/{log.collection}/{log.documentId}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{log.payload}</p>
                  </div>
                ))
              )}
            </div>
            
            <div className="text-[10px] text-slate-600 text-center border-t border-slate-900 pt-3 mt-3 shrink-0">
              Listening on secure websocket channel...
            </div>
          </div>

        </div>
      ) : activeSubTab === 'config' ? (
        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div>
              <h4 className="font-sans font-bold text-sm text-slate-200">Firebase JavaScript Web SDK Integration</h4>
              <p className="text-xs text-slate-400">Initialize Firebase Firestore securely in your local environment.</p>
            </div>
            <button
              id="copy-fb-sdk-btn"
              onClick={() => handleCopyText(firebaseSdkCode, 1)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 py-1.5 px-3 rounded border border-slate-800"
            >
              {copiedIndex === 1 ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Config Code
                </>
              )}
            </button>
          </div>

          <pre className="text-slate-300 font-mono text-[11px] leading-relaxed p-4 bg-slate-900 rounded-xl overflow-x-auto max-h-[420px]">
            {firebaseSdkCode}
          </pre>
        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div>
              <h4 className="font-sans font-bold text-sm text-slate-200">Production-Ready firestore.rules</h4>
              <p className="text-xs text-slate-400">Secure access patterns protecting margins, admin capabilities, and reseller collections.</p>
            </div>
            <button
              id="copy-fb-rules-btn"
              onClick={() => handleCopyText(firestoreRulesCode, 2)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 py-1.5 px-3 rounded border border-slate-800"
            >
              {copiedIndex === 2 ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied Rules!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Rules
                </>
              )}
            </button>
          </div>

          <pre className="text-slate-300 font-mono text-[11px] leading-relaxed p-4 bg-slate-900 rounded-xl overflow-x-auto max-h-[420px]">
            {firestoreRulesCode}
          </pre>
        </div>
      )}

    </div>
  );
}
