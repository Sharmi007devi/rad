/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, ShopifySnippet } from '../types';

export const MEESHO_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    title: "Embellished Georgette Bollywood Saree with Blouse Piece",
    category: "Ethnic Fashion",
    supplierPrice: 349,
    suggestedPrice: 799,
    rating: 4.6,
    reviewsCount: 1240,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600",
    description: "Elegant georgette saree featuring delicate embroidery and gold lace borders. Perfect for wedding receptions, festivals, and family gatherings. Comes with an unstitched blouse piece in matching shade.",
    sharingDownloads: 489,
    inventory: 120,
    supplierName: "Radha Textiles Surat"
  },
  {
    id: "prod-2",
    title: "18k Gold Plated Kundan Choker & Earrings Jewellery Set",
    category: "Jewellery & Accessories",
    supplierPrice: 199,
    suggestedPrice: 599,
    rating: 4.8,
    reviewsCount: 843,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600",
    description: "Royal Kundan choker set plated with real 18K yellow gold, detailed with red beads and matching drop earrings. Adjusts comfortably with an adjustable thread closure. Highly popular for festive resale.",
    sharingDownloads: 712,
    inventory: 85,
    supplierName: "Jaipur Jewels Corp"
  },
  {
    id: "prod-3",
    title: "Multi-blade Quick Hand-Pull Vegetable Chopper & Blender",
    category: "Home & Kitchen",
    supplierPrice: 129,
    suggestedPrice: 299,
    rating: 4.3,
    reviewsCount: 3102,
    image: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&q=80&w=600",
    description: "Durable manual food chopper made of food-grade ABS material. Features 3 sharp stainless steel blades for rapid chopping of onions, garlic, herbs, and vegetables with a single pull string.",
    sharingDownloads: 320,
    inventory: 240,
    supplierName: "SmartKitchen Impex"
  },
  {
    id: "prod-4",
    title: "Velvet Matte Liquid Lipstick Combo Set - Pack of 4",
    category: "Beauty & Cosmetics",
    supplierPrice: 149,
    suggestedPrice: 399,
    rating: 4.5,
    reviewsCount: 1650,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=600",
    description: "Waterproof, smudge-proof, and long-lasting liquid lipstick in 4 trending shades of nude, rose-pink, deep red, and coral. Enriched with Vitamin E and shea butter for extreme lip comfort.",
    sharingDownloads: 924,
    inventory: 150,
    supplierName: "GlamStyle Cosmetics"
  },
  {
    id: "prod-5",
    title: "Ultrasonic Cool Mist Humidifier with 7-Color LED Night Light",
    category: "Home Decor",
    supplierPrice: 249,
    suggestedPrice: 599,
    rating: 4.4,
    reviewsCount: 980,
    image: "https://images.unsplash.com/photo-1519183071298-a2962feb14f4?auto=format&fit=crop&q=80&w=600",
    description: "Sleek portable USB-powered desktop humidifier. Emits ultra-fine cool mist to combat dry air. Features an ambient color-changing LED strip. Quiet operation makes it perfect for bedroom or office.",
    sharingDownloads: 512,
    inventory: 90,
    supplierName: "ElectroNiche Tech"
  },
  {
    id: "prod-6",
    title: "Pro-Bass Wireless Bluetooth Neckband Earphones with Mic",
    category: "Electronics",
    supplierPrice: 189,
    suggestedPrice: 499,
    rating: 4.2,
    reviewsCount: 4210,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
    description: "Ultra-light neckband featuring dynamic bass drivers, Bluetooth 5.2, and 20 hours of continuous music playback. Magnetized earbuds snap securely when not in use. Sweat-resistant for active workouts.",
    sharingDownloads: 1105,
    inventory: 310,
    supplierName: "WaveAudio Labs"
  }
];

export const INITIAL_SHOPIFY_SNIPPETS: ShopifySnippet[] = [
  {
    id: "snip-1",
    title: "Custom Reseller Margin Price Display",
    description: "Renders the price along with an dynamically calculated reseller margin. Perfect for product pages to entice micro-entrepreneurs.",
    category: "product",
    liquidCode: `<!-- file: snippets/meesho-price-resell.liquid -->
<div class="meesho-price-container" style="border: 1px solid #e11d48; padding: 15px; border-radius: 8px; background-color: #fffafb; max-width: 400px; margin: 10px 0;">
  <div class="meesho-badge" style="background-color: #e11d48; color: white; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 12px; display: inline-block; margin-bottom: 8px; text-transform: uppercase;">
    Meesho Social Resell Allowed
  </div>
  <div class="supplier-price-info" style="display: flex; justify-content: space-between; font-family: sans-serif; font-size: 14px;">
    <span style="color: #6b7280;">Supplier Price:</span>
    <span style="font-weight: 600; color: #111827;">{{ product.price | money }}</span>
  </div>
  
  <!-- Form to calculate margins dynamically -->
  <div class="reseller-calculator" style="margin-top: 12px; border-top: 1px dashed #f43f5e; padding-top: 10px;">
    <label for="markup-range" style="font-size: 12px; color: #4b5563; display: block; margin-bottom: 4px;">Set Your Selling Price (Slide to adjust profit margin):</label>
    <div style="display: flex; align-items: center; gap: 10px;">
      <input type="range" id="markup-range" min="10" max="100" value="30" style="flex: 1; accent-color: #e11d48;" oninput="updateShopifyPrice({{ product.price | divided_by: 100.0 }})">
      <span id="markup-percent" style="font-size: 14px; font-weight: bold; color: #e11d48; width: 45px; text-align: right;">+30%</span>
    </div>
    
    <div style="display: flex; justify-content: space-between; font-size: 15px; margin-top: 10px; font-weight: bold; padding: 8px; background: #ffe4e6; border-radius: 4px;">
      <span style="color: #e11d48;">Your Profit:</span>
      <span id="calculated-profit" style="color: #e11d48;">Calculating...</span>
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 16px; margin-top: 5px; font-weight: bold;">
      <span style="color: #111827;">Customer End Price:</span>
      <span id="customer-total-price" style="color: #10b981;">Calculating...</span>
    </div>
  </div>
</div>

<script>
  function updateShopifyPrice(basePrice) {
    var slider = document.getElementById('markup-range');
    var percentLabel = document.getElementById('markup-percent');
    var profitLabel = document.getElementById('calculated-profit');
    var totalLabel = document.getElementById('customer-total-price');
    
    var markupPercent = parseInt(slider.value);
    var profit = basePrice * (markupPercent / 100);
    var total = basePrice + profit;
    
    percentLabel.innerText = "+" + markupPercent + "%";
    profitLabel.innerText = "₹" + profit.toFixed(2);
    totalLabel.innerText = "₹" + total.toFixed(2);
  }
  document.addEventListener("DOMContentLoaded", function() {
    updateShopifyPrice({{ product.price | divided_by: 100.0 }});
  });
</script>`
  },
  {
    id: "snip-2",
    title: "WhatsApp Reseller Order Direct Integration",
    description: "Adds a 'Share on WhatsApp' checkout button so customers can buy from resellers, sending order details directly to their WhatsApp number.",
    category: "cart",
    liquidCode: `<!-- file: snippets/meesho-whatsapp-share.liquid -->
{% assign reseller_phone = shop.metafields.meesho.default_reseller_phone | default: '919876543210' %}

<div class="whatsapp-resell-button-wrapper" style="margin: 15px 0;">
  <a href="#" 
     id="whatsapp-share-btn" 
     style="display: flex; align-items: center; justify-content: center; gap: 8px; background-color: #25d366; color: white; text-decoration: none; font-weight: bold; font-family: sans-serif; padding: 12px 24px; border-radius: 30px; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); transition: all 0.2s;"
     target="_blank">
    <!-- WhatsApp Icon SVG -->
    <svg style="width: 20px; height: 20px; fill: currentColor;" viewBox="0 0 24 24">
      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.37 5.035L2 22l5.135-1.348a9.94 9.94 0 004.877 1.28h.005c5.504 0 9.989-4.478 9.99-9.984A9.97 9.97 0 0012.012 2zm5.82 14.128c-.253.712-1.464 1.306-2.023 1.383-.513.072-1.182.115-3.32-.771-2.735-1.134-4.52-3.918-4.656-4.1a4.85 4.85 0 01-1.025-2.607c0-1.385.72-2.113.978-2.378.258-.266.568-.332.756-.332.188 0 .376.002.539.01.17.008.397-.064.621.472.23.548.784 1.916.852 2.054.068.138.113.298.022.481-.09.183-.135.298-.27.458-.135.16-.285.358-.407.48-.137.137-.28.287-.12.56.16.272.71 1.171 1.523 1.896.994.887 1.828 1.16 2.087 1.298.258.137.407.114.56-.06.15-.174.646-.75.82-1.008.174-.258.348-.214.586-.126.237.088 1.51.711 1.77.84.26.13.432.194.496.305.064.11.064.643-.19 1.355z"/>
    </svg>
    Resell & Order via WhatsApp
  </a>
</div>

<script>
  document.addEventListener("DOMContentLoaded", function() {
    var whatsappBtn = document.getElementById('whatsapp-share-btn');
    var productTitle = "{{ product.title | escape }}";
    var productUrl = window.location.href;
    var supplierPrice = "{{ product.price | money }}";
    
    // Construct pre-filled message for WhatsApp
    var message = "Hello! I would like to order the product: " + productTitle + "\\n\\nPrice: " + supplierPrice + "\\nCheck out the details here: " + productUrl + "\\n\\nPlease share your delivery address to proceed with the order!";
    var encodedMessage = encodeURIComponent(message);
    
    whatsappBtn.href = "https://api.whatsapp.com/send?phone=" + "{{ reseller_phone }}" + "&text=" + encodedMessage;
  });
</script>`
  },
  {
    id: "snip-3",
    title: "Meesho Multi-Supplier Dropship Handler",
    description: "Inserts structured Shopify Metafields for tracking suppliers, allowing resellers to easily request dropshipping directly to clients.",
    category: "utility",
    liquidCode: `<!-- file: templates/product.meesho-meta.liquid -->
{% comment %}
  Track Meesho Supplier Metafields automatically for dropship fulfillment
{% endcomment %}
<div class="meesho-supplier-meta" style="font-family: sans-serif; font-size: 13px; color: #4b5563; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin-top: 15px;">
  <div style="font-weight: 600; color: #1f2937; margin-bottom: 6px; display: flex; align-items: center; gap: 5px;">
    <span style="display:inline-block; width: 8px; height: 8px; background-color: #10b981; border-radius: 50%;"></span>
    Meesho Integration Active
  </div>
  <p style="margin: 3px 0;"><strong>Product ID:</strong> {{ product.id }}</p>
  <p style="margin: 3px 0;"><strong>Supplier Code:</strong> {{ product.metafields.meesho.supplier_code | default: 'SUPL-RADHA-TEXTILES' }}</p>
  <p style="margin: 3px 0;"><strong>Auto-Sync Status:</strong> <span style="color: #047857; font-weight: 600;">Verified</span></p>
  
  <div style="margin-top: 8px; border-top: 1px solid #e5e7eb; padding-top: 8px; font-size: 11px; color: #6b7280;">
    Supplier details are hidden from the store's public customer facing interface, accessible only to logged-in verified resellers.
  </div>
</div>`
  }
];
