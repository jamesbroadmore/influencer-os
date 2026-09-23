import React, { useState } from 'react';
import {
  BankAccount,
  BankTransaction,
  Expense,
  ExpenseCategory,
  JournalEntry,
  TaxProfile
} from '../types';
import { formatAUD } from '../utils/taxAndRegulatoryEngine';
import {
  Landmark,
  Receipt,
  BookOpen,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Upload,
  AlertCircle,
  FileCheck,
  Search,
  Filter,
  ArrowRight,
  Camera,
  Eye,
  X
} from 'lucide-react';
import { ReceiptScannerModal } from './ReceiptScannerModal';
import { ReceiptGalleryCarousel } from './ReceiptGalleryCarousel';

interface MoneyViewProps {
  bankAccounts: BankAccount[];
  bankTransactions: BankTransaction[];
  expenses: Expense[];
  journalEntries: JournalEntry[];
  taxProfile: TaxProfile;
  onAddExpense: (expense: Expense) => void;
  onReconcileTransaction: (transactionId: string) => void;
  onAddJournalEntry: (entry: JournalEntry) => void;
}

export const MoneyView: React.FC<MoneyViewProps> = ({
  bankAccounts,
  bankTransactions,
  expenses,
  journalEntries,
  taxProfile,
  onAddExpense,
  onReconcileTransaction,
  onAddJournalEntry
}) => {
  const [activeTab, setActiveTab] = useState<'banking' | 'expenses' | 'receipts' | 'ledger'>('expenses');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState<{ url: string; name: string } | null>(null);
  const [expenseSearch, setExpenseSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // New Expense Form State
  const [newExpSupplier, setNewExpSupplier] = useState('');
  const [newExpSupplierAbn, setNewExpSupplierAbn] = useState('');
  const [newExpCategory, setNewExpCategory] = useState<ExpenseCategory>('Photography & Studio');
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpGross, setNewExpGross] = useState<number>(0);
  const [newExpBusinessPct, setNewExpBusinessPct] = useState<number>(100);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [uploadedReceiptName, setUploadedReceiptName] = useState<string>('');

  // Handle Simulated OCR
  const handleSimulateOcr = () => {
    setIsOcrProcessing(true);
    setTimeout(() => {
      setIsOcrProcessing(false);
      setNewExpSupplier('Sun Studios Alexandria');
      setNewExpSupplierAbn('22 109 481 024');
      setNewExpCategory('Photography & Studio');
      setNewExpDesc('Studio Bay 2 Half-day Rental + C-Stands & Sandbags');
      setNewExpGross(770.00);
      setNewExpBusinessPct(100);
      setUploadedReceiptName('SunStudios-TaxInvoice-INV9912.pdf');
    }, 900);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpSupplier || newExpGross <= 0) return;

    const gstAmount = taxProfile.gstRegistered ? Math.round((newExpGross / 11) * 100) / 100 : 0;
    const netAmount = newExpGross - gstAmount;
    const claimableAmount = Math.round((newExpGross * (newExpBusinessPct / 100)) * 100) / 100;
    const claimableGst = Math.round((gstAmount * (newExpBusinessPct / 100)) * 100) / 100;

    let deductibilityConfidence: 'HIGH' | 'REVIEW' | 'RULE_DEPENDENT' = 'HIGH';
    let taxNotes = 'Recorded with verified tax invoice.';

    if (newExpCategory === 'Costumes & Business Clothing') {
      deductibilityConfidence = 'REVIEW';
      taxNotes = 'Conventional clothing review required by ATO guidelines.';
    } else if (newExpBusinessPct < 100) {
      taxNotes = `${newExpBusinessPct}% business apportionment logged with substantiated usage diary.`;
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      supplier: newExpSupplier,
      supplierAbn: newExpSupplierAbn || undefined,
      category: newExpCategory,
      description: newExpDesc,
      grossAmount: newExpGross,
      gstAmount,
      netAmount,
      businessUsePercentage: newExpBusinessPct,
      claimableAmount,
      claimableGst,
      deductibilityConfidence,
      taxNotes,
      receiptName: uploadedReceiptName || undefined,
      receiptOcrVerified: !!uploadedReceiptName,
      isReconciled: false
    };

    onAddExpense(newExpense);
    setShowAddExpenseModal(false);
    // Reset form
    setNewExpSupplier('');
    setNewExpSupplierAbn('');
    setNewExpDesc('');
    setNewExpGross(0);
    setNewExpBusinessPct(100);
    setUploadedReceiptName('');
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchSearch = exp.supplier.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      exp.description.toLowerCase().includes(expenseSearch.toLowerCase());
    const matchCategory = categoryFilter === 'all' || exp.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const unreconciledTxCount = bankTransactions.filter(t => t.status !== 'RECONCILED' && t.status !== 'LOCKED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header and Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Money, Ledger & Banking</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real Australian bank reconciliation, verified expense tracking, and balanced double-entry journals.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('banking')}
            className={`px-3.5 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'banking' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-emerald-400" />
            Bank Accounts & Feed
            {unreconciledTxCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3.5 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'expenses' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-400" />
            Expense Manager
          </button>
          <button
            onClick={() => setActiveTab('receipts')}
            className={`px-3.5 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'receipts' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            Receipt Vault
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {expenses.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3.5 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'ledger' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            General Ledger
          </button>
        </div>
      </div>

      {/* TAB 1: BANK ACCOUNTS & IMPORTED TRANSACTIONS */}
      {activeTab === 'banking' && (
        <div className="space-y-6">
          {/* Bank Accounts Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankAccounts.map(account => (
              <div key={account.id} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono text-neutral-400">{account.bankName}</span>
                    <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Direct Feed Active
                    </span>
                  </div>
                  <h3 className="font-semibold text-white text-base">{account.accountName}</h3>
                  <div className="text-xs text-neutral-400 font-mono mt-0.5">
                    BSB {account.bsb} · Account {account.accountNumber}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-neutral-400">Available Balance</div>
                    <div className="text-2xl font-bold text-white tabular-nums">{formatAUD(account.balance)}</div>
                  </div>
                  <div className="text-right text-[11px] text-neutral-400">
                    {account.type === 'tax_reserve' ? (
                      <span className="text-amber-400 font-medium">Protected Tax Escrow</span>
                    ) : (
                      <span>Everyday Operating</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bank Transactions Reconciliation Section */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-semibold text-white text-base">Bank Feed & Reconciliation</h3>
                <p className="text-xs text-neutral-400">
                  Every figure in creatorledger traces from bank statement to journal entry. Match pending items below.
                </p>
              </div>
              <div className="text-xs text-neutral-400">
                <span>{unreconciledTxCount} items awaiting reconciliation</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-mono text-[10px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Bank Description</th>
                    <th className="py-2.5 px-3">Matched Entity / Source</th>
                    <th className="py-2.5 px-3 text-right">Amount (AUD)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
                  {bankTransactions.map(tx => {
                    const isCredit = tx.amount > 0;
                    return (
                      <tr key={tx.id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="py-3 px-3 font-mono text-neutral-400 whitespace-nowrap">{tx.date}</td>
                        <td className="py-3 px-3 font-medium text-white max-w-xs truncate">{tx.description}</td>
                        <td className="py-3 px-3 text-neutral-400">
                          {tx.matchedType ? (
                            <span className="capitalize text-neutral-300">
                              {tx.matchedType} ({tx.matchedId || 'Internal'})
                            </span>
                          ) : (
                            <span className="text-neutral-500 italic">Unmatched</span>
                          )}
                        </td>
                        <td className={`py-3 px-3 text-right font-bold tabular-nums whitespace-nowrap ${
                          isCredit ? 'text-emerald-400' : 'text-neutral-100'
                        }`}>
                          {isCredit ? `+${formatAUD(tx.amount)}` : formatAUD(tx.amount)}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {tx.status === 'RECONCILED' ? (
                            <span className="text-[10px] font-mono text-emerald-400 font-semibold">RECONCILED</span>
                          ) : tx.status === 'MATCHED' ? (
                            <span className="text-[10px] font-mono text-amber-400 font-semibold">MATCHED</span>
                          ) : (
                            <span className="text-[10px] font-mono text-cyan-400 font-semibold">IMPORTED</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          {tx.status !== 'RECONCILED' ? (
                            <button
                              onClick={() => onReconcileTransaction(tx.id)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] transition-colors"
                            >
                              1-Click Reconcile
                            </button>
                          ) : (
                            <span className="text-neutral-500 text-[11px]">Locked</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXPENSE MANAGER */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          {/* Visual Scanned Receipts Carousel / Gallery */}
          <ReceiptGalleryCarousel
            expenses={expenses}
            taxProfile={taxProfile}
            onScanClick={() => setShowScannerModal(true)}
            onSelectExpense={(exp) => {
              setExpenseSearch(exp.supplier);
            }}
          />

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search supplier or description..."
                  value={expenseSearch}
                  onChange={e => setExpenseSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-950 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="py-1.5 px-3 text-xs bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Categories</option>
                <option value="Photography & Studio">Photography & Studio</option>
                <option value="Equipment & Cameras">Equipment & Cameras</option>
                <option value="Telecommunications">Telecommunications</option>
                <option value="Costumes & Business Clothing">Costumes & Business Clothing</option>
                <option value="Software & Subscriptions">Software & Subscriptions</option>
                <option value="Travel & Flights">Travel & Flights</option>
              </select>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setShowScannerModal(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 hover:text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                title="Scan paper receipt using camera"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Scan Document</span>
              </button>

              <button
                onClick={() => setShowAddExpenseModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Business Expense
              </button>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-mono text-[10px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Supplier & ABN</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-center">Business Use</th>
                    <th className="py-2.5 px-3 text-right">Gross Total</th>
                    <th className="py-2.5 px-3 text-right">Claimable Amount</th>
                    <th className="py-2.5 px-3 text-right">GST Credit</th>
                    <th className="py-2.5 px-3 text-center">Receipt Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
                  {filteredExpenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-3 px-3 font-mono text-neutral-400 whitespace-nowrap">{exp.date}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{exp.supplier}</div>
                        <div className="text-[11px] text-neutral-400 truncate max-w-xs">{exp.description}</div>
                        {exp.supplierAbn && (
                          <div className="text-[10px] text-neutral-500 font-mono">ABN {exp.supplierAbn}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-neutral-300">{exp.category}</td>
                      <td className="py-3 px-3 text-center font-mono">
                        <span className={exp.businessUsePercentage < 100 ? 'text-amber-400 font-bold' : 'text-neutral-300'}>
                          {exp.businessUsePercentage}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-medium tabular-nums">{formatAUD(exp.grossAmount)}</td>
                      <td className="py-3 px-3 text-right font-bold text-white tabular-nums">{formatAUD(exp.claimableAmount)}</td>
                      <td className="py-3 px-3 text-right text-emerald-400 tabular-nums">{formatAUD(exp.claimableGst)}</td>
                      <td className="py-3 px-3 text-center">
                        {exp.receiptUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewReceipt({
                                url: exp.receiptUrl!,
                                name: exp.receiptName || 'Scanned Document'
                              })
                            }
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-colors cursor-pointer"
                            title="View captured paper receipt image"
                          >
                            <Camera className="w-3 h-3 text-emerald-400" />
                            <span>View Scan</span>
                          </button>
                        ) : exp.receiptName ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400" title={exp.receiptName}>
                            <FileCheck className="w-3.5 h-3.5" /> Attached
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-rose-400">
                            <AlertCircle className="w-3.5 h-3.5" /> Missing
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEDICATED SCANNED RECEIPTS EVIDENCE VAULT */}
      {activeTab === 'receipts' && (
        <div className="space-y-6">
          <ReceiptGalleryCarousel
            expenses={expenses}
            taxProfile={taxProfile}
            onScanClick={() => setShowScannerModal(true)}
            onSelectExpense={(exp) => {
              setActiveTab('expenses');
              setExpenseSearch(exp.supplier);
            }}
          />
        </div>
      )}

      {/* TAB 4: GENERAL LEDGER & BALANCED JOURNALS */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 flex items-center justify-between">
            <div>
              <span className="font-bold text-white">Double-Entry Invariant:</span> Every posted transaction enforces{' '}
              <code className="text-emerald-400 font-mono">SUM(Debits) == SUM(Credits)</code>.
            </div>
            <span className="text-[11px] font-mono text-neutral-400">Australian Standard Chart of Accounts</span>
          </div>

          <div className="space-y-4">
            {journalEntries.map(entry => (
              <div key={entry.id} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-mono text-neutral-400">{entry.entryNumber}</span>
                    <span aria-hidden="true" className="mx-2 text-neutral-600">·</span>
                    <span className="font-semibold text-white">{entry.reference}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
                    <span>{entry.date}</span>
                    <span aria-hidden="true">·</span>
                    <span className={entry.isBalanced ? 'text-emerald-400' : 'text-rose-400'}>
                      {entry.isBalanced ? 'Balanced & Posted' : 'Out of Balance'}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400 text-[10px] font-mono uppercase">
                        <th className="py-1 px-2">Account</th>
                        <th className="py-1 px-2">Description</th>
                        <th className="py-1 px-2 text-right">Debit ($)</th>
                        <th className="py-1 px-2 text-right">Credit ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/40 text-neutral-200">
                      {entry.lines.map((line, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-2 font-mono text-neutral-300">
                            {line.accountCode} - {line.accountName}
                          </td>
                          <td className="py-2 px-2 text-neutral-400">{line.description}</td>
                          <td className="py-2 px-2 text-right font-mono tabular-nums text-white">
                            {line.debit > 0 ? formatAUD(line.debit) : '—'}
                          </td>
                          <td className="py-2 px-2 text-right font-mono tabular-nums text-white">
                            {line.credit > 0 ? formatAUD(line.credit) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-neutral-700 font-bold text-white text-[11px]">
                        <td colSpan={2} className="py-2 px-2 text-right uppercase tracking-wider font-mono">
                          Journal Totals:
                        </td>
                        <td className="py-2 px-2 text-right font-mono tabular-nums text-emerald-400">
                          {formatAUD(entry.totalDebit)}
                        </td>
                        <td className="py-2 px-2 text-right font-mono tabular-nums text-emerald-400">
                          {formatAUD(entry.totalCredit)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-sm text-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-semibold text-white text-base">Add Business Expense & Receipt</h3>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Scan Document with Camera Prompt */}
            <div className="p-3 mb-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold text-white">Have a paper tax invoice?</div>
                  <div className="text-[11px] text-emerald-300/80">Use your camera to auto-fill this form via Gemini Vision.</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddExpenseModal(false);
                  setShowScannerModal(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow transition-all shrink-0"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Launch Camera</span>
              </button>
            </div>

            {/* Smart OCR Simulator */}
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-medium text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Receipt OCR Engine
                </div>
                <div className="text-[11px] text-neutral-400">
                  {uploadedReceiptName ? `Loaded: ${uploadedReceiptName}` : 'Auto-extract supplier, ABN & GST from receipt voucher'}
                </div>
              </div>
              <button
                type="button"
                onClick={handleSimulateOcr}
                disabled={isOcrProcessing}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1"
              >
                {isOcrProcessing ? 'Reading Receipt...' : 'Simulate OCR'}
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  Supplier Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DigiDirect, Sun Studios, Telstra"
                  value={newExpSupplier}
                  onChange={e => setNewExpSupplier(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Supplier ABN (if available)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 22 109 481 024"
                    value={newExpSupplierAbn}
                    onChange={e => setNewExpSupplierAbn(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newExpCategory}
                    onChange={e => setNewExpCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Photography & Studio">Photography & Studio</option>
                    <option value="Equipment & Cameras">Equipment & Cameras</option>
                    <option value="Telecommunications">Telecommunications</option>
                    <option value="Costumes & Business Clothing">Costumes & Business Clothing</option>
                    <option value="Software & Subscriptions">Software & Subscriptions</option>
                    <option value="Travel & Flights">Travel & Flights</option>
                    <option value="Advertising">Advertising</option>
                    <option value="Contractors & Assistants">Contractors & Assistants</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  Description / Purpose
                </label>
                <input
                  type="text"
                  placeholder="e.g. Studio hire for Gymshark Spring campaign shoot"
                  value={newExpDesc}
                  onChange={e => setNewExpDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Gross Amount (AUD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newExpGross || ''}
                    onChange={e => setNewExpGross(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Business Use: {newExpBusinessPct}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={newExpBusinessPct}
                    onChange={e => setNewExpBusinessPct(parseInt(e.target.value))}
                    className="w-full mt-2 accent-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950/70 border border-neutral-800 text-xs text-neutral-400 space-y-1">
                <div>
                  Claimable Deduction: <span className="font-bold text-white tabular-nums">{formatAUD(newExpGross * (newExpBusinessPct / 100))}</span>
                </div>
                {taxProfile.gstRegistered && (
                  <div>
                    Estimated GST Input Credit (1B): <span className="font-bold text-emerald-400 tabular-nums">{formatAUD((newExpGross / 11) * (newExpBusinessPct / 100))}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 rounded-lg text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                >
                  Save & Post to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Camera Document Scanner Modal */}
      <ReceiptScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        taxProfile={taxProfile}
        onExpenseParsed={(newExp) => {
          onAddExpense(newExp);
        }}
      />

      {/* Scanned Document Image Lightbox / Evidence Viewer */}
      {previewReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white truncate max-w-xs">
                  {previewReceipt.name}
                </span>
              </div>
              <button
                onClick={() => setPreviewReceipt(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex items-center justify-center bg-black/40">
              <img
                src={previewReceipt.url}
                alt="Scanned Tax Invoice"
                className="max-h-[65vh] w-auto object-contain rounded-lg border border-neutral-800 shadow-md"
              />
            </div>
            <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
              <span>Substantiated ATO Tax Record</span>
              <button
                onClick={() => setPreviewReceipt(null)}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
