/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Catalog from './components/Catalog';
import ResellerHub from './components/ResellerHub';
import ShopifyIntegration from './components/ShopifyIntegration';
import FirebaseConsole from './components/FirebaseConsole';
import { ResellOrder, FirebaseLog } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('catalog');
  const [isResellerMode, setIsResellerMode] = useState<boolean>(true);
  
  // Seed with sample initial orders to demonstrate full flow immediately
  const [orders, setOrders] = useState<ResellOrder[]>([
    {
      id: "order-h3k8b4",
      productId: "prod-1",
      productTitle: "Embellished Georgette Bollywood Saree with Blouse Piece",
      supplierPrice: 349,
      customerPrice: 699,
      marginEarned: 350,
      customerName: "Lalitha Ramanujam",
      customerPhone: "+91 94441 55670",
      customerAddress: "Flat 4A, Orchid Residency, T-Nagar, Chennai, Tamil Nadu - 600017",
      status: "Delivered",
      createdAt: "22 Jun 2026, 04:30 PM"
    },
    {
      id: "order-f2k9x1",
      productId: "prod-4",
      productTitle: "Velvet Matte Liquid Lipstick Combo Set - Pack of 4",
      supplierPrice: 149,
      customerPrice: 349,
      marginEarned: 200,
      customerName: "Simran Kaur",
      customerPhone: "+91 98110 22340",
      customerAddress: "H-12, Green Park Main, New Delhi - 110016",
      status: "Shipped",
      createdAt: "26 Jun 2026, 11:15 AM"
    }
  ]);

  // Seed with nice initial Firebase transaction logs
  const [logs, setLogs] = useState<FirebaseLog[]>([
    {
      id: "log-seed-1",
      timestamp: "01:44:02 AM",
      collection: "products",
      documentId: "catalog-sync",
      action: "READ",
      payload: "Fetched 6 active social reseller products from cache-index"
    },
    {
      id: "log-seed-2",
      timestamp: "01:44:05 AM",
      collection: "config",
      documentId: "reseller-mode",
      action: "READ",
      payload: "Initialized Reseller Mode: true. Profit margins are active."
    }
  ]);

  // Handle adding a new order
  const handleAddOrder = (newOrder: ResellOrder) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  // Handle order status transitions
  const handleUpdateOrderStatus = (orderId: string, status: ResellOrder['status']) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return { ...order, status };
      }
      return order;
    }));
  };

  // Handle pushing a mutation event log to Firebase Tab Console
  const handleLogFirebaseEvent = (newLog: FirebaseLog) => {
    setLogs(prev => [newLog, ...prev]);
  };

  // Calculate current delivered earnings
  const deliveredEarnings = orders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + o.marginEarned, 0);

  return (
    <div id="app-root-wrapper" className="min-h-screen bg-vibrant-bg flex flex-col lg:flex-row antialiased text-slate-800">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        onTabChange={setCurrentTab}
        resellerCount={orders.length}
        earnings={deliveredEarnings}
        firebaseLogCount={logs.length}
      />

      {/* Main Workspace Frame */}
      <main id="main-content-wrapper" className="flex-1 flex flex-col min-w-0 bg-vibrant-bg">
        
        {/* Responsive Header for Mobile Screens */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-vibrant-pink text-white p-2 rounded-lg">
              <span className="font-sans font-black text-xs">M</span>
            </div>
            <h1 className="font-sans font-bold text-base text-slate-800">
              Meesho<span className="text-vibrant-pink">+</span>
            </h1>
          </div>
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-1 rounded border border-emerald-200 uppercase font-mono">
            Wallet: ₹{deliveredEarnings}
          </span>
        </div>

        {/* Tab Display Router */}
        {currentTab === 'catalog' && (
          <Catalog 
            onAddOrder={handleAddOrder}
            onLogFirebaseEvent={handleLogFirebaseEvent}
            isResellerMode={isResellerMode}
            setIsResellerMode={setIsResellerMode}
          />
        )}

        {currentTab === 'reseller' && (
          <ResellerHub 
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onLogFirebaseEvent={handleLogFirebaseEvent}
          />
        )}

        {currentTab === 'shopify' && (
          <ShopifyIntegration 
            onLogFirebaseEvent={handleLogFirebaseEvent}
          />
        )}

        {currentTab === 'firebase' && (
          <FirebaseConsole 
            logs={logs}
            orders={orders}
            isResellerMode={isResellerMode}
          />
        )}
      </main>
    </div>
  );
}
