import React from 'react';
import {
  BusinessIdentity,
  CreatorProfile,
  TaxProfile,
  Client,
  Booking,
  Invoice,
  Order,
  PlatformPayout,
  Expense,
  BankAccount,
  BASPeriod,
  ObligationItem
} from '../types';
import { formatAUD } from '../utils/taxAndRegulatoryEngine';
import {
  ArrowUpRight,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  AlertTriangle,
  Receipt,
  Sparkles,
  ChevronRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

interface HomeDashboardProps {
  business: BusinessIdentity;
  creator: CreatorProfile;
  taxProfile: TaxProfile;
  clients: Client[];
  bookings: Booking[];
  invoices: Invoice[];
  orders: Order[];
  payouts: PlatformPayout[];
  expenses: Expense[];
  bankAccounts: BankAccount[];
  basPeriod: BASPeriod;
  obligations: ObligationItem[];
  onNavigate: (tab: string) => void;
  onOpenQuickAdd: (type: 'booking' | 'sale' | 'expense' | 'invoice') => void;
  onOpenAssistant: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  business,
  creator,
  taxProfile,
  clients,
  bookings,
  invoices,
  orders,
  payouts,
  expenses,
  bankAccounts,
  basPeriod,
  obligations,
  onNavigate,
  onOpenQuickAdd,
  onOpenAssistant
}) => {
  // Calculations
  const totalCashBalance = bankAccounts.reduce((acc, b) => acc + b.balance, 0);
  const taxReserveBalance = bankAccounts.find(b => b.type === 'tax_reserve')?.balance || 0;

  // Revenue this month / period
  const paidInvoicesTotal = invoices
    .filter(i => i.status === 'paid')
    .reduce((acc, i) => acc + i.subtotal, 0);

  const storefrontOrdersTotal = orders
    .filter(o => o.status === 'completed')
    .reduce((acc, o) => acc + o.subtotal, 0);

  const grossPayoutsTotal = payouts.reduce((acc, p) => acc + p.grossRevenue, 0);
  const netPayoutsTotal = payouts.reduce((acc, p) => acc + p.netPayout, 0);

  const grossRevenue = paidInvoicesTotal + storefrontOrdersTotal + grossPayoutsTotal;
  const netRevenue = paidInvoicesTotal + storefrontOrdersTotal + netPayoutsTotal;

  // Outstanding invoices (owed to creator)
  const outstandingInvoices = invoices.filter(i => i.status === 'issued' || i.status === 'overdue');
  const outstandingTotal = outstandingInvoices.reduce((acc, i) => acc + i.total, 0);

  // Expenses
  const totalExpensesGross = expenses.reduce((acc, e) => acc + e.grossAmount, 0);
  const totalExpensesClaimable = expenses.reduce((acc, e) => acc + e.claimableAmount, 0);
  const totalGstCredits = expenses.reduce((acc, e) => acc + e.claimableGst, 0);

  // Net operating result
  const netOperatingResult = netRevenue - totalExpensesClaimable;

  // Active bookings
  const upcomingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'delivery' || b.status === 'invoiced');
  const bookedRevenuePipeline = bookings.reduce((acc, b) => acc + b.fee, 0);

  // Missing receipts
  const missingReceipts = expenses.filter(e => !e.receiptName);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner: Australian Business Greeting & Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono mb-1">
            <span>{creator.creatorHandle}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-semibold">{business.legalName}</span>
            <span aria-hidden="true">·</span>
            <span>ABN {business.abn}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            Good day, {creator.creatorHandle.replace('@', '')}.
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Know what is yours, what is set aside, and what needs doing next — without the admin headache.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenQuickAdd('booking')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-100 transition-colors border border-neutral-700/60"
          >
            + New Booking
          </button>
          <button
            onClick={() => onOpenQuickAdd('invoice')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all"
          >
            + Issue Tax Invoice
          </button>
          <button
            onClick={onOpenAssistant}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 hover:text-emerald-300 transition-colors border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer"
            title="Ask AI Assistant Lex"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ask Lex
          </button>
        </div>
      </div>

      {/* 5 Core Questions Answer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
          <div className="text-xs text-neutral-400 font-medium">1. What have I booked?</div>
          <div className="my-2">
            <div className="text-xl font-bold text-white tabular-nums">{formatAUD(bookedRevenuePipeline)}</div>
            <div className="text-[11px] text-neutral-400">{bookings.length} deals in pipeline</div>
          </div>
          <button onClick={() => onNavigate('bookings')} className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
            View Bookings <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
          <div className="text-xs text-neutral-400 font-medium">2. What am I owed?</div>
          <div className="my-2">
            <div className="text-xl font-bold text-amber-300 tabular-nums">{formatAUD(outstandingTotal)}</div>
            <div className="text-[11px] text-neutral-400">{outstandingInvoices.length} unpaid invoices</div>
          </div>
          <button onClick={() => onNavigate('invoices')} className="text-xs text-amber-400 hover:underline flex items-center gap-1">
            View Invoices <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
          <div className="text-xs text-neutral-400 font-medium">3. What have I spent?</div>
          <div className="my-2">
            <div className="text-xl font-bold text-white tabular-nums">{formatAUD(totalExpensesGross)}</div>
            <div className="text-[11px] text-neutral-400">{formatAUD(totalExpensesClaimable)} tax claimable</div>
          </div>
          <button onClick={() => onNavigate('money')} className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
            View Expenses <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
          <div className="text-xs text-neutral-400 font-medium">4. Next Tax / BAS?</div>
          <div className="my-2">
            <div className="text-xl font-bold text-emerald-400 tabular-nums">{formatAUD(basPeriod.netGstPayable)}</div>
            <div className="text-[11px] text-neutral-400">Due in 36 days (Q1 BAS)</div>
          </div>
          <button onClick={() => onNavigate('compliance')} className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
            BAS Workspace <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
          <div className="text-xs text-neutral-400 font-medium">5. Accountant Needs?</div>
          <div className="my-2">
            <div className="text-xl font-bold text-neutral-200 tabular-nums">
              {missingReceipts.length} items
            </div>
            <div className="text-[11px] text-rose-400">2 receipts missing image</div>
          </div>
          <button onClick={() => onNavigate('accountant')} className="text-xs text-neutral-300 hover:underline flex items-center gap-1">
            Accountant Portal <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Financial Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Operating Cash at Bank</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">
            {formatAUD(totalCashBalance)}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-neutral-400">
            <span>Up Bank: {formatAUD(bankAccounts[0]?.balance || 0)}</span>
            <span aria-hidden="true">·</span>
            <span>Reserve: {formatAUD(taxReserveBalance)}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Gross Revenue (FYTD)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">
            {formatAUD(grossRevenue)}
          </div>
          <div className="text-xs text-neutral-400 mt-2">
            Net received: <span className="text-neutral-200 tabular-nums">{formatAUD(netRevenue)}</span> (after platform takes)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Net Operating Result</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">
            {formatAUD(netOperatingResult)}
          </div>
          <div className="text-xs text-emerald-400 mt-2">
            Healthy commercial operating margin
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>GST Position (Quarter 1)</span>
            <Receipt className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">
            {formatAUD(basPeriod.netGstPayable)}
          </div>
          <div className="text-xs text-neutral-400 mt-2">
            1A: {formatAUD(basPeriod.gst1aSalesGst)} / 1B: {formatAUD(basPeriod.gst1bPurchaseGstCredits)}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Operations (Bookings & Deliverables) & Compliance Radar Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Bookings & Operational Workflow (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Campaigns Card */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-white text-sm">Upcoming Bookings & Deliverables</h3>
              </div>
              <button
                onClick={() => onNavigate('bookings')}
                className="text-xs text-neutral-400 hover:text-white transition-colors"
              >
                View all ({bookings.length}) →
              </button>
            </div>

            <div className="space-y-3">
              {upcomingBookings.map((b) => {
                const client = clients.find(c => c.id === b.clientId);
                return (
                  <div
                    key={b.id}
                    onClick={() => onNavigate('bookings')}
                    className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-neutral-400 mb-0.5">
                        <span className="font-medium text-white">{client?.tradingName || 'Brand'}</span>
                        <span aria-hidden="true">·</span>
                        <span>{b.startDate} to {b.endDate}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{b.bookingType.replace('_', ' ')}</span>
                      </div>
                      <div className="text-sm font-semibold text-white">{b.campaignName}</div>
                      <div className="text-xs text-neutral-400 mt-1">
                        {b.deliverables[0]} {b.deliverables.length > 1 && `(+${b.deliverables.length - 1} more)`}
                      </div>
                    </div>

                    <div className="text-right sm:shrink-0">
                      <div className="text-sm font-bold text-white tabular-nums">{formatAUD(b.fee)}</div>
                      <div className="text-[11px] text-neutral-400">
                        Status: <span className="uppercase text-emerald-400 font-mono text-[10px]">{b.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Platform Payout Unbundling Story */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white text-sm">Platform Payout Economic Story</h3>
                <p className="text-xs text-neutral-400">
                  Preserving gross revenue, platform cuts, merchant fees and net AU bank settlements.
                </p>
              </div>
              <button
                onClick={() => onNavigate('sales')}
                className="text-xs text-neutral-400 hover:text-white"
              >
                All payouts →
              </button>
            </div>

            <div className="space-y-3">
              {payouts.slice(0, 2).map((p) => (
                <div key={p.id} className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 text-xs">
                  <div className="flex items-center justify-between font-medium text-white mb-2">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      {p.platform} Settlement ({p.depositDate})
                    </span>
                    <span className="text-emerald-400 font-bold tabular-nums">
                      Net: {formatAUD(p.netPayout)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-800 text-[11px] text-neutral-400">
                    <div>Gross: <span className="text-neutral-200 tabular-nums">{formatAUD(p.grossRevenue)}</span></div>
                    <div>Platform cut: <span className="text-rose-400 tabular-nums">-{formatAUD(p.platformFee)}</span></div>
                    <div>Fees: <span className="text-neutral-300 tabular-nums">-{formatAUD(p.paymentProcessingFee)}</span></div>
                    <div>Agency: <span className="text-neutral-300 tabular-nums">-{formatAUD(p.managementCommission)}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Compliance Radar Overview */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-white text-sm">Compliance Radar</h3>
              </div>
              <button
                onClick={() => onNavigate('compliance')}
                className="text-xs text-emerald-400 hover:underline"
              >
                Open Radar →
              </button>
            </div>

            <div className="space-y-2.5">
              {obligations.map((ob) => {
                let badgeClass = 'text-emerald-400';
                if (ob.status === 'ACTION_REQUIRED') badgeClass = 'text-rose-400';
                if (ob.status === 'REVIEW_REQUIRED') badgeClass = 'text-amber-400';
                if (ob.status === 'APPROACHING') badgeClass = 'text-cyan-400';

                return (
                  <div
                    key={ob.id}
                    onClick={() => onNavigate('compliance')}
                    className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-neutral-400 text-[11px]">{ob.authority}</span>
                      <span className={`text-[10px] font-mono font-semibold ${badgeClass}`}>
                        {ob.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-white line-clamp-1">{ob.title}</div>
                    <div className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5">{ob.summary}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Bank Accounts Balances */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center justify-between mb-3 text-sm font-semibold text-white">
              <span>Connected Bank Accounts</span>
              <button onClick={() => onNavigate('money')} className="text-xs text-neutral-400 hover:text-white">
                Reconcile →
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {bankAccounts.map((acc) => (
                <div key={acc.id} className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-neutral-200">{acc.bankName}</div>
                    <div className="text-[10px] text-neutral-400 font-mono">{acc.bsb} · {acc.accountNumber}</div>
                  </div>
                  <div className="text-right font-bold text-white tabular-nums">
                    {formatAUD(acc.balance)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
