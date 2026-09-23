export type EntityType = 'sole_trader' | 'company' | 'partnership' | 'trust' | 'other';

export type GSTAccountingBasis = 'cash' | 'accruals';
export type BASFrequency = 'monthly' | 'quarterly' | 'annually';

export interface BusinessIdentity {
  abn: string;
  acn?: string;
  legalName: string;
  tradingName: string;
  businessName: string;
  entityType: EntityType;
  mainBusinessActivity: string;
  anzsicCode: string;
  businessAddress: string;
  postalAddress: string;
  contactEmail: string;
  contactPhone: string;
  startDate: string;
  status: 'active' | 'cancelled' | 'pending';
  abnLastVerifiedAt: string;
  abrLastCheckedAt: string;
}

export interface CreatorProfile {
  creatorHandle: string;
  primaryPlatforms: string[];
  publicEmail: string;
  agentOrManagerName?: string;
  agentEmail?: string;
  mediaKitUrl?: string;
  discreetMode: boolean;
}

export interface TaxProfile {
  gstRegistered: boolean;
  gstRegistrationDate?: string;
  accountingBasis: GSTAccountingBasis;
  basFrequency: BASFrequency;
  paygWithholdingRegistered: boolean;
  hasTaxAgent: boolean;
  taxAgentName?: string;
  taxAgentNumber?: string;
  financialYear: string; // e.g. "2026-2027"
}

export interface OperatingProfile {
  hasBookings: boolean;
  hasPhysicalProducts: boolean;
  hasDigitalProducts: boolean;
  hasSubscriptions: boolean;
  hasPlatformPayouts: boolean;
  hasAffiliateIncome: boolean;
  hasContractors: boolean;
  hasEmployees: boolean;
  hasInterstateActivity: boolean;
  hasOverseasActivity: boolean;
}

export type ObligationAuthority = 'ABR' | 'ASIC' | 'ATO' | 'WORKFORCE' | 'DOCUMENTS';
export type ObligationStatus = 'READY' | 'ACTION_REQUIRED' | 'REVIEW_REQUIRED' | 'APPROACHING' | 'NOT_APPLICABLE' | 'LOCKED';

export interface ObligationItem {
  id: string;
  authority: ObligationAuthority;
  title: string;
  status: ObligationStatus;
  summary: string;
  whyExplanation: string;
  authorityReference: string; // e.g. "ATO QC 22412", "Corporations Act s300B"
  dataTrigger: string;
  actionRequired: string;
  dueDate?: string;
  daysRemaining?: number;
}

export interface Client {
  id: string;
  legalName: string;
  tradingName: string;
  abn?: string;
  contactName: string;
  email: string;
  phone?: string;
  clientType: 'brand' | 'agency' | 'production' | 'platform' | 'retailer' | 'private';
  billingAddress: string;
  paymentTermsDays: number;
  totalLifetimeRevenue: number;
  notes?: string;
}

export type BookingStatus = 'lead' | 'quote' | 'negotiation' | 'confirmed' | 'delivery' | 'invoiced' | 'paid' | 'completed';
export type BookingType = 'sponsored_content' | 'paid_post' | 'ugc' | 'modelling' | 'event_appearance' | 'livestream' | 'licensing' | 'campaign';

export interface Booking {
  id: string;
  clientId: string;
  campaignName: string;
  bookingType: BookingType;
  startDate: string;
  endDate: string;
  location: string;
  isRemote: boolean;
  fee: number;
  commissionRate: number; // e.g. 0.15 for 15% agency
  commissionAmount: number;
  reimbursements: number;
  gstInclusive: boolean;
  gstAmount: number;
  totalAmount: number;
  status: BookingStatus;
  deliverables: string[];
  usageRights: string;
  exclusivityMonths: number;
  invoiceId?: string;
  notes?: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  clientId: string;
  bookingId?: string;
  issueDate: string;
  expiryDate: string;
  deliverables: string[];
  usageRights: string;
  exclusivity: string;
  subtotal: number;
  gstAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'converted';
  convertedInvoiceId?: string;
  terms: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  gstRate: number; // usually 0.10 or 0
  amount: number;
}

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue' | 'voided';

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-000001"
  clientId: string;
  bookingId?: string;
  isTaxInvoice: boolean; // MUST be true ONLY if GST registered!
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  gstTotal: number;
  total: number;
  status: InvoiceStatus;
  paidDate?: string;
  paymentMethod?: string;
  notes?: string;
  auditTrail: string[];
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  type: 'physical' | 'digital' | 'preset' | 'subscription' | 'service';
  price: number;
  cost: number;
  gstInclusive: boolean;
  inventoryEnabled: boolean;
  inventoryQuantity: number;
  active: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  channel: 'storefront' | 'brand_deal' | 'subscription' | 'affiliate' | 'tip' | 'platform';
  date: string;
  subtotal: number;
  gstAmount: number;
  shipping: number;
  total: number;
  status: 'completed' | 'processing' | 'refunded';
  itemsSummary: string;
}

export interface PlatformPayout {
  id: string;
  platform: 'OnlyFans' | 'Fansly' | 'YouTube' | 'TikTok' | 'Patreon' | 'Twitch' | 'Substack' | 'Brand Direct';
  periodStart: string;
  periodEnd: string;
  depositDate: string;
  grossRevenue: number;
  platformFee: number;
  paymentProcessingFee: number;
  managementCommission: number;
  netPayout: number;
  status: 'deposited' | 'reconciled' | 'pending';
  bankTransactionId?: string;
}

export type ExpenseCategory = 
  | 'Advertising'
  | 'Accounting & Legal'
  | 'Software & Subscriptions'
  | 'Telecommunications'
  | 'Photography & Studio'
  | 'Equipment & Cameras'
  | 'Costumes & Business Clothing'
  | 'Props & Styling'
  | 'Travel & Flights'
  | 'Accommodation'
  | 'Motor Vehicle'
  | 'Insurance'
  | 'Contractors & Assistants'
  | 'Platform & Merchant Fees'
  | 'Bank Fees'
  | 'Other Expenses';

export interface Expense {
  id: string;
  date: string;
  supplier: string;
  supplierAbn?: string;
  category: ExpenseCategory;
  description: string;
  grossAmount: number;
  gstAmount: number;
  netAmount: number;
  businessUsePercentage: number; // e.g. 70 for 70%
  claimableAmount: number;
  claimableGst: number;
  deductibilityConfidence: 'HIGH' | 'REVIEW' | 'RULE_DEPENDENT';
  taxNotes?: string;
  receiptUrl?: string;
  receiptName?: string;
  receiptOcrVerified: boolean;
  isReconciled: boolean;
  bankTransactionId?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  bsb: string;
  accountNumber: string; // masked e.g. "•••• 4891"
  balance: number;
  type: 'transaction' | 'tax_reserve' | 'savings';
  lastSynced: string;
}

export interface BankTransaction {
  id: string;
  bankAccountId: string;
  date: string;
  description: string;
  amount: number; // positive = credit/deposit, negative = debit/spend
  status: 'IMPORTED' | 'MATCHED' | 'CATEGORISED' | 'REVIEW' | 'RECONCILED' | 'LOCKED';
  matchedType?: 'invoice' | 'expense' | 'payout' | 'drawing';
  matchedId?: string;
  notes?: string;
}

export interface JournalLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  reference: string;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  isLocked: boolean;
  postedAt: string;
}

export interface BASPeriod {
  periodId: string;
  label: string; // e.g. "Q1 2026 (Jul - Sep 2026)"
  startDate: string;
  endDate: string;
  dueDate: string;
  status: 'OPEN' | 'REVIEW' | 'READY' | 'LODGED' | 'LOCKED';
  // G-fields
  g1TotalSales: number;
  g2ExportSales: number;
  g3OtherGSTFree: number;
  g10CapitalPurchases: number;
  g11NonCapitalPurchases: number;
  // 1-fields
  gst1aSalesGst: number;
  gst1bPurchaseGstCredits: number;
  netGstPayable: number;
  // PAYG fields
  w1TotalWages: number;
  w2WithheldAmount: number;
  accountantNotes?: string;
  lockedAt?: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  category: 'receipt' | 'contract' | 'tax_invoice' | 'registration' | 'asic' | 'bank_statement';
  filename: string;
  fileSize: string;
  uploadDate: string;
  retentionUntil: string; // 5 or 7 years ATO/ASIC
  isSensitiveVault: boolean;
  linkedTransactionId?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  objectType: string;
  objectId: string;
  description: string;
  hash: string;
}
