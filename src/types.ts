/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  title: string;
  category: string;
  supplierPrice: number; // in INR (₹)
  suggestedPrice: number; // in INR (₹)
  rating: number;
  reviewsCount: number;
  image: string;
  description: string;
  sharingDownloads: number;
  inventory: number;
  supplierName: string;
}

export interface ResellOrder {
  id: string;
  productId: string;
  productTitle: string;
  supplierPrice: number;
  customerPrice: number;
  marginEarned: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export interface ShopifySnippet {
  id: string;
  title: string;
  description: string;
  category: 'product' | 'cart' | 'checkout' | 'utility';
  liquidCode: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface FirebaseLog {
  id: string;
  timestamp: string;
  collection: string;
  documentId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ';
  payload: string;
}
