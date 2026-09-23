import React, { useState } from 'react';
import { BusinessIdentity, CreatorProfile, TaxProfile, OperatingProfile, EntityType } from '../types';
import { validateAustralianABN } from '../utils/taxAndRegulatoryEngine';
import { CheckCircle2, ShieldCheck, AlertCircle, Building2, User, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: BusinessIdentity;
  taxProfile: TaxProfile;
  operatingProfile: OperatingProfile;
  creatorProfile: CreatorProfile;
  onSave: (
    business: BusinessIdentity,
    taxProfile: TaxProfile,
    operatingProfile: OperatingProfile,
    creatorProfile: CreatorProfile
  ) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  business,
  taxProfile,
  operatingProfile,
  creatorProfile,
  onSave
}) => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<BusinessIdentity>({ ...business });
  const [taxData, setTaxData] = useState<TaxProfile>({ ...taxProfile });
  const [opData, setOpData] = useState<OperatingProfile>({ ...operatingProfile });
  const [crData, setCrData] = useState<CreatorProfile>({ ...creatorProfile });

  const [abnInput, setAbnInput] = useState<string>(business.abn);
  const [abnValidation, setAbnValidation] = useState(validateAustralianABN(business.abn));

  if (!isOpen) return null;

  const handleAbnChange = (val: string) => {
    setAbnInput(val);
    const result = validateAustralianABN(val);
    setAbnValidation(result);
    if (result.isValid) {
      setFormData(prev => ({
        ...prev,
        abn: result.formatted,
        abnLastVerifiedAt: new Date().toISOString()
      }));
    }
  };

  const handleApplyPreset = (type: 'company' | 'sole_trader') => {
    if (type === 'sole_trader') {
      const validSoleAbn = '51 824 753 556';
      setAbnInput(validSoleAbn);
      setAbnValidation(validateAustralianABN(validSoleAbn));
      setFormData({
        abn: validSoleAbn,
        legalName: 'Maya Elena Lin',
        tradingName: 'Maya Lin Content',
        businessName: 'Maya Lin Studio',
        entityType: 'sole_trader',
        mainBusinessActivity: 'Social Media & UGC Content Creation',
        anzsicCode: '90020 - Creative Arts Activities',
        businessAddress: '12 Fitzroy St, St Kilda VIC 3182',
        postalAddress: 'PO Box 102, St Kilda VIC 3182',
        contactEmail: 'maya@mayalin.com.au',
        contactPhone: '+61 488 234 567',
        startDate: '2024-01-10',
        status: 'active',
        abnLastVerifiedAt: new Date().toISOString(),
        abrLastCheckedAt: new Date().toISOString()
      });
      setTaxData({
        gstRegistered: false,
        accountingBasis: 'cash',
        basFrequency: 'quarterly',
        paygWithholdingRegistered: false,
        hasTaxAgent: true,
        taxAgentName: 'Melbourne Creative Accounting',
        financialYear: '2026-2027'
      });
      setCrData({
        creatorHandle: '@mayalin.ugc',
        primaryPlatforms: ['TikTok', 'Instagram'],
        publicEmail: 'collabs@mayalin.com',
        discreetMode: false
      });
    } else {
      const validCompanyAbn = '51 824 753 556';
      setAbnInput(validCompanyAbn);
      setAbnValidation(validateAustralianABN(validCompanyAbn));
      setFormData({
        abn: validCompanyAbn,
        acn: '648 192 381',
        legalName: 'KIRA MEDIA PTY LTD',
        tradingName: 'Kira Zhang Creative',
        businessName: 'Kira Zhang Studios',
        entityType: 'company',
        mainBusinessActivity: 'Creative Arts & Media Production',
        anzsicCode: '90020 - Creative and Performing Arts Activities',
        businessAddress: 'Suite 4, 182 Campbell St, Surry Hills NSW 2010',
        postalAddress: 'PO Box 412, Strawberry Hills NSW 2012',
        contactEmail: 'legal@kirazhang.com.au',
        contactPhone: '+61 412 345 678',
        startDate: '2023-08-15',
        status: 'active',
        abnLastVerifiedAt: new Date().toISOString(),
        abrLastCheckedAt: new Date().toISOString()
      });
      setTaxData({
        gstRegistered: true,
        gstRegistrationDate: '2024-03-01',
        accountingBasis: 'cash',
        basFrequency: 'quarterly',
        paygWithholdingRegistered: true,
        hasTaxAgent: true,
        taxAgentName: 'Apex Creator Advisory Group',
        financialYear: '2026-2027'
      });
      setCrData({
        creatorHandle: '@kirazhang',
        primaryPlatforms: ['Instagram', 'TikTok', 'YouTube', 'Patreon', 'OnlyFans'],
        publicEmail: 'collabs@kirazhang.com',
        agentOrManagerName: 'Talent Republic AU',
        discreetMode: false
      });
    }
  };

  const handleFinish = () => {
    onSave(formData, taxData, opData, crData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-400 font-mono">Australian Business Onboarding</div>
            <h2 className="text-lg font-semibold text-white">
              {step === 1 && 'Welcome to fleshsesh'}
              {step === 2 && 'Step 1: ABN Identity Gate'}
              {step === 3 && 'Step 2: Australian Tax Profile'}
              {step === 4 && 'Step 3: Operating Profile'}
              {step === 5 && 'Step 4: Connect Financial Accounts'}
              {step === 6 && 'Step 5: Business Compliance Baseline'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-mono">Step {step} of 6</span>
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 text-sm"
              title="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Quick Preset Selector for Easy Testing */}
        <div className="px-6 py-2 bg-neutral-950/40 border-b border-neutral-800/60 flex items-center justify-between text-xs">
          <span className="text-neutral-400">Load sample business template:</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleApplyPreset('company')}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Building2 className="w-3 h-3 text-emerald-400" />
              Company: Kira Media Pty Ltd
            </button>
            <button
              onClick={() => handleApplyPreset('sole_trader')}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <User className="w-3 h-3 text-amber-400" />
              Sole Trader: Maya Lin
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-neutral-200">
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/60">
                <h3 className="text-base font-semibold text-white mb-2">Run your business with confidence.</h3>
                <p className="text-neutral-300 leading-relaxed">
                  fleshsesh gives Australian sole traders one clear place to track income, set aside the right amount for tax, manage expenses, and stay on top of compliance.
                </p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                    <span className="text-emerald-400 font-semibold block mb-1">ABR Gated</span>
                    Official ABN verification & 28-day detail change monitor.
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                    <span className="text-emerald-400 font-semibold block mb-1">Double-Entry</span>
                    Balanced ledger, platform payout unbundling & GST.
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                    <span className="text-emerald-400 font-semibold block mb-1">ATO / ASIC Radar</span>
                    Continuous monitoring of $75k GST threshold & company reviews.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-200/90 text-xs leading-relaxed">
                <strong>ABN Policy:</strong> An Australian Business Number (ABN) is required to establish a commercial ledger. In Australia, carrying on an enterprise entitles an individual or company to hold an ABN.
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  Australian Business Number (ABN)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={abnInput}
                    onChange={(e) => handleAbnChange(e.target.value)}
                    placeholder="e.g. 51 824 753 556"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                  <div className="absolute right-3 top-2.5 flex items-center gap-1.5 text-xs">
                    {abnValidation.isValid ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Mod-89 Valid
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> Invalid ABN
                      </span>
                    )}
                  </div>
                </div>
                {abnValidation.error && (
                  <p className="text-xs text-rose-400 mt-1">{abnValidation.error}</p>
                )}
                <p className="text-xs text-neutral-400 mt-1">
                  Try test ABN: <code className="text-neutral-300 font-mono">51 824 753 556</code>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Legal Entity Name (as on ABR)
                  </label>
                  <input
                    type="text"
                    value={formData.legalName}
                    onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Entity Structure
                  </label>
                  <select
                    value={formData.entityType}
                    onChange={(e) => setFormData({ ...formData, entityType: e.target.value as EntityType })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="sole_trader">Sole Trader (Individual)</option>
                    <option value="company">Proprietary Company (Pty Ltd)</option>
                    <option value="partnership">Partnership</option>
                    <option value="trust">Discretionary / Family Trust</option>
                  </select>
                </div>
              </div>

              {formData.entityType === 'company' && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Australian Company Number (ACN)
                  </label>
                  <input
                    type="text"
                    value={formData.acn || ''}
                    onChange={(e) => setFormData({ ...formData, acn: e.target.value })}
                    placeholder="9-digit ACN, e.g. 648 192 381"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Trading / Creator Brand Name
                  </label>
                  <input
                    type="text"
                    value={formData.tradingName}
                    onChange={(e) => setFormData({ ...formData, tradingName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                    Main Business Activity (ANZSIC)
                  </label>
                  <input
                    type="text"
                    value={formData.mainBusinessActivity}
                    onChange={(e) => setFormData({ ...formData, mainBusinessActivity: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                  Registered Business Address (Private & Legal)
                </label>
                <input
                  type="text"
                  value={formData.businessAddress}
                  onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                />
                <p className="text-xs text-neutral-400 mt-1">
                  Protected by Legal Identity Layer. Never disclosed on public storefront or social profiles.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">GST Registration Status</div>
                    <div className="text-xs text-neutral-400">
                      Required by ATO if GST turnover reaches or exceeds $75,000 AUD.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={taxData.gstRegistered}
                      onChange={(e) => setTaxData({ ...taxData, gstRegistered: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {taxData.gstRegistered && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-700">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                        Accounting Basis for GST
                      </label>
                      <select
                        value={taxData.accountingBasis}
                        onChange={(e) => setTaxData({ ...taxData, accountingBasis: e.target.value as 'cash' | 'accruals' })}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="cash">Cash Basis (Recommended for creators)</option>
                        <option value="accruals">Accruals / Non-Cash</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
                        BAS Lodgement Frequency
                      </label>
                      <select
                        value={taxData.basFrequency}
                        onChange={(e) => setTaxData({ ...taxData, basFrequency: e.target.value as 'quarterly' | 'monthly' | 'annually' })}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="quarterly">Quarterly (Most common)</option>
                        <option value="monthly">Monthly</option>
                        <option value="annually">Annually</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">PAYG Withholding Registration</div>
                    <div className="text-xs text-neutral-400">
                      Required if you employ workers or withhold amounts from suppliers without an ABN.
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={taxData.paygWithholdingRegistered}
                      onChange={(e) => setTaxData({ ...taxData, paygWithholdingRegistered: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Registered Tax Agent or BAS Agent</div>
                    <div className="text-xs text-neutral-400">
                      Do you have an external Australian accountant or tax agent?
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={taxData.hasTaxAgent}
                      onChange={(e) => setTaxData({ ...taxData, hasTaxAgent: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                {taxData.hasTaxAgent && (
                  <div className="pt-2">
                    <input
                      type="text"
                      value={taxData.taxAgentName || ''}
                      onChange={(e) => setTaxData({ ...taxData, taxAgentName: e.target.value })}
                      placeholder="Accountant Firm Name (e.g. Apex Creator Advisory)"
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-400">
                Configure your active revenue streams and operational touchpoints to customize your compliance radar:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'hasBookings', label: 'Brand Deals & Sponsored Campaigns', desc: 'Invoicing brands and agencies for posts, UGC, appearances' },
                  { key: 'hasPlatformPayouts', label: 'Platform Payouts', desc: 'YouTube, OnlyFans, Patreon, TikTok Creator Rewards' },
                  { key: 'hasDigitalProducts', label: 'Digital Products & Presets', desc: 'Lightroom presets, eBooks, digital guides' },
                  { key: 'hasPhysicalProducts', label: 'Physical Merch & Products', desc: 'Apparel, prints, physical accessories' },
                  { key: 'hasContractors', label: 'Engages Contractors', desc: 'Videographers, editors, assistants, makeup artists' },
                  { key: 'hasEmployees', label: 'Employs Staff', desc: 'Full-time or casual employees on wages' }
                ].map(({ key, label, desc }) => {
                  const val = opData[key as keyof OperatingProfile] as boolean;
                  return (
                    <div
                      key={key}
                      onClick={() => setOpData({ ...opData, [key]: !val })}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                        val ? 'bg-emerald-950/20 border-emerald-500/40 text-white' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-neutral-100">{label}</span>
                        <input
                          type="checkbox"
                          checked={val}
                          readOnly
                          className="rounded text-emerald-600 focus:ring-0 bg-neutral-800 border-neutral-700"
                        />
                      </div>
                      <p className="text-xs text-neutral-400">{desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-400">
                fleshsesh separates operating funds from tax escrow to protect creators from surprise tax liabilities:
              </p>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-600/20 text-orange-400 flex items-center justify-center font-bold">
                      UP
                    </div>
                    <div>
                      <div className="font-semibold text-white">Up Bank / Everyday Business</div>
                      <div className="text-xs text-neutral-400 font-mono">BSB 633-123 · Acc •••• 4920</div>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">Connected</span>
                </div>

                <div className="p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold">
                      CBA
                    </div>
                    <div>
                      <div className="font-semibold text-white">CommBank / Tax & GST Reserve</div>
                      <div className="text-xs text-neutral-400 font-mono">BSB 062-111 · Acc •••• 8812</div>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">Connected</span>
                </div>

                <div className="p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                      S
                    </div>
                    <div>
                      <div className="font-semibold text-white">Stripe / Platform Connect</div>
                      <div className="text-xs text-neutral-400">Card processing & digital sales</div>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">Active</span>
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-600/40">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                  <ShieldCheck className="w-5 h-5" />
                  Business Compliance Map Generated
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Based on your ABN profile ({formData.abn}) and entity structure ({formData.entityType === 'company' ? 'Proprietary Company' : 'Sole Trader'}), fleshsesh has activated your Australian compliance radar.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <span className="font-mono text-neutral-400">ABR Status</span>
                  <span className="text-emerald-400 font-medium">Verified Active · 28-day change monitor engaged</span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <span className="font-mono text-neutral-400">ATO GST Policy</span>
                  <span className="text-neutral-200">
                    {taxData.gstRegistered ? 'Tax Invoices enabled · Quarterly BAS tracking' : '$75,000 threshold monitor running'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <span className="font-mono text-neutral-400">Workforce Rules</span>
                  <span className="text-neutral-200">
                    {opData.hasContractors ? '12% Super Guarantee contractor check ready' : 'No active staff detected'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <span className="font-mono text-neutral-400">ASIC Governance</span>
                  <span className="text-neutral-200">
                    {formData.entityType === 'company' ? 'Annual Review & Solvency minute active' : 'Not applicable (Sole Trader)'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <button
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              step === 1 ? 'opacity-30 cursor-not-allowed text-neutral-500' : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>

          {step < 6 ? (
            <button
              onClick={() => {
                if (step === 2 && !abnValidation.isValid) return;
                setStep(s => s + 1);
              }}
              disabled={step === 2 && !abnValidation.isValid}
              className={`px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                step === 2 && !abnValidation.isValid
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
              }`}
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
            >
              Enter Business Workspace <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
