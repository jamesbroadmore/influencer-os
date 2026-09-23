import React, { useState, useEffect } from 'react';
import {
  SEED_BUSINESS,
  SEED_CREATOR,
  SEED_TAX_PROFILE,
  SEED_OPERATING_PROFILE,
  SEED_CLIENTS,
  SEED_BOOKINGS,
  SEED_QUOTES,
  SEED_INVOICES,
  SEED_PRODUCTS,
  SEED_ORDERS,
  SEED_PLATFORM_PAYOUTS,
  SEED_EXPENSES,
  SEED_BANK_ACCOUNTS,
  SEED_BANK_TRANSACTIONS,
  SEED_JOURNAL_ENTRIES,
  SEED_BAS_PERIOD,
  SEED_OBLIGATIONS
} from './data/seedData';
import {
  BusinessIdentity,
  CreatorProfile,
  TaxProfile,
  OperatingProfile,
  Client,
  Booking,
  Quote,
  Invoice,
  Product,
  Order,
  PlatformPayout,
  Expense,
  BankAccount,
  BankTransaction,
  JournalEntry,
  BASPeriod,
  ObligationItem
} from './types';
import { OnboardingModal } from './components/OnboardingModal';
import { HomeDashboard } from './components/HomeDashboard';
import { BookingsView } from './components/BookingsView';
import { SalesView } from './components/SalesView';
import { InvoicesView } from './components/InvoicesView';
import { MoneyView } from './components/MoneyView';
import { ComplianceRadarView } from './components/ComplianceRadarView';
import { AccountantPortalView } from './components/AccountantPortalView';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  FileText,
  Landmark,
  ShieldCheck,
  Briefcase,
  Sparkles,
  Menu,
  X,
  RefreshCw,
  Settings,
  LogIn,
  CheckCircle2
} from 'lucide-react';

function AppContent() {
  const { user, userProfile, theme, saveBusinessIdentity } = useAuth();

  // App state
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('creatorledger_onboarded') === 'true';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // Core Data Stores
  const [business, setBusiness] = useState<BusinessIdentity>(SEED_BUSINESS);
  const [creator, setCreator] = useState<CreatorProfile>(SEED_CREATOR);
  const [taxProfile, setTaxProfile] = useState<TaxProfile>(SEED_TAX_PROFILE);
  const [operatingProfile, setOperatingProfile] = useState<OperatingProfile>(SEED_OPERATING_PROFILE);
  const [clients, setClients] = useState<Client[]>(SEED_CLIENTS);
  const [bookings, setBookings] = useState<Booking[]>(SEED_BOOKINGS);
  const [quotes, setQuotes] = useState<Quote[]>(SEED_QUOTES);
  const [invoices, setInvoices] = useState<Invoice[]>(SEED_INVOICES);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [payouts, setPayouts] = useState<PlatformPayout[]>(SEED_PLATFORM_PAYOUTS);
  const [expenses, setExpenses] = useState<Expense[]>(SEED_EXPENSES);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(SEED_BANK_ACCOUNTS);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(SEED_BANK_TRANSACTIONS);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(SEED_JOURNAL_ENTRIES);
  const [basPeriod, setBasPeriod] = useState<BASPeriod>(SEED_BAS_PERIOD);
  const [obligations, setObligations] = useState<ObligationItem[]>(SEED_OBLIGATIONS);

  // Synchronize Firestore user data if present
  useEffect(() => {
    if (userProfile?.businessIdentity) {
      setBusiness(prev => ({ ...prev, ...userProfile.businessIdentity }));
    }
    if (userProfile?.taxProfile) {
      setTaxProfile(prev => ({ ...prev, ...userProfile.taxProfile }));
    }
  }, [userProfile]);

  // Handlers
  const handleOnboardingComplete = (data: {
    business: BusinessIdentity;
    creator: CreatorProfile;
    taxProfile: TaxProfile;
    operatingProfile: OperatingProfile;
  }) => {
    setBusiness(data.business);
    setCreator(data.creator);
    setTaxProfile(data.taxProfile);
    setOperatingProfile(data.operatingProfile);
    setIsOnboarded(true);
    localStorage.setItem('creatorledger_onboarded', 'true');
    if (user) {
      saveBusinessIdentity(data.business, data.taxProfile);
    }
  };

  const handleRestartOnboarding = () => {
    localStorage.removeItem('creatorledger_onboarded');
    setIsOnboarded(false);
  };

  const handleAddBooking = (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);
  };

  const handleAddClient = (newClient: Client) => {
    setClients(prev => [...prev, newClient]);
  };

  const handleUpdateBookingStatus = (bookingId: string, status: Booking['status']) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status } : b))
    );
  };

  const handleAddInvoice = (newInvoice: Invoice) => {
    setInvoices(prev => [newInvoice, ...prev]);
  };

  const handleAddExpense = (newExpense: Expense) => {
    setExpenses(prev => [newExpense, ...prev]);
  };

  const handleReconcileTransaction = (txnId: string, accountId: string, notes?: string) => {
    setBankTransactions(prev =>
      prev.map(t => (t.id === txnId ? { ...t, reconciled: true } : t))
    );
  };

  const handleMarkInvoicePaid = (invoiceId: string) => {
    setInvoices(prev =>
      prev.map(i => (i.id === invoiceId ? { ...i, status: 'paid' as const } : i))
    );
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleAddPayout = (newPayout: PlatformPayout) => {
    setPayouts(prev => [newPayout, ...prev]);
  };

  const handleLockBASPeriod = (_periodId: string) => {
    setBasPeriod(prev => ({ ...prev, status: 'LOCKED' }));
  };

  const handleConvertBookingToInvoice = (booking: Booking) => {
    const isTaxInvoice = taxProfile.gstRegistered;
    const gstRate = isTaxInvoice ? 0.10 : 0;
    const subtotal = booking.fee;
    const gstTotal = Math.round(subtotal * gstRate * 100) / 100;
    const total = subtotal + gstTotal;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${String(invoices.length + 1).padStart(6, '0')}`,
      clientId: booking.clientId,
      isTaxInvoice,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      items: [
        {
          id: `itm-${Date.now()}`,
          description: `${booking.campaignName} Deliverables (${booking.deliverables.join(', ')})`,
          quantity: 1,
          unitPrice: booking.fee,
          gstRate,
          amount: subtotal
        }
      ],
      subtotal,
      gstTotal,
      total,
      status: 'issued',
      notes: `Generated from booking ${booking.id}. Deliverables: ${booking.deliverables.join(' | ')}. Payment remittance due within 14 days.`,
      auditTrail: [`Generated from booking ${booking.id}`]
    };

    setInvoices(prev => [newInvoice, ...prev]);
    setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'invoiced' as const } : b));
    setActiveTab('invoices');
  };

  const handleConvertQuoteToInvoice = (quote: Quote) => {
    const isTaxInvoice = taxProfile.gstRegistered;
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${String(invoices.length + 1).padStart(6, '0')}`,
      clientId: quote.clientId,
      isTaxInvoice,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      items: [
        {
          id: `itm-${Date.now()}`,
          description: `Quote ${quote.quoteNumber} Deliverables: ${quote.deliverables.join(' | ')}`,
          quantity: 1,
          unitPrice: quote.subtotal,
          gstRate: isTaxInvoice ? 0.10 : 0,
          amount: quote.subtotal
        }
      ],
      subtotal: quote.subtotal,
      gstTotal: quote.gstAmount,
      total: quote.total,
      status: 'issued',
      notes: `Converted from accepted quote ${quote.quoteNumber}. Usage rights: ${quote.usageRights}`,
      auditTrail: [`Converted from Quote ${quote.quoteNumber}`]
    };

    setInvoices(prev => [newInvoice, ...prev]);
    setActiveTab('invoices');
  };

  const navItems = [
    { id: 'dashboard', label: 'Home Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings & CRM', icon: Calendar, badge: bookings.length },
    { id: 'sales', label: 'Sales & Payouts', icon: ShoppingBag },
    { id: 'invoices', label: 'Tax Invoices', icon: FileText, badge: invoices.filter(i => i.status === 'issued').length },
    { id: 'money', label: 'Money & Ledger', icon: Landmark },
    { id: 'compliance', label: 'Compliance Radar', icon: ShieldCheck, badge: 'ATO' },
    { id: 'accountant', label: 'Accountant Portal', icon: Briefcase }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Onboarding Wizard Gate */}
      {!isOnboarded && (
        <OnboardingModal
          isOpen={!isOnboarded}
          onClose={() => setIsOnboarded(true)}
          business={business}
          taxProfile={taxProfile}
          operatingProfile={operatingProfile}
          creatorProfile={creator}
          onSave={(b, t, o, c) => {
            handleOnboardingComplete({
              business: b,
              creator: c,
              taxProfile: t,
              operatingProfile: o
            });
          }}
        />
      )}

      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 h-16 bg-[#07100f]/70 backdrop-blur-2xl border-b border-white/[0.08] px-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="size-8 rounded-xl bg-gradient-to-br from-emerald-300 via-emerald-500 to-teal-700 flex items-center justify-center font-bold text-[#06100e] text-xs shadow-lg shadow-emerald-500/25 font-display ring-1 ring-white/20">
              CL
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-tight font-display">
                creatorledger
              </span>
              <span className="text-[10px] text-emerald-400 font-mono ml-2 hidden sm:inline-block">
                Sole trader finance OS
              </span>
            </div>
          </div>
        </div>

        {/* Identity & Actions Bar */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-[11px]">
            <span className="text-white font-medium">{business.legalName}</span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-400">ABN {business.abn}</span>
            <span className="text-neutral-500">·</span>
            <span className="text-emerald-400 font-semibold">{taxProfile.gstRegistered ? 'GST REGISTERED' : 'GST FREE'}</span>
          </div>

          {/* Ask Lex Assistant Trigger */}
          <button
            onClick={() => setAssistantOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-all flex items-center gap-1.5 font-medium cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Lex</span>
          </button>

          {/* Settings Menu Button */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            title="Settings (Theme, Notifications & Profile)"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Authentication / Cloud Status Button */}
          {user ? (
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 transition-colors cursor-pointer"
              title="Signed In Creator Profile"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <span className="hidden sm:inline-block max-w-[100px] truncate text-[11px] font-medium text-neutral-300">
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20"></span>
            </button>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 font-medium transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sign In</span>
            </button>
          )}

          <button
            onClick={handleRestartOnboarding}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            title="Re-run ABN & Entity Onboarding Wizard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden md:flex w-64 flex-col justify-between border-r border-white/[0.07] bg-[#07100f]/45 backdrop-blur-xl p-4 shrink-0">
          <nav className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
              Australian Operations
            </div>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-neutral-900 text-white font-semibold shadow-sm border border-neutral-800'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Sidebar Settings Link */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50 transition-all cursor-pointer mt-3 pt-3 border-t border-neutral-800/60"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-neutral-400" />
                <span>Settings & Alerts</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 capitalize">
                {theme}
              </span>
            </button>
          </nav>

          {/* Quick Legal Summary & Cloud Sync in Sidebar */}
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800/80 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-neutral-400 font-mono">REGULATORY PROFILE</div>
                {user ? (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Synced
                  </span>
                ) : (
                  <span className="text-[10px] text-neutral-500 font-mono">Local</span>
                )}
              </div>
              <div className="font-semibold text-white text-xs truncate">{creator.creatorHandle}</div>
              <div className="text-[11px] text-neutral-400 capitalize">
                {business.entityType.replace('_', ' ')}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono pt-1">
                FY {taxProfile.financialYear} Active
              </div>
            </div>

            {/* Lex Advisor Banner */}
            <button
              onClick={() => setAssistantOpen(true)}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/20 text-left hover:border-emerald-500/40 transition-all cursor-pointer flex items-center gap-2.5"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <div className="text-[11px] font-semibold text-emerald-300">Lex AI Advisor</div>
                <div className="text-[10px] text-neutral-400 truncate">ATO rules & contracts</div>
              </div>
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-neutral-950/95 backdrop-blur-md p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
                    CL
                  </div>
                  <span className="font-bold text-white text-base">creatorledger</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium ${
                        isActive ? 'bg-neutral-800 text-white' : 'text-neutral-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-emerald-400" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-700 text-white">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSettingsOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium text-neutral-400 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-neutral-400" />
                    <span>Settings & Appearance</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAssistantOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask Lex AI Advisor</span>
              </button>
            </div>
          </div>
        )}

        {/* View Routing & Dynamic View Display */}
        <main className="relative flex-1 overflow-y-auto bg-[#050b0a] p-4 sm:p-6 lg:p-8 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_72%_0%,rgba(16,185,129,0.10),transparent_31%),radial-gradient(circle_at_15%_20%,rgba(45,212,191,0.055),transparent_26%)] before:content-['']"><div className="relative">
          {activeTab === 'dashboard' && (
            <HomeDashboard
              business={business}
              creator={creator}
              taxProfile={taxProfile}
              clients={clients}
              bookings={bookings}
              invoices={invoices}
              orders={orders}
              payouts={payouts}
              expenses={expenses}
              bankAccounts={bankAccounts}
              basPeriod={basPeriod}
              obligations={obligations}
              onNavigate={setActiveTab}
              onOpenQuickAdd={(type) => {
                if (type === 'booking') setActiveTab('bookings');
                else if (type === 'invoice') setActiveTab('invoices');
                else if (type === 'sale') setActiveTab('sales');
                else if (type === 'expense') setActiveTab('money');
              }}
              onOpenAssistant={() => setAssistantOpen(true)}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingsView
              clients={clients}
              bookings={bookings}
              quotes={quotes}
              taxProfile={taxProfile}
              onAddBooking={handleAddBooking}
              onAddClient={handleAddClient}
              onConvertToInvoice={handleConvertBookingToInvoice}
              onConvertQuoteToInvoice={handleConvertQuoteToInvoice}
            />
          )}

          {activeTab === 'sales' && (
            <SalesView
              products={products}
              orders={orders}
              payouts={payouts}
              taxProfile={taxProfile}
              onAddProduct={handleAddProduct}
              onAddPayout={handleAddPayout}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesView
              invoices={invoices}
              clients={clients}
              business={business}
              taxProfile={taxProfile}
              onAddInvoice={handleAddInvoice}
              onMarkInvoicePaid={handleMarkInvoicePaid}
            />
          )}

          {activeTab === 'money' && (
            <MoneyView
              bankAccounts={bankAccounts}
              bankTransactions={bankTransactions}
              expenses={expenses}
              journalEntries={journalEntries}
              taxProfile={taxProfile}
              onAddExpense={handleAddExpense}
              onReconcileTransaction={(txnId: string) => handleReconcileTransaction(txnId, '')}
              onAddJournalEntry={(entry) => setJournalEntries(prev => [entry, ...prev])}
            />
          )}

          {activeTab === 'compliance' && (
            <ComplianceRadarView
              business={business}
              taxProfile={taxProfile}
              operatingProfile={operatingProfile}
              basPeriod={basPeriod}
              obligations={obligations}
              annualRevenue={bookings.reduce((acc, b) => acc + b.fee, 0) + payouts.reduce((acc, p) => acc + p.grossRevenue, 0)}
              annualTaxableIncome={54000}
              onLockBASPeriod={handleLockBASPeriod}
              onUpdateObligation={(updated) => {
                setObligations(prev => prev.map(o => o.id === updated.id ? updated : o));
              }}
            />
          )}

          {activeTab === 'accountant' && (
            <AccountantPortalView
              business={business}
              taxProfile={taxProfile}
              journalEntries={journalEntries}
              basPeriod={basPeriod}
              expenses={expenses}
              invoices={invoices}
              payouts={payouts}
              bankTransactions={bankTransactions}
              onLockPeriod={handleLockBASPeriod}
              onPostAdjustmentJournal={(entry) => setJournalEntries(prev => [entry, ...prev])}
            />
          )}
        </div></main>
      </div>

      {/* AI Assistant Drawer - Lex */}
      <AIAssistantDrawer
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        business={business}
        taxProfile={taxProfile}
      />

      {/* Settings Modal (Theme, Notifications, Account) */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        business={business}
        taxProfile={taxProfile}
        onOpenAuth={() => setAuthOpen(true)}
        onRestartOnboarding={handleRestartOnboarding}
      />

      {/* Auth Modal (Email/Password & Google Sign In) */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
export { App };
