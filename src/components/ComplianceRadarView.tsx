import React, { useState } from 'react';
import {
  BusinessIdentity,
  TaxProfile,
  OperatingProfile,
  BASPeriod,
  ObligationItem,
  ObligationAuthority,
  ObligationStatus
} from '../types';
import {
  formatAUD,
  evaluateGSTTurnover,
  estimateAustralianTax,
  evaluateWorkerClassification,
  VERSIONED_RULES
} from '../utils/taxAndRegulatoryEngine';
import {
  ShieldCheck,
  AlertCircle,
  Clock,
  HelpCircle,
  FileCheck,
  Calendar,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  Users,
  Building2,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface ComplianceRadarViewProps {
  business: BusinessIdentity;
  taxProfile: TaxProfile;
  operatingProfile: OperatingProfile;
  basPeriod: BASPeriod;
  obligations: ObligationItem[];
  annualRevenue: number;
  annualTaxableIncome: number;
  onLockBASPeriod: (periodId: string) => void;
  onUpdateObligation: (obligation: ObligationItem) => void;
}

export const ComplianceRadarView: React.FC<ComplianceRadarViewProps> = ({
  business,
  taxProfile,
  operatingProfile,
  basPeriod,
  obligations,
  annualRevenue,
  annualTaxableIncome,
  onLockBASPeriod,
  onUpdateObligation
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'radar' | 'gst_monitor' | 'bas_workspace' | 'tax_reserve' | 'worker_test' | 'asic_gov'>('radar');
  const [selectedObligation, setSelectedObligation] = useState<ObligationItem | null>(null);

  // GST Turnover test values (can be adjusted by user to simulate future growth!)
  const [current12mTurnover, setCurrent12mTurnover] = useState<number>(annualRevenue || 68400);
  const [projected12mTurnover, setProjected12mTurnover] = useState<number>(84200);

  const gstEvaluation = evaluateGSTTurnover(current12mTurnover, projected12mTurnover, taxProfile.gstRegistered);

  // Tax Estimate
  const taxEstimate = estimateAustralianTax(annualTaxableIncome || 54000, business.entityType);

  // Worker Classification Interactive Test State
  const [workerHoursControl, setWorkerHoursControl] = useState(true);
  const [workerEquipment, setWorkerEquipment] = useState(true);
  const [workerCommercialRisk, setWorkerCommercialRisk] = useState(true);
  const [workerDeliverablePay, setWorkerDeliverablePay] = useState(true);
  const [workerSubcontract, setWorkerSubcontract] = useState(true);

  const workerResult = evaluateWorkerClassification({
    hasControlOverHoursAndWork: workerHoursControl,
    providesOwnEquipment: workerEquipment,
    bearsCommercialRisk: workerCommercialRisk,
    paidByDeliverableOrQuote: workerDeliverablePay,
    canSubcontractOrDelegate: workerSubcontract
  });

  // Solvency Resolution Minute Modal
  const [showSolvencyModal, setShowSolvencyModal] = useState(false);
  const [solvencyMinuteApproved, setSolvencyMinuteApproved] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Australian Business Lifecycle Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-display">Compliance Radar & Governance</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Progressive obligation map across ABR, ASIC, ATO and Fair Work. All rules versioned to 2026/2027 standards.
          </p>
        </div>

        {/* Sub-nav tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl text-xs">
          <button
            onClick={() => setActiveSubTab('radar')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors ${
              activeSubTab === 'radar' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Compliance Radar
          </button>
          <button
            onClick={() => setActiveSubTab('gst_monitor')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors ${
              activeSubTab === 'gst_monitor' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            $75k GST Monitor
          </button>
          <button
            onClick={() => setActiveSubTab('bas_workspace')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors ${
              activeSubTab === 'bas_workspace' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            BAS Workspace
          </button>
          <button
            onClick={() => setActiveSubTab('tax_reserve')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors ${
              activeSubTab === 'tax_reserve' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Tax Reserve
          </button>
          <button
            onClick={() => setActiveSubTab('worker_test')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors ${
              activeSubTab === 'worker_test' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Worker Test (12% SG)
          </button>
          <button
            onClick={() => setActiveSubTab('asic_gov')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors ${
              activeSubTab === 'asic_gov' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            ASIC & Director
          </button>
        </div>
      </div>

      {/* SUBTAB 1: COMPLIANCE RADAR CARDS */}
      {activeSubTab === 'radar' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 leading-relaxed">
            <strong>Progressive Compliance Principle:</strong> You only see obligations relevant to your current entity structure ({business.entityType}), registrations, and commercial scale. Click any card to inspect the authoritative rule and why it triggered.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {obligations.map(ob => {
              let badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
              if (ob.status === 'ACTION_REQUIRED') badgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
              if (ob.status === 'REVIEW_REQUIRED') badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
              if (ob.status === 'APPROACHING') badgeColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
              if (ob.status === 'NOT_APPLICABLE') badgeColor = 'text-neutral-500 bg-neutral-800 border-neutral-700';

              return (
                <div
                  key={ob.id}
                  onClick={() => setSelectedObligation(ob)}
                  className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between hover:border-neutral-700 transition-colors cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono text-neutral-400 font-semibold">{ob.authority}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border ${badgeColor}`}>
                        {ob.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base font-display">{ob.title}</h3>
                    <p className="text-xs text-neutral-300 mt-1 line-clamp-2">{ob.summary}</p>

                    {ob.dueDate && (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-3 pt-3 border-t border-neutral-800/80">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Due: {ob.dueDate} ({ob.daysRemaining} days remaining)</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-neutral-500 font-mono truncate max-w-[180px]">
                      {ob.authorityReference}
                    </span>
                    <span className="text-emerald-400 font-medium hover:underline flex items-center gap-1">
                      Explain <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 28-Day ABR Change Monitor Banner */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="font-semibold text-white text-sm">28-Day Australian Business Register (ABR) Monitor</h3>
              </div>
              <span className="text-xs text-neutral-400 font-mono">Last verified: 10 days ago</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Under Australian law, ABN holders have a statutory responsibility to notify the ABR of changes to business details within 28 days of becoming aware of the change (including trading names, business address, and main activities).
            </p>
            <div className="flex items-center gap-2 text-xs">
              <a
                href="https://www.abr.gov.au/business-super-funds-charities/updating-or-cancelling-your-abn/update-your-abn-details"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors flex items-center gap-1.5"
              >
                Open Official ABR Portal <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-neutral-500">Requires Digital ID (myGovID) + RAM</span>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: GST $75,000 THRESHOLD MONITOR */}
      {activeSubTab === 'gst_monitor' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-white text-lg font-display">ATO GST $75,000 Turnover Threshold Engine</h3>
                <p className="text-xs text-neutral-400">
                  Calculated using official ATO Current Turnover (Current month + previous 11 months) and Projected Turnover (Current month + next 11 months).
                </p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold ${
                  gstEvaluation.status === 'ACTION_REQUIRED'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : gstEvaluation.status === 'MONITOR'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  STATUS: {gstEvaluation.status}
                </span>
              </div>
            </div>

            {/* Threshold Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Current 12-Month Turnover: <strong className="text-white font-mono">{formatAUD(current12mTurnover)}</strong></span>
                <span>Statutory Threshold: <strong className="text-white font-mono">$75,000.00</strong></span>
              </div>
              <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    current12mTurnover >= 75000 ? 'bg-rose-500' : current12mTurnover >= 60000 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (current12mTurnover / 75000) * 100)}%` }}
                ></div>
              </div>
              <div className="text-[11px] text-neutral-500 font-mono">
                {Math.round((current12mTurnover / 75000) * 100)}% of threshold reached.
              </div>
            </div>

            {/* Interactive Simulator Sliders */}
            <div className="pt-4 border-t border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Simulate Current 12m Turnover: {formatAUD(current12mTurnover)}
                </label>
                <input
                  type="range"
                  min="10000"
                  max="150000"
                  step="2500"
                  value={current12mTurnover}
                  onChange={e => setCurrent12mTurnover(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <p className="text-[11px] text-neutral-400">Past completed brand deals and orders.</p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Simulate Projected 12m Turnover: {formatAUD(projected12mTurnover)}
                </label>
                <input
                  type="range"
                  min="10000"
                  max="200000"
                  step="5000"
                  value={projected12mTurnover}
                  onChange={e => setProjected12mTurnover(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <p className="text-[11px] text-neutral-400">Expected bookings and subscriber earnings.</p>
              </div>
            </div>

            {/* Rule Message */}
            <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300 space-y-2">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-emerald-400" />
                ATO Regulatory Assessment
              </div>
              <p className="leading-relaxed">{gstEvaluation.message}</p>
              <div className="text-[11px] text-neutral-500 font-mono">
                Source: ATO QC 22412 · GST Act 1999 Division 23
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: BAS WORKSPACE */}
      {activeSubTab === 'bas_workspace' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
              <div>
                <span className="font-mono text-xs text-emerald-400">{basPeriod.periodId.toUpperCase()}</span>
                <h3 className="font-bold text-white text-lg font-display">{basPeriod.label}</h3>
                <div className="text-xs text-neutral-400 font-mono mt-0.5">
                  Due: {basPeriod.dueDate} (28 October) · Status: {basPeriod.status}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {basPeriod.status !== 'LOCKED' ? (
                  <button
                    onClick={() => onLockBASPeriod(basPeriod.periodId)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                  >
                    <Lock className="w-3.5 h-3.5" /> Sign-off & Lock Period
                  </button>
                ) : (
                  <span className="px-3 py-1 rounded bg-neutral-800 text-emerald-400 text-xs font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Period Locked
                  </span>
                )}
              </div>
            </div>

            {/* Official ATO Activity Statement G & 1 Field Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sales & GST Collected */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h4 className="font-semibold text-white text-sm">GST On Sales (Outputs)</h4>

                <div className="flex justify-between items-center text-xs py-1.5 border-b border-neutral-900">
                  <span className="text-neutral-400">G1: Total Sales (including GST)</span>
                  <span className="font-mono font-medium text-white tabular-nums">{formatAUD(basPeriod.g1TotalSales)}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1.5 border-b border-neutral-900">
                  <span className="text-neutral-400">G2: Export Sales (GST-Free overseas fans)</span>
                  <span className="font-mono text-neutral-300 tabular-nums">{formatAUD(basPeriod.g2ExportSales)}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1.5 border-b border-neutral-900">
                  <span className="text-neutral-400">G3: Other GST-free supplies</span>
                  <span className="font-mono text-neutral-300 tabular-nums">{formatAUD(basPeriod.g3OtherGSTFree)}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-2 font-bold text-emerald-400">
                  <span>1A: GST on sales (G1 minus exports / 11)</span>
                  <span className="font-mono tabular-nums text-sm">{formatAUD(basPeriod.gst1aSalesGst)}</span>
                </div>
              </div>

              {/* Purchases & GST Credits */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h4 className="font-semibold text-white text-sm">GST On Purchases (Input Tax Credits)</h4>

                <div className="flex justify-between items-center text-xs py-1.5 border-b border-neutral-900">
                  <span className="text-neutral-400">G10: Capital purchases (Cameras, gear)</span>
                  <span className="font-mono font-medium text-white tabular-nums">{formatAUD(basPeriod.g10CapitalPurchases)}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1.5 border-b border-neutral-900">
                  <span className="text-neutral-400">G11: Non-capital purchases (Studio, travel)</span>
                  <span className="font-mono font-medium text-white tabular-nums">{formatAUD(basPeriod.g11NonCapitalPurchases)}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-2 font-bold text-emerald-400">
                  <span>1B: GST on purchases (Credits claimable)</span>
                  <span className="font-mono tabular-nums text-sm">{formatAUD(basPeriod.gst1bPurchaseGstCredits)}</span>
                </div>
              </div>
            </div>

            {/* Net GST Payable Calculation Box */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-neutral-950 to-neutral-900 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-emerald-400">BOX 9: NET GST POSITION FOR QUARTER</div>
                <div className="text-2xl font-bold text-white tabular-nums mt-0.5">
                  {formatAUD(basPeriod.netGstPayable)}
                </div>
                <div className="text-xs text-neutral-400 mt-1">
                  1A ({formatAUD(basPeriod.gst1aSalesGst)}) minus 1B ({formatAUD(basPeriod.gst1bPurchaseGstCredits)})
                </div>
              </div>

              <div className="text-xs text-neutral-300 max-w-xs sm:text-right">
                <span className="font-semibold text-white block">Remit to ATO:</span>
                Due by 28 October 2026 via ATO Online Services for Business or tax agent portal.
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-neutral-500 italic">
              creatorledger generates working papers for preparation. A generated calculation is not legal proof of an ATO lodgement until formally submitted via an authorised channel or your registered tax agent.
            </p>
          </div>
        </div>
      )}

      {/* SUBTAB 4: TAX ESTIMATE & ESCROW RESERVE */}
      {activeSubTab === 'tax_reserve' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6">
            <div>
              <h3 className="font-bold text-white text-lg font-display">Australian Income Tax Estimate (2026-2027)</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Calculate an indicative tax reserve based on current financial data to avoid end-of-year tax shock.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 text-xs">Estimated Taxable Net Income</span>
                <div className="text-2xl font-bold text-white tabular-nums mt-1">{formatAUD(taxEstimate.taxableIncome)}</div>
                <span className="text-[11px] text-neutral-500">Gross revenue minus valid deductions</span>
              </div>
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 text-xs">Estimated Tax + Medicare Levy</span>
                <div className="text-2xl font-bold text-amber-300 tabular-nums mt-1">{formatAUD(taxEstimate.totalEstimatedTax)}</div>
                <span className="text-[11px] text-neutral-500">Effective rate: {taxEstimate.effectiveRate}%</span>
              </div>
              <div className="p-4 rounded-xl bg-neutral-950 border border-emerald-500/30">
                <span className="text-emerald-400 text-xs font-semibold">Recommended Bank Escrow</span>
                <div className="text-2xl font-bold text-emerald-400 tabular-nums mt-1">{formatAUD(taxEstimate.suggestedReserve)}</div>
                <span className="text-[11px] text-neutral-400">Keep in CBA Tax Reserve Account</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-2">
              <span className="font-semibold text-white block">Explanation & Rules Applied:</span>
              <p className="leading-relaxed">{taxEstimate.explanation}</p>
              <div className="text-[11px] text-neutral-500 font-mono">
                Authority: Australian Taxation Office Individual Resident Brackets 2026-2027
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: WORKER CLASSIFICATION TEST (12% SG) */}
      {activeSubTab === 'worker_test' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6">
            <div>
              <span className="text-emerald-400 font-mono text-xs">ATO Fair Work Multi-Factor Matrix</span>
              <h3 className="font-bold text-white text-lg font-display">Worker Classification & 12% Super Guarantee</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                When you engage a videographer, assistant, or makeup artist, answer these 5 factors to determine your Super Guarantee and PAYG obligations.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  state: workerHoursControl,
                  setter: setWorkerHoursControl,
                  label: 'Control: Does the worker set their own hours and decide how the work is performed?',
                  subtext: 'Contractors control how the work is done; employees are directed on when and how to work.'
                },
                {
                  state: workerEquipment,
                  setter: setWorkerEquipment,
                  label: 'Equipment: Does the worker provide their own tools, cameras, and editing suites?',
                  subtext: 'Contractors invest in their own commercial equipment.'
                },
                {
                  state: workerCommercialRisk,
                  setter: setWorkerCommercialRisk,
                  label: 'Commercial Risk: Does the worker bear commercial risk and rectify defects at their own expense?',
                  subtext: 'Contractors have liability and fix errors in their own time.'
                },
                {
                  state: workerDeliverablePay,
                  setter: setWorkerDeliverablePay,
                  label: 'Payment Method: Is the worker paid based on quote or deliverable rather than an hourly wage?',
                  subtext: 'Paying per project/video indicates independent contracting.'
                },
                {
                  state: workerSubcontract,
                  setter: setWorkerSubcontract,
                  label: 'Delegation: Does the worker have the right to subcontract or delegate the task to someone else?',
                  subtext: 'Employees cannot delegate their employment; contractors can subcontract.'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => item.setter(!item.state)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-colors flex items-center justify-between ${
                    item.state ? 'bg-neutral-950 border-emerald-500/40' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="pr-4">
                    <div className="font-semibold text-white text-xs">{item.label}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">{item.subtext}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={item.state}
                    readOnly
                    className="rounded text-emerald-600 bg-neutral-800 border-neutral-700"
                  />
                </div>
              ))}
            </div>

            {/* Assessment Result Box */}
            <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Evaluated Classification:</span>
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                  workerResult.classification === 'LIKELY_INDEPENDENT_CONTRACTOR'
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                    : workerResult.classification === 'BORDERLINE_NEEDS_REVIEW'
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                    : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                }`}>
                  {workerResult.classification.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="pt-2 border-t border-neutral-800/80 space-y-2 text-neutral-300">
                <div>
                  <strong className="text-white">12% Super Guarantee (SG): </strong>
                  {workerResult.superObligation}
                </div>
                <div>
                  <strong className="text-white">PAYG Withholding: </strong>
                  {workerResult.paygObligation}
                </div>
                <div>
                  <strong className="text-white">Action Recommendation: </strong>
                  {workerResult.recommendation}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 6: ASIC & DIRECTOR GOVERNANCE */}
      {activeSubTab === 'asic_gov' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6">
            <div>
              <span className="text-emerald-400 font-mono text-xs">Corporations Act 2001 (Cth)</span>
              <h3 className="font-bold text-white text-lg font-display">ASIC Company Governance & Director Obligations</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                For proprietary companies (e.g. {business.legalName}): Keep company details updated, satisfy Director ID requirements, and record annual solvency resolutions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <span className="text-neutral-400 text-xs">Director ID Verification</span>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Completed & Linked
                </div>
                <p className="text-[11px] text-neutral-500">
                  Director Identification Numbers are required prior to appointment under ABRS / ASIC rules.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <span className="text-neutral-400 text-xs">ASIC Annual Review Date</span>
                <div className="font-bold text-white text-sm">15 November 2026</div>
                <p className="text-[11px] text-neutral-500">
                  Review statement sent within 30 days of anniversary. $321 ASIC fee due within 60 days.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <span className="text-neutral-400 text-xs">Solvency Resolution (s 347A)</span>
                <div className={`font-bold text-sm ${solvencyMinuteApproved ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {solvencyMinuteApproved ? 'Passed & Documented' : 'Due within 2 months'}
                </div>
                <button
                  onClick={() => setShowSolvencyModal(true)}
                  className="text-xs text-emerald-400 hover:underline block pt-1"
                >
                  Generate Solvency Minute →
                </button>
              </div>
            </div>

            {/* Large Proprietary Company Scale Monitor */}
            <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <h4 className="font-bold text-white text-sm">Large Proprietary Company Scale Test (s 45A)</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                ASIC requires formal audited financial reporting if at least 2 of these criteria are met:
                1. Consolidated revenue &ge; $50M · 2. Gross assets &ge; $25M · 3. 100+ employees.
              </p>
              <div className="text-xs text-emerald-400 font-mono pt-1">
                Classification: Small Proprietary Company (Exempt from mandatory ASIC audited lodgement).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXPLAINABILITY MODAL */}
      {selectedObligation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-sm text-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <span className="font-mono text-xs text-emerald-400">{selectedObligation.authority} Regulatory Alert</span>
                <h3 className="font-bold text-white text-base">{selectedObligation.title}</h3>
              </div>
              <button onClick={() => setSelectedObligation(null)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 font-semibold block mb-0.5">Why am I seeing this?</span>
                <p className="text-neutral-200">{selectedObligation.whyExplanation}</p>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 font-semibold block mb-0.5">What triggered it from your data?</span>
                <p className="text-neutral-200 font-mono text-[11px]">{selectedObligation.dataTrigger}</p>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 font-semibold block mb-0.5">Official Authority Reference:</span>
                <p className="text-emerald-400 font-mono">{selectedObligation.authorityReference}</p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-300">
                <span className="font-semibold block mb-0.5">What to do next:</span>
                <p>{selectedObligation.actionRequired}</p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => setSelectedObligation(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOLVENCY MINUTE MODAL */}
      {showSolvencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-sm text-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-bold text-white text-base">Annual Solvency Resolution Minute</h3>
              <button onClick={() => setShowSolvencyModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono space-y-3 leading-relaxed">
              <div className="font-bold text-white text-center border-b border-neutral-800 pb-2">
                {business.legalName} (ACN {business.acn || '648 192 381'})<br />
                DIRECTORS RESOLUTION OF SOLVENCY (CORPORATIONS ACT s 347A)
              </div>
              <p>
                The directors, having examined the financial records and operating position of the company, resolved that in their opinion there are reasonable grounds to believe that the company will be able to pay its debts as and when they become due and payable.
              </p>
              <div className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-800 flex justify-between">
                <span>Date: {new Date().toLocaleDateString('en-AU')}</span>
                <span>Director: Kira Zhang</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSolvencyModal(false)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSolvencyMinuteApproved(true);
                  setShowSolvencyModal(false);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
              >
                Pass & Record in Document Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
