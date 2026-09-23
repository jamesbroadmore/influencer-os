import { EntityType, ObligationItem } from '../types';

/**
 * Validates Australian Business Number (ABN) using official ATO/ABR modulus 89 algorithm.
 * An ABN is 11 digits.
 * 1. Subtract 1 from the first (left) digit.
 * 2. Multiply each digit by its weighting factor: [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19].
 * 3. Sum the products.
 * 4. Divide sum by 89; if remainder is 0, the ABN is mathematically valid.
 */
export function validateAustralianABN(abnInput: string): { isValid: boolean; formatted: string; error?: string } {
  const clean = abnInput.replace(/\s+/g, '');
  if (!/^\d{11}$/.test(clean)) {
    return { isValid: false, formatted: abnInput, error: 'ABN must consist of exactly 11 numeric digits.' };
  }

  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const digits = clean.split('').map(Number);
  digits[0] -= 1; // subtract 1 from first digit

  let sum = 0;
  for (let i = 0; i < 11; i++) {
    sum += digits[i] * weights[i];
  }

  const isValid = sum % 89 === 0;
  const formatted = `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8, 11)}`;
  
  return {
    isValid,
    formatted,
    error: isValid ? undefined : 'ABN checksum failed official ABR modulus-89 verification.'
  };
}

/**
 * Format currency to AUD ($)
 */
export function formatAUD(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Versioned Australian Regulatory Rules (as of 2026/2027 Financial Year)
 */
export const VERSIONED_RULES = {
  GST_THRESHOLD: {
    ruleId: 'ATO.GST.THRESHOLD.V2026',
    standardThreshold: 75000,
    nonProfitThreshold: 150000,
    rate: 0.10,
    authority: 'ATO',
    sourceRef: 'QC 22412 - Registering for GST',
    effectiveFrom: '2000-07-01'
  },
  SUPER_GUARANTEE: {
    ruleId: 'ATO.SG.RATE.V2025',
    rate: 0.12, // 12% effective 1 July 2025 onwards
    authority: 'ATO',
    sourceRef: 'Super guarantee percentage rates table',
    effectiveFrom: '2025-07-01'
  },
  ABR_CHANGE_WINDOW: {
    ruleId: 'ABR.DETAILS.UPDATE.28DAYS',
    daysAllowed: 28,
    authority: 'ABR',
    sourceRef: 'Updating or cancelling your ABN (28 day rule)'
  },
  ASIC_LARGE_PTY: {
    ruleId: 'ASIC.LARGE.PROPRIETARY.V2019',
    revenueThreshold: 50000000,
    grossAssetsThreshold: 25000000,
    employeeThreshold: 100,
    criteriaNeeded: 2,
    authority: 'ASIC',
    sourceRef: 'Corporations Act 2001 s 45A(3)'
  },
  INDIVIDUAL_TAX_RATES_2026_27: {
    ruleId: 'ATO.INDIVIDUAL_RATES.2026_2027',
    brackets: [
      { min: 0, max: 18200, rate: 0, base: 0 },
      { min: 18201, max: 45000, rate: 0.16, base: 0 },
      { min: 45001, max: 135000, rate: 0.30, base: 4288 },
      { min: 135001, max: 190000, rate: 0.37, base: 31288 },
      { min: 190001, max: Infinity, rate: 0.45, base: 51638 }
    ],
    medicareLevyRate: 0.02
  }
};

/**
 * GST Turnover Calculation & Monitoring
 * ATO definition:
 * Current GST Turnover: Current month plus previous 11 months
 * Projected GST Turnover: Current month plus next 11 months
 */
export function evaluateGSTTurnover(current12mTurnover: number, projected12mTurnover: number, isRegistered: boolean) {
  const threshold = VERSIONED_RULES.GST_THRESHOLD.standardThreshold;
  const isOverCurrent = current12mTurnover >= threshold;
  const isOverProjected = projected12mTurnover >= threshold;
  const isApproaching = current12mTurnover >= threshold * 0.85 || projected12mTurnover >= threshold * 0.85;

  let status: 'COMPLIANT' | 'MONITOR' | 'ACTION_REQUIRED' = 'MONITOR';
  let message = '';

  if (isRegistered) {
    status = 'COMPLIANT';
    message = 'You are registered for GST. You must lodge BAS and charge 10% GST on taxable supplies.';
  } else if (isOverCurrent || isOverProjected) {
    status = 'ACTION_REQUIRED';
    message = `Your turnover (${formatAUD(Math.max(current12mTurnover, projected12mTurnover))}) has reached or projected to exceed the $75,000 threshold. You generally have 21 days to register for GST with the ATO.`;
  } else if (isApproaching) {
    status = 'MONITOR';
    message = `Your turnover is approaching the $75,000 GST threshold (${Math.round((current12mTurnover / threshold) * 100)}% of threshold). Monitor projected deals.`;
  } else {
    status = 'COMPLIANT';
    message = `Current turnover (${formatAUD(current12mTurnover)}) is below the $75,000 registration threshold. Voluntary registration remains optional.`;
  }

  return {
    status,
    threshold,
    current12mTurnover,
    projected12mTurnover,
    percentOfThreshold: Math.min(100, Math.round((current12mTurnover / threshold) * 100)),
    message,
    sourceRef: VERSIONED_RULES.GST_THRESHOLD.sourceRef
  };
}

/**
 * Indicative Australian Individual Tax Calculation for Sole Traders / Director Drawings
 */
export function estimateAustralianTax(taxableIncome: number, entityType: EntityType): {
  taxableIncome: number;
  grossTax: number;
  medicareLevy: number;
  totalEstimatedTax: number;
  effectiveRate: number;
  suggestedReserve: number;
  explanation: string;
} {
  if (taxableIncome <= 0) {
    return {
      taxableIncome: 0,
      grossTax: 0,
      medicareLevy: 0,
      totalEstimatedTax: 0,
      effectiveRate: 0,
      suggestedReserve: 0,
      explanation: 'No taxable net income recorded yet.'
    };
  }

  if (entityType === 'company') {
    // Australian Base Rate Entity company tax rate is 25% (under $50M turnover with 80% or less passive income)
    const companyRate = 0.25;
    const grossTax = taxableIncome * companyRate;
    return {
      taxableIncome,
      grossTax,
      medicareLevy: 0,
      totalEstimatedTax: grossTax,
      effectiveRate: 25,
      suggestedReserve: grossTax,
      explanation: 'Calculated using Australian Base Rate Entity corporate tax rate (25%). Individual distributions may incur separate franking tax.'
    };
  }

  // Sole trader progressive rates
  const brackets = VERSIONED_RULES.INDIVIDUAL_TAX_RATES_2026_27.brackets;
  let grossTax = 0;

  for (const b of brackets) {
    if (taxableIncome > b.min) {
      const taxableInBracket = Math.min(taxableIncome, b.max) - b.min;
      grossTax = b.base + taxableInBracket * b.rate;
    }
  }

  const medicareLevy = taxableIncome > 26000 ? taxableIncome * VERSIONED_RULES.INDIVIDUAL_TAX_RATES_2026_27.medicareLevyRate : 0;
  const totalEstimatedTax = grossTax + medicareLevy;
  const effectiveRate = taxableIncome > 0 ? (totalEstimatedTax / taxableIncome) * 100 : 0;

  return {
    taxableIncome,
    grossTax,
    medicareLevy,
    totalEstimatedTax,
    effectiveRate: Math.round(effectiveRate * 10) / 10,
    suggestedReserve: Math.ceil(totalEstimatedTax / 100) * 100, // round up to nearest $100
    explanation: 'Calculated using 2026-2027 Australian resident individual tax brackets + 2% Medicare levy. Actual liability depends on personal offsets, HECS/HELP debt, and final accountant assessment.'
  };
}

/**
 * Worker Classification Test (Employee vs Contractor)
 * Implements ATO multi-factor decision assessment
 */
export function evaluateWorkerClassification(factors: {
  hasControlOverHoursAndWork: boolean; // true = worker has control (contractor)
  providesOwnEquipment: boolean; // true = contractor
  bearsCommercialRisk: boolean; // true = contractor
  paidByDeliverableOrQuote: boolean; // true = contractor (hourly/time usually employee)
  canSubcontractOrDelegate: boolean; // true = contractor
}) {
  let contractorScore = 0;
  if (factors.hasControlOverHoursAndWork) contractorScore++;
  if (factors.providesOwnEquipment) contractorScore++;
  if (factors.bearsCommercialRisk) contractorScore++;
  if (factors.paidByDeliverableOrQuote) contractorScore++;
  if (factors.canSubcontractOrDelegate) contractorScore++;

  if (contractorScore >= 4) {
    return {
      classification: 'LIKELY_INDEPENDENT_CONTRACTOR' as const,
      riskLevel: 'LOW',
      superObligation: 'REVIEW - If contractor is engaged wholly or principally for their labour, Super Guarantee (12%) may still apply under SGAA 1992 s 12(3).',
      paygObligation: 'No PAYG withholding required if genuine contractor with valid Australian ABN quoted.',
      tparObligation: 'Review if services relate to IT, cleaning, courier, or building activities.',
      recommendation: 'Ensure a written Contractor Agreement is executed with an active ABN quoted before payment.'
    };
  } else if (contractorScore === 3) {
    return {
      classification: 'BORDERLINE_NEEDS_REVIEW' as const,
      riskLevel: 'MEDIUM',
      superObligation: 'High likelihood of Super Guarantee (12%) liability. ATO deems many individual workers statutory employees for super purposes.',
      paygObligation: 'Possible PAYG withholding requirement if terms resemble employment.',
      tparObligation: 'Check industry applicability.',
      recommendation: 'Borderline indicators. Consult your accountant or tax agent to avoid sham contracting penalties.'
    };
  } else {
    return {
      classification: 'LIKELY_COMMON_LAW_EMPLOYEE' as const,
      riskLevel: 'HIGH',
      superObligation: 'Mandatory: 12% Super Guarantee must be paid into the employee’s nominated super fund by quarterly due dates.',
      paygObligation: 'Mandatory: Must register for PAYG Withholding, collect TFN declaration, and report via Single Touch Payroll (STP).',
      tparObligation: 'Not applicable (reported via STP wages, not TPAR).',
      recommendation: 'Worker displays typical employment characteristics. Treat as an employee with PAYG withholding and Fair Work award compliance.'
    };
  }
}
