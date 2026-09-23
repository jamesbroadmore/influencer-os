import React, { useState } from 'react';
import { Invoice, Client, BusinessIdentity, TaxProfile, InvoiceItem } from '../types';
import { formatAUD } from '../utils/taxAndRegulatoryEngine';
import {
  FileText,
  Plus,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Send,
  Download
} from 'lucide-react';

interface InvoicesViewProps {
  invoices: Invoice[];
  clients: Client[];
  business: BusinessIdentity;
  taxProfile: TaxProfile;
  onAddInvoice: (invoice: Invoice) => void;
  onMarkInvoicePaid: (invoiceId: string) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  clients,
  business,
  taxProfile,
  onAddInvoice,
  onMarkInvoicePaid
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Invoice Form State
  const [newClientId, setNewClientId] = useState(clients[0]?.id || '');
  const [newDueDate, setNewDueDate] = useState('');
  const [itemDesc, setItemDesc] = useState('Brand Campaign & UGC Content Creation (Reel + Stories)');
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number>(3500);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientId || itemPrice <= 0) return;

    const isTaxInvoice = taxProfile.gstRegistered;
    const gstRate = isTaxInvoice ? 0.10 : 0;
    const subtotal = itemQty * itemPrice;
    const gstTotal = Math.round(subtotal * gstRate * 100) / 100;
    const total = subtotal + gstTotal;

    const nextNumber = invoices.length + 1;
    const invoiceNumber = `INV-2026-${String(nextNumber).padStart(6, '0')}`;

    const items: InvoiceItem[] = [
      {
        id: `itm-${Date.now()}`,
        description: itemDesc,
        quantity: itemQty,
        unitPrice: itemPrice,
        gstRate,
        amount: subtotal
      }
    ];

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      clientId: newClientId,
      isTaxInvoice,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: newDueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      items,
      subtotal,
      gstTotal,
      total,
      status: 'issued',
      notes: 'Thank you for partnering with us. Please quote invoice number with payment.',
      auditTrail: [
        `Generated ${new Date().toISOString()}`,
        `Labelled ${isTaxInvoice ? 'TAX INVOICE' : 'INVOICE'} as per ATO GST status.`
      ]
    };

    onAddInvoice(newInvoice);
    setShowCreateModal(false);
    setSelectedInvoice(newInvoice);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Invoices & Tax Invoices</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Strict ATO compliance: Automatically renders as a Tax Invoice if GST registered, or standard Invoice if not.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" /> Issue New Invoice
        </button>
      </div>

      {/* ATO Guidance Notice */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start gap-3 text-xs text-neutral-300">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Australian Taxation Office (ATO) Compliance Rule:</span>{' '}
          {taxProfile.gstRegistered ? (
            <span>
              Your business is registered for GST. You are legally required to issue <strong>Tax Invoices</strong> that state the words &quot;Tax Invoice&quot;, display your ABN ({business.abn}), and show the GST amount clearly.
            </span>
          ) : (
            <span>
              Your business is NOT registered for GST. Invoices must be labelled &quot;Invoice&quot; (NOT &quot;Tax Invoice&quot;) and must not include any GST component.
            </span>
          )}
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-mono text-[10px]">
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Client</th>
                <th className="py-2.5 px-3">Issue Date</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3 text-right">Subtotal</th>
                <th className="py-2.5 px-3 text-right">GST Total</th>
                <th className="py-2.5 px-3 text-right">Total AUD</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
              {invoices.map(inv => {
                const client = clients.find(c => c.id === inv.clientId);
                return (
                  <tr key={inv.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-white">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="hover:text-emerald-400 underline decoration-dotted"
                      >
                        {inv.invoiceNumber}
                      </button>
                      <div className="text-[10px] text-neutral-500">
                        {inv.isTaxInvoice ? 'Tax Invoice' : 'Standard'}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{client?.tradingName || 'Client'}</div>
                      <div className="text-[11px] text-neutral-400">{client?.contactName}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-neutral-400">{inv.issueDate}</td>
                    <td className="py-3 px-3 font-mono text-neutral-400">{inv.dueDate}</td>
                    <td className="py-3 px-3 text-right tabular-nums">{formatAUD(inv.subtotal)}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-emerald-400">{formatAUD(inv.gstTotal)}</td>
                    <td className="py-3 px-3 text-right font-bold text-white tabular-nums">{formatAUD(inv.total)}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold ${
                        inv.status === 'paid'
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                          : inv.status === 'issued'
                          ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                          : 'text-neutral-400 bg-neutral-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] transition-colors"
                      >
                        View / Print
                      </button>
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => onMarkInvoicePaid(inv.id)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium transition-colors"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* OFFICIAL ATO TAX INVOICE MODAL / VIEWER */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-8 text-neutral-100 space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 print:hidden">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-neutral-400">Document Preview</span>
                <span className="text-emerald-400 text-xs font-semibold">ATO Compliant Template</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Official Document Body */}
            <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 text-xs text-neutral-200 space-y-6 font-sans">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white font-display">
                    {selectedInvoice.isTaxInvoice ? 'TAX INVOICE' : 'INVOICE'}
                  </h2>
                  <div className="text-emerald-400 font-mono text-sm mt-0.5">{selectedInvoice.invoiceNumber}</div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-white text-sm">{business.legalName}</div>
                  <div className="font-mono text-neutral-400">ABN: {business.abn}</div>
                  {business.acn && <div className="font-mono text-neutral-400">ACN: {business.acn}</div>}
                  <div className="text-neutral-400">{business.businessAddress}</div>
                  <div className="text-neutral-400">{business.contactEmail}</div>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-800">
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">
                    Billed To
                  </span>
                  {(() => {
                    const client = clients.find(c => c.id === selectedInvoice.clientId);
                    return (
                      <div>
                        <div className="font-bold text-white text-sm">{client?.legalName || 'Client'}</div>
                        {client?.tradingName && <div className="text-neutral-400">t/a {client.tradingName}</div>}
                        {client?.abn && <div className="font-mono text-neutral-400">ABN: {client.abn}</div>}
                        <div className="text-neutral-400">{client?.billingAddress}</div>
                        <div className="text-neutral-400">Attn: {client?.contactName} ({client?.email})</div>
                      </div>
                    );
                  })()}
                </div>

                <div className="text-right space-y-1">
                  <div>
                    <span className="text-neutral-500">Date of Issue: </span>
                    <span className="font-mono font-medium text-white">{selectedInvoice.issueDate}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Payment Due: </span>
                    <span className="font-mono font-medium text-white">{selectedInvoice.dueDate}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">GST Status: </span>
                    <span className="text-emerald-400 font-medium">
                      {selectedInvoice.isTaxInvoice ? '10% Taxable Supply' : 'Not Registered (GST-Free)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-neutral-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 font-mono text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">GST</th>
                      <th className="py-2.5 px-3 text-right">Amount (AUD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-200">
                    {selectedInvoice.items.map(item => (
                      <tr key={item.id}>
                        <td className="py-3 px-3 font-medium text-white">{item.description}</td>
                        <td className="py-3 px-3 text-center font-mono">{item.quantity}</td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums">{formatAUD(item.unitPrice)}</td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-400">
                          {item.gstRate > 0 ? `${item.gstRate * 100}%` : '0%'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-white tabular-nums">
                          {formatAUD(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal (excl. GST):</span>
                    <span className="font-mono tabular-nums text-white">{formatAUD(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>GST (10%):</span>
                    <span className="font-mono tabular-nums">{formatAUD(selectedInvoice.gstTotal)}</span>
                  </div>
                  <div className="pt-2 border-t border-neutral-800 flex justify-between font-bold text-sm text-white">
                    <span>Total Amount Due:</span>
                    <span className="font-mono tabular-nums text-emerald-400">{formatAUD(selectedInvoice.total)}</span>
                  </div>
                </div>
              </div>

              {/* Remittance Details */}
              <div className="pt-4 border-t border-neutral-800 text-neutral-400 space-y-1">
                <div className="font-semibold text-white">Payment Remittance Details:</div>
                <div>Bank: <span className="text-white">Up Bank (Business Account)</span></div>
                <div>Account Name: <span className="text-white">{business.legalName}</span></div>
                <div>BSB: <span className="font-mono text-white">633-123</span> · Account Number: <span className="font-mono text-white">49201948</span></div>
                <div>Reference: <span className="font-mono text-emerald-400">{selectedInvoice.invoiceNumber}</span></div>
              </div>

              {selectedInvoice.notes && (
                <div className="p-3 rounded bg-neutral-900/60 border border-neutral-800/60 text-[11px] text-neutral-400">
                  {selectedInvoice.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE INVOICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-sm text-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-semibold text-white text-base">
                Create {taxProfile.gstRegistered ? 'Tax Invoice (GST Registered)' : 'Standard Invoice'}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  Recipient Client / Agency
                </label>
                <select
                  value={newClientId}
                  onChange={e => setNewClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.tradingName} ({c.legalName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  Payment Due Date
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={e => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  Deliverable Line Item Description
                </label>
                <input
                  required
                  value={itemDesc}
                  onChange={e => setItemDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={itemQty}
                    onChange={e => setItemQty(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Unit Price (excl. GST)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={itemPrice || ''}
                    onChange={e => setItemPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono text-white tabular-nums">{formatAUD(itemQty * itemPrice)}</span>
                </div>
                {taxProfile.gstRegistered ? (
                  <div className="flex justify-between text-emerald-400">
                    <span>10% Australian GST:</span>
                    <span className="font-mono tabular-nums">+{formatAUD(itemQty * itemPrice * 0.10)}</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-neutral-500">Not GST registered. No GST added.</div>
                )}
                <div className="pt-1.5 border-t border-neutral-800 flex justify-between font-bold text-white">
                  <span>Total Amount Due:</span>
                  <span className="font-mono text-emerald-400 tabular-nums">
                    {formatAUD(itemQty * itemPrice * (taxProfile.gstRegistered ? 1.10 : 1.0))}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                >
                  Issue Tax Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
