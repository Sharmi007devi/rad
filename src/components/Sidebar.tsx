/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ShoppingBag, 
  Users, 
  Code, 
  Database, 
  Sparkles,
  Layers
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  resellerCount: number;
  earnings: number;
  firebaseLogCount: number;
}

export default function Sidebar({ 
  currentTab, 
  onTabChange,
  resellerCount,
  earnings,
  firebaseLogCount
}: SidebarProps) {
  
  const menuItems = [
    {
      id: 'catalog',
      label: 'Meesho Catalog',
      icon: ShoppingBag,
      description: 'Browse & add margins',
      badge: 'Reseller Mode'
    },
    {
      id: 'reseller',
      label: 'My Reseller Hub',
      icon: Users,
      description: 'Manage margins & orders',
      badge: `₹${earnings}`
    },
    {
      id: 'shopify',
      label: 'Shopify Integration',
      icon: Code,
      description: 'Liquid generator & sync',
      badge: 'Active'
    },
    {
      id: 'firebase',
      label: 'Firebase Firestore',
      icon: Database,
      description: 'Live collection inspector',
      badge: `${firebaseLogCount} events`
    }
  ];

  return (
    <aside id="sidebar-container" className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col h-auto lg:h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-vibrant-pink text-white p-2.5 rounded-xl shadow-md shadow-vibrant-pink-light flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-sans font-black text-xl text-vibrant-pink tracking-tighter leading-none flex items-center gap-1.5">
              MEESHO<span className="text-slate-400 font-light">+</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase mt-1">Social Retail Engine</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              id={`nav-btn-${item.id}`}
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-start gap-3.5 p-3.5 rounded-xl transition-all duration-200 text-left group border-l-4 ${
                isActive 
                  ? 'bg-vibrant-pink-light border-vibrant-pink text-vibrant-pink shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${isActive ? 'text-vibrant-pink' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-sans text-sm font-semibold tracking-tight ${isActive ? 'text-slate-950' : 'text-slate-700'}`}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-white text-vibrant-pink border border-vibrant-pink/25' 
                        : item.id === 'shopify' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate group-hover:text-slate-500 transition-colors">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer System Info (Non-cluttered, clean and informative) */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
          <span className="text-[11px] font-mono font-medium">Production Sandbox Ready</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center font-sans">
          Meesho Clone &bull; Shopify Connect
        </p>
      </div>
    </aside>
  );
}
