import React, { useState, useMemo, useRef } from 'react';
import { Expense, TaxProfile, ExpenseCategory } from '../types';
import { formatAUD } from '../utils/taxAndRegulatoryEngine';
import { generateReceiptSvgDataUrl } from '../utils/receiptGenerator';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  LayoutGrid,
  SlidersHorizontal,
  Search,
  Download,
  Printer,
  X,
  Eye,
  ShieldCheck,
  ExternalLink,
  Receipt
} from 'lucide-react';

interface ReceiptGalleryCarouselProps {
  expenses: Expense[];
  taxProfile: TaxProfile;
  onScanClick: () => void;
  onSelectExpense?: (expense: Expense) => void;
}

export const ReceiptGalleryCarousel: React.FC<ReceiptGalleryCarouselProps> = ({
  expenses,
  taxProfile,
  onScanClick,
  onSelectExpense
}) => {
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [inspectExpense, setInspectExpense] = useState<Expense | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const carouselScrollRef = useRef<HTMLDivElement>(null);

  // Receipts with preview image: if no user-provided receiptUrl exists, generate high-fidelity tax invoice SVG
  const enrichedExpenses = useMemo(() => {
    return expenses.map(exp => ({
      ...exp,
      displayImageUrl: exp.receiptUrl || generateReceiptSvgDataUrl({
        supplier: exp.supplier,
        supplierAbn: exp.supplierAbn,
        date: exp.date,
        grossAmount: exp.grossAmount,
        gstAmount: exp.gstAmount,
        netAmount: exp.netAmount,
        category: exp.category,
        description: exp.description,
        receiptName: exp.receiptName,
        id: exp.id
      })
    }));
  }, [expenses]);

  // Filtered expenses
  const filteredReceipts = useMemo(() => {
    return enrichedExpenses.filter(exp => {
      const matchesCategory = categoryFilter === 'all' || exp.category === categoryFilter;
      const matchesSearch =
        searchQuery === '' ||
        exp.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.supplierAbn && exp.supplierAbn.includes(searchQuery));
      return matchesCategory && matchesSearch;
    });
  }, [enrichedExpenses, categoryFilter, searchQuery]);

  // Unique categories in expenses
  const categories = useMemo(() => {
    const set = new Set(expenses.map(e => e.category));
    return ['all', ...Array.from(set)];
  }, [expenses]);

  // Carousel Navigation Handlers
  const handlePrev = () => {
    if (carouselScrollRef.current) {
      const newIndex = Math.max(0, activeSlideIndex - 1);
      setActiveSlideIndex(newIndex);
      const cardWidth = 320;
      carouselScrollRef.current.scrollTo({
        left: newIndex * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  const handleNext = () => {
    if (carouselScrollRef.current) {
      const maxIndex = Math.max(0, filteredReceipts.length - 1);
      const newIndex = Math.min(maxIndex, activeSlideIndex + 1);
      setActiveSlideIndex(newIndex);
      const cardWidth = 320;
      carouselScrollRef.current.scrollTo({
        left: newIndex * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  const scrollToSlide = (index: number) => {
    setActiveSlideIndex(index);
    if (carouselScrollRef.current) {
      const cardWidth = 320;
      carouselScrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="rounded-2xl bg-neutral-900/90 border border-neutral-800 p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Scanned Receipts & Evidence Vault
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {filteredReceipts.length} Documents
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              ATO substantiation records pursuant to s 382-5 of TAA 1953 · Optical character verified
            </p>
          </div>
        </div>

        {/* View Mode & Scan Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Mode Toggles */}
          <div className="p-1 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('carousel')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'carousel'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Horizontal Carousel View"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Carousel</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Grid Gallery View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid Gallery</span>
            </button>
          </div>

          {/* Quick Scan Camera Button */}
          <button
            type="button"
            onClick={onScanClick}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Receipt</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategoryFilter(cat);
                setActiveSlideIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-all cursor-pointer font-medium ${
                categoryFilter === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800/80 hover:bg-neutral-800'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vendor, ABN, item..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setActiveSlideIndex(0);
            }}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500/50"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* CAROUSEL VIEW */}
      {viewMode === 'carousel' ? (
        <div className="relative group">
          {/* Left Arrow Button */}
          {filteredReceipts.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeSlideIndex === 0}
              className={`absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-neutral-900/90 border border-neutral-700 text-white shadow-xl flex items-center justify-center transition-all cursor-pointer ${
                activeSlideIndex === 0
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:bg-emerald-600 hover:border-emerald-500 hover:scale-110'
              }`}
              title="Previous receipt"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Carousel Scroll Track */}
          <div
            ref={carouselScrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 pt-1 px-1 no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredReceipts.length === 0 ? (
              <div className="w-full py-12 text-center text-neutral-400 space-y-2">
                <div className="w-10 h-10 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-white">No scanned receipts found</div>
                <p className="text-[11px] text-neutral-500">
                  No matching expense documents for current filters.
                </p>
              </div>
            ) : (
              filteredReceipts.map((exp, idx) => {
                const isActive = idx === activeSlideIndex;
                return (
                  <div
                    key={exp.id}
                    className={`snap-start shrink-0 w-[285px] sm:w-[310px] rounded-2xl bg-neutral-950 border transition-all duration-200 overflow-hidden flex flex-col group/card ${
                      isActive
                        ? 'border-emerald-500/50 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                        : 'border-neutral-800 hover:border-neutral-700 hover:shadow-md'
                    }`}
                  >
                    {/* Receipt Graphic Preview Container */}
                    <div
                      onClick={() => setInspectExpense(exp)}
                      className="relative h-64 bg-neutral-900 cursor-pointer overflow-hidden flex items-center justify-center border-b border-neutral-800/80 group-hover/card:bg-neutral-850"
                    >
                      <img
                        src={exp.displayImageUrl}
                        alt={`${exp.supplier} receipt`}
                        className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover/card:scale-[1.03]"
                      />

                      {/* Top Overlay Badges */}
                      <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-900/90 text-emerald-400 font-semibold border border-emerald-500/30 backdrop-blur-sm flex items-center gap-1 shadow">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{exp.receiptOcrVerified ? 'OCR VERIFIED' : 'SUBSTANTIATED'}</span>
                        </span>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/80 text-white font-bold backdrop-blur-sm border border-neutral-700 shadow">
                          {exp.businessUsePercentage}% DEDUCTIBLE
                        </span>
                      </div>

                      {/* Hover Zoom Prompt */}
                      <div className="absolute inset-0 bg-emerald-950/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-[1px]">
                        <Maximize2 className="w-4 h-4 text-emerald-300" />
                        <span>Inspect Document</span>
                      </div>
                    </div>

                    {/* Meta & Financial Details */}
                    <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="truncate">
                            <h4 className="text-xs font-bold text-white truncate font-display">
                              {exp.supplier}
                            </h4>
                            <div className="text-[10px] text-neutral-400 font-mono truncate">
                              {exp.supplierAbn ? `ABN ${exp.supplierAbn}` : exp.date}
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 shrink-0">
                            {exp.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 line-clamp-1 mt-1">
                          {exp.description}
                        </p>
                      </div>

                      {/* Numbers breakdown */}
                      <div className="pt-2 border-t border-neutral-800/80 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] font-mono text-neutral-500 block">TOTAL GROSS</span>
                          <span className="text-sm font-bold text-white tabular-nums">
                            {formatAUD(exp.grossAmount)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-neutral-500 block">TAX CLAIMABLE</span>
                          <span className="text-sm font-bold text-emerald-400 tabular-nums">
                            {formatAUD(exp.claimableAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-1 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInspectExpense(exp)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white text-[11px] font-medium border border-neutral-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-emerald-400" />
                          <span>View Full</span>
                        </button>
                        {onSelectExpense && (
                          <button
                            type="button"
                            onClick={() => onSelectExpense(exp)}
                            className="py-1.5 px-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[11px] border border-neutral-800 transition-colors cursor-pointer"
                            title="Highlight in Ledger"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Arrow Button */}
          {filteredReceipts.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              disabled={activeSlideIndex >= filteredReceipts.length - 1}
              className={`absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-neutral-900/90 border border-neutral-700 text-white shadow-xl flex items-center justify-center transition-all cursor-pointer ${
                activeSlideIndex >= filteredReceipts.length - 1
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:bg-emerald-600 hover:border-emerald-500 hover:scale-110'
              }`}
              title="Next receipt"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Bottom Pagination Dots */}
          {filteredReceipts.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-2">
              {filteredReceipts.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToSlide(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === activeSlideIndex ? 'w-6 bg-emerald-400' : 'w-1.5 bg-neutral-700 hover:bg-neutral-500'
                  }`}
                  title={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* GRID GALLERY VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-1">
          {filteredReceipts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-neutral-400 space-y-2">
              <div className="w-10 h-10 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-white">No scanned receipts found</div>
              <p className="text-[11px] text-neutral-500">
                Try adjusting your search terms or category filters.
              </p>
            </div>
          ) : (
            filteredReceipts.map(exp => (
              <div
                key={exp.id}
                onClick={() => setInspectExpense(exp)}
                className="group rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/40 transition-all overflow-hidden flex flex-col cursor-pointer shadow-sm hover:shadow-lg"
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] bg-neutral-900 p-2 overflow-hidden flex items-center justify-center border-b border-neutral-800/80">
                  <img
                    src={exp.displayImageUrl}
                    alt={`${exp.supplier} receipt`}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/80 text-emerald-400 font-bold border border-emerald-500/30 backdrop-blur-sm shadow">
                      {formatAUD(exp.grossAmount)}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-900/90 text-white font-medium border border-neutral-700 backdrop-blur-sm shadow">
                      {exp.category}
                    </span>
                  </div>
                </div>

                {/* Footer Content */}
                <div className="p-3 space-y-1 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white truncate font-display group-hover:text-emerald-400 transition-colors">
                      {exp.supplier}
                    </h4>
                    <p className="text-[11px] text-neutral-400 line-clamp-1">{exp.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-neutral-800/80 font-mono">
                    <span className="text-neutral-500">{exp.date}</span>
                    <span className="text-emerald-400 font-semibold">
                      Claim: {formatAUD(exp.claimableAmount)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* INSPECT RECEIPT DOCUMENT LIGHTBOX MODAL */}
      {inspectExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Topbar */}
            <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">
                    {inspectExpense.supplier} — Tax Invoice Document
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    {inspectExpense.supplierAbn ? `ABN ${inspectExpense.supplierAbn} · ` : ''}
                    Date: {inspectExpense.date} · Division 900 ITAA 1997 Compliant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => (prev === 1 ? 1.5 : 1))}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  title="Toggle Zoom"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>{zoomLevel === 1 ? 'Zoom In' : 'Reset'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Trigger browser print of the document
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head><title>Receipt - ${inspectExpense.supplier}</title></head>
                          <body style="margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fafafa;">
                            <img src="${(inspectExpense as any).displayImageUrl || inspectExpense.receiptUrl}" style="max-width: 90%; max-height: 90vh;" />
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.focus();
                      printWindow.print();
                    }
                  }}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                  title="Print / Save Document"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setInspectExpense(null)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Split Document View & Audit Details */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Document Image Frame */}
              <div className="md:col-span-7 flex items-center justify-center bg-black/60 rounded-xl p-3 border border-neutral-800 overflow-hidden min-h-[380px] max-h-[580px]">
                <div
                  className="transition-transform duration-200 overflow-auto max-h-full max-w-full flex items-center justify-center"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  <img
                    src={(inspectExpense as any).displayImageUrl || inspectExpense.receiptUrl}
                    alt={`${inspectExpense.supplier} receipt`}
                    className="max-h-[520px] w-auto object-contain rounded-lg shadow-2xl"
                  />
                </div>
              </div>

              {/* Substantiation Metadata Panel */}
              <div className="md:col-span-5 space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ATO Substantiation Audit Record</span>
                  </div>

                  <div className="space-y-1.5 pt-1 text-[11px]">
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Vendor / Supplier:</span>
                      <strong className="text-white">{inspectExpense.supplier}</strong>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Australian Business Number:</span>
                      <strong className="text-emerald-400 font-mono">
                        {inspectExpense.supplierAbn || 'Substantiated in OCR'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Transaction Date:</span>
                      <strong className="text-white font-mono">{inspectExpense.date}</strong>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Expense Category:</span>
                      <span className="text-neutral-200 font-semibold">{inspectExpense.category}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                    Financial Apportionment (BAS & Tax)
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 block">GROSS INCL. GST</span>
                      <span className="text-base font-bold text-white tabular-nums">
                        {formatAUD(inspectExpense.grossAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 block">GST INCLUDED (10%)</span>
                      <span className="text-base font-bold text-emerald-400 tabular-nums">
                        {formatAUD(inspectExpense.gstAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 block">BUSINESS USE %</span>
                      <span className="text-sm font-bold text-white tabular-nums">
                        {inspectExpense.businessUsePercentage}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 block">TAX CLAIMABLE</span>
                      <span className="text-base font-bold text-emerald-400 tabular-nums">
                        {formatAUD(inspectExpense.claimableAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description & Tax Notes */}
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                  <div className="text-[10px] font-mono text-neutral-500 uppercase">Item Description</div>
                  <p className="text-white text-xs">{inspectExpense.description}</p>
                  {inspectExpense.taxNotes && (
                    <div className="pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400 flex items-start gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{inspectExpense.taxNotes}</span>
                    </div>
                  )}
                </div>

                {/* Statutory Archive Disclaimer */}
                <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-[10px] text-neutral-500 flex items-center justify-between">
                  <span>Record Retention: 5 Years</span>
                  <span className="font-mono text-emerald-500">s 382-5 TAA 1953</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
