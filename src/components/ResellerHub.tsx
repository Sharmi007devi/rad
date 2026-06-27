/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ResellOrder, FirebaseLog } from '../types';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Smartphone, 
  MapPin, 
  ArrowUpRight, 
  CreditCard,
  Send,
  Database,
  RefreshCw,
  Award
} from 'lucide-react';

interface ResellerHubProps {
  orders: ResellOrder[];
  onUpdateOrderStatus: (orderId: string, status: ResellOrder['status']) => void;
  onLogFirebaseEvent: (log: FirebaseLog) => void;
}

export default function ResellerHub({ 
  orders, 
  onUpdateOrderStatus,
  onLogFirebaseEvent
}: ResellerHubProps) {
  
  // UPI / Bank Transfer Simulation State
  const [upiId, setUpiId] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawStatus, setWithdrawStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  // Compute stats
  const stats = useMemo(() => {
    let totalDelivered = 0;
    let totalPending = 0;
    let totalShipped = 0;

    orders.forEach(order => {
      if (order.status === 'Delivered') {
        totalDelivered += order.marginEarned;
      } else if (order.status === 'Pending') {
        totalPending += order.marginEarned;
      } else if (order.status === 'Shipped') {
        totalShipped += order.marginEarned;
      }
    });

    return {
      delivered: totalDelivered,
      pending: totalPending + totalShipped,
      count: orders.length,
      successRate: orders.length > 0 ? Math.round((orders.filter(o => o.status === 'Delivered').length / orders.length) * 100) : 100
    };
  }, [orders]);

  const handleUpdateStatus = (orderId: string, newStatus: ResellOrder['status']) => {
    onUpdateOrderStatus(orderId, newStatus);
    
    // Log state transition in database simulation
    onLogFirebaseEvent({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      collection: 'orders',
      documentId: orderId,
      action: 'UPDATE',
      payload: JSON.stringify({ status: newStatus, updatedAt: new Date().toISOString() })
    });
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount to withdraw.");
      return;
    }
    if (amount > stats.delivered) {
      setWithdrawStatus('error');
      return;
    }

    setWithdrawStatus('processing');
    setTimeout(() => {
      setWithdrawStatus('success');
      
      // Log transactional debit to Firebase
      onLogFirebaseEvent({
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        collection: 'payouts',
        documentId: `payout-${Math.random().toString(36).substr(2, 6)}`,
        action: 'CREATE',
        payload: JSON.stringify({ 
          upiId, 
          amount, 
          status: 'SUCCESS', 
          type: 'UPI_WITHDRAWAL',
          timestamp: new Date().toISOString() 
        })
      });

      // Reset fields after delay
      setTimeout(() => {
        setWithdrawStatus('idle');
        setWithdrawAmount('');
        setUpiId('');
        
        // Simulating debiting the order balance on backend if we had absolute totals
        // For visual, we can just say transfer success.
      }, 3000);
    }, 1800);
  };

  return (
    <div id="reseller-hub-section" className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-sans font-bold text-2xl text-slate-800 tracking-tight">Social Reseller Workspace</h2>
        <p className="text-sm text-slate-500 mt-1">Track customer orders, manage profit payouts, and withdraw commissions straight to your bank account.</p>
      </div>

      {/* Grid of Earnings Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Delivered Earnings */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-6 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="absolute right-4 top-4 bg-emerald-500 text-white p-2.5 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Wallet Balance (Withdrawable)</span>
          <h3 className="text-3xl font-black text-emerald-950 mt-2">₹{stats.delivered}</h3>
          <p className="text-xs text-emerald-700 mt-2 flex items-center gap-1.5 font-sans">
            <CheckCircle2 className="w-3.5 h-3.5" /> Direct settlement verified on delivery
          </p>
        </div>

        {/* Card 2: Pending Commissions */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-6 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="absolute right-4 top-4 bg-amber-500 text-white p-2.5 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Pending Escrow Earnings</span>
          <h3 className="text-3xl font-black text-amber-950 mt-2">₹{stats.pending}</h3>
          <p className="text-xs text-amber-700 mt-2 flex items-center gap-1.5 font-sans">
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> In-transit customer shipments
          </p>
        </div>

        {/* Card 3: Performance */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-6 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="absolute right-4 top-4 bg-indigo-500 text-white p-2.5 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">Reseller Health</span>
          <h3 className="text-3xl font-black text-indigo-950 mt-2">{stats.successRate}%</h3>
          <p className="text-xs text-indigo-700 mt-2 flex items-center gap-1.5 font-sans">
            From {stats.count} total customer leads logged
          </p>
        </div>
      </div>

      {/* Main split grid: Orders and Payouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Order History Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-sans font-bold text-sm text-slate-800">Customer Direct Orders</h4>
                <p className="text-[11px] text-slate-400">Advance order stages to simulate live delivery & wallet updates.</p>
              </div>
              <span className="text-xs font-bold text-slate-500 px-2.5 py-1 bg-slate-100 rounded-full">
                {orders.length} Logged
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-400 text-xs">No orders registered yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">Go to the **Meesho Catalog** and click the "+" button on any card to create an order.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const statusColors = {
                    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
                    Shipped: 'bg-blue-50 text-blue-700 border-blue-200',
                    Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    Cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
                  };

                  return (
                    <div id={`order-row-${order.id}`} key={order.id} className="p-5 flex flex-col sm:flex-row justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">{order.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[order.status]}`}>
                            {order.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{order.createdAt}</span>
                        </div>
                        <h5 className="font-sans font-bold text-xs text-slate-800 leading-tight">
                          {order.productTitle}
                        </h5>
                        
                        {/* Customer block */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1.5">
                          <p className="flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                            <strong>Client:</strong> {order.customerName} ({order.customerPhone})
                          </p>
                          <p className="flex items-start gap-1.5 sm:col-span-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <strong className="shrink-0">Ship to:</strong> <span className="line-clamp-1">{order.customerAddress}</span>
                          </p>
                        </div>
                      </div>

                      {/* Pricing, Margin, and Stage Controls */}
                      <div className="sm:text-right flex sm:flex-col justify-between items-end shrink-0 gap-3">
                        <div>
                          <div className="text-[10px] text-slate-400">Commission margin</div>
                          <div className="text-sm font-extrabold text-emerald-600">+₹{order.marginEarned}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Sale Total: ₹{order.customerPrice}</div>
                        </div>

                        {/* Order lifecycle buttons */}
                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                          <div className="flex items-center gap-1">
                            {order.status === 'Pending' && (
                              <button
                                id={`ship-btn-${order.id}`}
                                onClick={() => handleUpdateStatus(order.id, 'Shipped')}
                                className="text-[10px] font-bold bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 rounded-lg shadow-sm transition-colors"
                              >
                                Ship Order
                              </button>
                            )}
                            {order.status === 'Shipped' && (
                              <button
                                id={`deliver-btn-${order.id}`}
                                onClick={() => handleUpdateStatus(order.id, 'Delivered')}
                                className="text-[10px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg shadow-sm transition-colors"
                              >
                                Mark Delivered
                              </button>
                            )}
                            <button
                              id={`cancel-btn-${order.id}`}
                              onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                              className="text-[10px] font-bold hover:bg-vibrant-pink-light text-vibrant-pink border border-transparent hover:border-vibrant-pink/20 px-2.5 py-1 rounded-lg transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Withdrawal & Payout Center */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-vibrant-pink" />
              <h4 className="font-sans font-bold text-sm text-slate-800">Direct Bank Settlement</h4>
            </div>
            
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Transfer your verified wallet commissions directly into your personal bank account via instant UPI.
            </p>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Enter UPI ID (VPA) *</label>
                <input
                  id="withdraw-upi-id"
                  required
                  type="text"
                  placeholder="e.g. ayyanar@oksbi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  disabled={stats.delivered === 0 || withdrawStatus === 'processing'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-vibrant-pink focus:ring-1 focus:ring-vibrant-pink/20 font-mono disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Amount to Transfer (₹) *</label>
                <input
                  id="withdraw-amount-input"
                  required
                  type="number"
                  placeholder={`Max ₹${stats.delivered}`}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={stats.delivered}
                  disabled={stats.delivered === 0 || withdrawStatus === 'processing'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-vibrant-pink focus:ring-1 focus:ring-vibrant-pink/20 font-mono disabled:opacity-50"
                />
              </div>

              {withdrawStatus === 'error' && (
                <div className="bg-vibrant-pink-light border border-vibrant-pink/20 text-vibrant-pink text-[11px] p-2.5 rounded-lg">
                  <strong>Transfer Failed:</strong> Insufficient wallet balance.
                </div>
              )}

              {withdrawStatus === 'success' && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] p-2.5 rounded-lg flex items-center gap-1.5 animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Transfer successful! Funds credited via IMPS.</span>
                </div>
              )}

              <button
                id="withdraw-submit-btn"
                type="submit"
                disabled={stats.delivered === 0 || withdrawStatus === 'processing'}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {withdrawStatus === 'processing' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Connecting IMPS Gateway...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Withdraw to Bank Account
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Reselling guidelines card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h5 className="font-sans font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-vibrant-pink" /> Firebase Realtime Sync active
            </h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When client orders are processed or payouts are triggered, Firestore collections securely track state change logs. Toggle the **Firebase Firestore** tab to observe live database write activity!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
