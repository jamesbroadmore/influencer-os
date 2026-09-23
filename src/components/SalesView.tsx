import React, { useState } from 'react';
import { Product, Order, PlatformPayout, TaxProfile } from '../types';
import { formatAUD } from '../utils/taxAndRegulatoryEngine';
import {
  ShoppingBag,
  TrendingUp,
  Package,
  Plus,
  Layers,
  ArrowRight,
  DollarSign,
  Globe,
  CheckCircle2
} from 'lucide-react';

interface SalesViewProps {
  products: Product[];
  orders: Order[];
  payouts: PlatformPayout[];
  taxProfile: TaxProfile;
  onAddProduct: (product: Product) => void;
  onAddPayout: (payout: PlatformPayout) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  products,
  orders,
  payouts,
  taxProfile,
  onAddProduct,
  onAddPayout
}) => {
  const [activeTab, setActiveTab] = useState<'payouts' | 'orders' | 'products'>('payouts');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddPayoutModal, setShowAddPayoutModal] = useState(false);

  // New Payout Form
  const [payoutPlatform, setPayoutPlatform] = useState<PlatformPayout['platform']>('OnlyFans');
  const [payoutGross, setPayoutGross] = useState<number>(5000);
  const [payoutPlatformCutPct, setPayoutPlatformCutPct] = useState<number>(20);
  const [payoutFeeAmount, setPayoutFeeAmount] = useState<number>(150);
  const [payoutCommissionPct, setPayoutCommissionPct] = useState<number>(10);

  // Calculations for new payout
  const calculatedPlatformFee = Math.round(payoutGross * (payoutPlatformCutPct / 100) * 100) / 100;
  const calculatedNetBeforeComm = payoutGross - calculatedPlatformFee - payoutFeeAmount;
  const calculatedCommission = Math.round(calculatedNetBeforeComm * (payoutCommissionPct / 100) * 100) / 100;
  const calculatedFinalDeposit = calculatedNetBeforeComm - calculatedCommission;

  const handleSavePayout = (e: React.FormEvent) => {
    e.preventDefault();
    const newPayout: PlatformPayout = {
      id: `pay-${Date.now()}`,
      platform: payoutPlatform,
      periodStart: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
      periodEnd: new Date().toISOString().split('T')[0],
      depositDate: new Date().toISOString().split('T')[0],
      grossRevenue: payoutGross,
      platformFee: calculatedPlatformFee,
      paymentProcessingFee: payoutFeeAmount,
      managementCommission: calculatedCommission,
      netPayout: calculatedFinalDeposit,
      status: 'deposited'
    };

    onAddPayout(newPayout);
    setShowAddPayoutModal(false);
  };

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdType, setNewProdType] = useState<Product['type']>('preset');
  const [newProdPrice, setNewProdPrice] = useState<number>(49);
  const [newProdCost, setNewProdCost] = useState<number>(0);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || newProdPrice <= 0) return;

    const newProd: Product = {
      id: `prd-${Date.now()}`,
      sku: newProdSku || `SKU-${Date.now().toString().slice(-4)}`,
      name: newProdName,
      description: 'Creator commercial product or digital offering.',
      type: newProdType,
      price: newProdPrice,
      cost: newProdCost,
      gstInclusive: true,
      inventoryEnabled: newProdType === 'physical',
      inventoryQuantity: newProdType === 'physical' ? 50 : 9999,
      active: true
    };

    onAddProduct(newProd);
    setShowAddProductModal(false);
    setNewProdName('');
    setNewProdSku('');
  };

  const totalGrossPayouts = payouts.reduce((acc, p) => acc + p.grossRevenue, 0);
  const totalNetPayouts = payouts.reduce((acc, p) => acc + p.netPayout, 0);
  const totalPlatformFeesDeducted = payouts.reduce((acc, p) => acc + p.platformFee + p.paymentProcessingFee + p.managementCommission, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Sales, Products & Platform Payouts</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Preserve the true economic story of your creator earnings across YouTube, OnlyFans, Patreon, and direct commerce.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-3.5 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'payouts' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Platform Payout Engine
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            Storefront Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'products' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-emerald-400" />
            Product Catalogue ({products.length})
          </button>
        </div>
      </div>

      {/* TAB 1: PLATFORM PAYOUT UNBUNDLING ENGINE */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          {/* Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="text-xs text-neutral-400">Total Gross Fan Revenue</div>
              <div className="text-2xl font-bold text-white tabular-nums mt-1">{formatAUD(totalGrossPayouts)}</div>
              <div className="text-[11px] text-neutral-400 mt-1">Direct from subscribers & viewers</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="text-xs text-neutral-400">Total Deductions (Fees & Agency)</div>
              <div className="text-2xl font-bold text-rose-400 tabular-nums mt-1">-{formatAUD(totalPlatformFeesDeducted)}</div>
              <div className="text-[11px] text-neutral-400 mt-1">Platform take, processing & manager cuts</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="text-xs text-neutral-400">Net Australian Bank Deposits</div>
              <div className="text-2xl font-bold text-emerald-400 tabular-nums mt-1">{formatAUD(totalNetPayouts)}</div>
              <div className="text-[11px] text-neutral-400 mt-1">Reconciled into Up Bank / CBA</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Platform Payout Settlements</h3>
              <p className="text-xs text-neutral-400">
                Storing gross revenue and separate fee lines prevents under-reporting income and missing fee expense deductions.
              </p>
            </div>
            <button
              onClick={() => setShowAddPayoutModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Log Platform Payout
            </button>
          </div>

          <div className="space-y-3">
            {payouts.map(p => (
              <div key={p.id} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span className="font-bold text-white text-base font-display">{p.platform} Settlement</span>
                    <span className="text-xs text-neutral-400 font-mono">
                      (Period: {p.periodStart} to {p.periodEnd})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400">Deposited {p.depositDate}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      {p.status}
                    </span>
                  </div>
                </div>

                {/* Economic Story Flow */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs">
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">1. Gross Fan Spend</span>
                    <span className="font-bold text-white text-sm tabular-nums">{formatAUD(p.grossRevenue)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">2. Platform Cut</span>
                    <span className="font-bold text-rose-400 text-sm tabular-nums">-{formatAUD(p.platformFee)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">3. Processing Fee</span>
                    <span className="font-medium text-neutral-300 text-sm tabular-nums">-{formatAUD(p.paymentProcessingFee)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">4. Manager Comm</span>
                    <span className="font-medium text-neutral-300 text-sm tabular-nums">-{formatAUD(p.managementCommission)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase font-mono">5. Net AU Deposit</span>
                    <span className="font-bold text-emerald-400 text-sm tabular-nums">{formatAUD(p.netPayout)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: STOREFRONT ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-mono text-[10px]">
                    <th className="py-2.5 px-3">Order #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Items</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                    <th className="py-2.5 px-3 text-right">GST</th>
                    <th className="py-2.5 px-3 text-right">Total AUD</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-white">{o.orderNumber}</td>
                      <td className="py-3 px-3 font-mono text-neutral-400">{o.date}</td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-white">{o.customerName}</div>
                        <div className="text-[11px] text-neutral-400">{o.customerEmail}</div>
                      </td>
                      <td className="py-3 px-3 text-neutral-300 max-w-xs truncate">{o.itemsSummary}</td>
                      <td className="py-3 px-3 text-right tabular-nums">{formatAUD(o.subtotal)}</td>
                      <td className="py-3 px-3 text-right tabular-nums text-emerald-400">{formatAUD(o.gstAmount)}</td>
                      <td className="py-3 px-3 text-right font-bold text-white tabular-nums">{formatAUD(o.total)}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS CATALOGUE */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-400">
              {products.length} offerings configured in your commercial catalogue
            </div>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Product or Service
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map(p => (
              <div key={p.id} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono text-neutral-400 text-[10px]">{p.sku}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold bg-neutral-800 text-neutral-300">
                      {p.type}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm font-display mb-1">{p.name}</h3>
                  <p className="text-xs text-neutral-400 line-clamp-2">{p.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-neutral-500 uppercase font-mono">Retail Price</div>
                    <div className="text-lg font-bold text-white tabular-nums">{formatAUD(p.price)}</div>
                  </div>
                  <div className="text-right text-[11px] text-neutral-400 font-mono">
                    {p.inventoryEnabled ? `${p.inventoryQuantity} in stock` : 'Instant Access'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOG PAYOUT MODAL */}
      {showAddPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-sm text-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-semibold text-white text-base">Record Platform Payout Settlement</h3>
              <button onClick={() => setShowAddPayoutModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSavePayout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  Creator Platform
                </label>
                <select
                  value={payoutPlatform}
                  onChange={e => setPayoutPlatform(e.target.value as PlatformPayout['platform'])}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="OnlyFans">OnlyFans (Standard 20% platform cut)</option>
                  <option value="YouTube">YouTube (AdSense / Partner 45% cut)</option>
                  <option value="Patreon">Patreon (Pro 8% + payment fee)</option>
                  <option value="TikTok">TikTok (Creator Rewards / Live)</option>
                  <option value="Fansly">Fansly</option>
                  <option value="Twitch">Twitch Subscriptions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  Gross Fan Spend (USD converted to AUD)
                </label>
                <input
                  type="number"
                  required
                  placeholder="5000"
                  value={payoutGross || ''}
                  onChange={e => setPayoutGross(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Platform Fee % ({payoutPlatformCutPct}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={payoutPlatformCutPct}
                    onChange={e => setPayoutPlatformCutPct(parseInt(e.target.value))}
                    className="w-full mt-2 accent-emerald-500"
                  />
                  <div className="text-[11px] text-neutral-400 mt-1">Cut: -{formatAUD(calculatedPlatformFee)}</div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Agency Commission % ({payoutCommissionPct}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={payoutCommissionPct}
                    onChange={e => setPayoutCommissionPct(parseInt(e.target.value))}
                    className="w-full mt-2 accent-emerald-500"
                  />
                  <div className="text-[11px] text-neutral-400 mt-1">Comm: -{formatAUD(calculatedCommission)}</div>
                </div>
              </div>

              {/* Economic Calculation Summary */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Gross Subscriber Spend:</span>
                  <span className="font-mono text-white tabular-nums">{formatAUD(payoutGross)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>Platform Fee ({payoutPlatformCutPct}%):</span>
                  <span className="font-mono tabular-nums">-{formatAUD(calculatedPlatformFee)}</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Wire / Processing Fee:</span>
                  <span className="font-mono tabular-nums">-{formatAUD(payoutFeeAmount)}</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Manager Commission ({payoutCommissionPct}%):</span>
                  <span className="font-mono tabular-nums">-{formatAUD(calculatedCommission)}</span>
                </div>
                <div className="pt-2 border-t border-neutral-800 flex justify-between font-bold text-sm text-emerald-400">
                  <span>Net Australian Bank Deposit:</span>
                  <span className="font-mono tabular-nums">{formatAUD(calculatedFinalDeposit)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPayoutModal(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                >
                  Post Payout to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-sm text-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-semibold text-white text-base">Add Product or Offering</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  Product / Service Name
                </label>
                <input
                  required
                  placeholder="e.g. Melbourne Autumn Lightroom Presets"
                  value={newProdName}
                  onChange={e => setNewProdName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    SKU Code
                  </label>
                  <input
                    placeholder="PRESET-03"
                    value={newProdSku}
                    onChange={e => setNewProdSku(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Type
                  </label>
                  <select
                    value={newProdType}
                    onChange={e => setNewProdType(e.target.value as Product['type'])}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="preset">Preset Pack</option>
                    <option value="digital">Digital Download / Guide</option>
                    <option value="physical">Physical Merch</option>
                    <option value="service">1-on-1 Consulting</option>
                    <option value="subscription">Subscription / Membership</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Retail Price (AUD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProdPrice || ''}
                    onChange={e => setNewProdPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Unit Cost (if physical)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProdCost || ''}
                    onChange={e => setNewProdCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
