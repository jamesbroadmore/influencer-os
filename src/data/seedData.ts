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
  DocumentRecord,
  AuditEvent,
  ObligationItem
} from '../types';

export const INITIAL_BUSINESS_IDENTITY: BusinessIdentity = {
  abn: '51 824 753 556',
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
  abnLastVerifiedAt: '2026-09-12T09:30:00Z',
  abrLastCheckedAt: '2026-09-22T04:15:00Z'
};

export const INITIAL_CREATOR_PROFILE: CreatorProfile = {
  creatorHandle: '@kirazhang',
  primaryPlatforms: ['Instagram', 'TikTok', 'YouTube', 'Patreon', 'OnlyFans'],
  publicEmail: 'collabs@kirazhang.com',
  agentOrManagerName: 'Talent Republic AU (Marcus Vance)',
  agentEmail: 'marcus@talentrepublic.com.au',
  mediaKitUrl: 'https://kirazhang.com/media-kit-2026.pdf',
  discreetMode: false
};

export const INITIAL_TAX_PROFILE: TaxProfile = {
  gstRegistered: true,
  gstRegistrationDate: '2024-03-01',
  accountingBasis: 'cash',
  basFrequency: 'quarterly',
  paygWithholdingRegistered: true,
  hasTaxAgent: true,
  taxAgentName: 'Apex Creator Advisory Group (Chartered Accountants)',
  taxAgentNumber: 'RAN 25981203',
  financialYear: '2026-2027'
};

export const INITIAL_OPERATING_PROFILE: OperatingProfile = {
  hasBookings: true,
  hasPhysicalProducts: true,
  hasDigitalProducts: true,
  hasSubscriptions: true,
  hasPlatformPayouts: true,
  hasAffiliateIncome: true,
  hasContractors: true,
  hasEmployees: false,
  hasInterstateActivity: true,
  hasOverseasActivity: true
};

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    legalName: 'Gymshark Australia Pty Ltd',
    tradingName: 'Gymshark AU',
    abn: '32 628 119 402',
    contactName: 'Chloe Bennett',
    email: 'chloe.bennett@gymshark.com',
    phone: '+61 2 9182 3400',
    clientType: 'brand',
    billingAddress: 'Level 12, 100 Mount St, North Sydney NSW 2060',
    paymentTermsDays: 14,
    totalLifetimeRevenue: 28500,
    notes: 'Key brand partner. Requires usage rights for 6 months digital only.'
  },
  {
    id: 'cli-002',
    legalName: 'Mecca Brands Pty Ltd',
    tradingName: 'MECCA',
    abn: '11 077 859 931',
    contactName: 'Julian Rossi',
    email: 'partnerships@mecca.com.au',
    clientType: 'brand',
    billingAddress: '34 Wangaratta St, Richmond VIC 3121',
    paymentTermsDays: 30,
    totalLifetimeRevenue: 16200,
    notes: 'Beauty campaigns. Requires strict product exclusivity for 30 days.'
  },
  {
    id: 'cli-003',
    legalName: 'Sony Music Entertainment (Australia) Pty Ltd',
    tradingName: 'Sony Music AU',
    abn: '95 107 177 104',
    contactName: 'Saskia Vance',
    email: 'creator.relations@sonymusic.com',
    clientType: 'production',
    billingAddress: '11-19 Hargrave St, East Sydney NSW 2010',
    paymentTermsDays: 14,
    totalLifetimeRevenue: 12400,
    notes: 'Audio syncing and music launch campaigns.'
  },
  {
    id: 'cli-004',
    legalName: 'Amplify Creative Agency Pty Ltd',
    tradingName: 'Amplify Talent',
    abn: '48 601 233 490',
    contactName: 'Dave Kowalski',
    email: 'bookings@amplify.com.au',
    clientType: 'agency',
    billingAddress: '72 Commercial Rd, Prahran VIC 3181',
    paymentTermsDays: 7,
    totalLifetimeRevenue: 34100,
    notes: 'Talent agency intermediary for tier-1 brands.'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-101',
    clientId: 'cli-001',
    campaignName: 'Gymshark Vital Seamless Spring 2026',
    bookingType: 'campaign',
    startDate: '2026-09-28',
    endDate: '2026-10-05',
    location: 'Bondi Beach & Studio 4, Sydney',
    isRemote: false,
    fee: 7500,
    commissionRate: 0.15,
    commissionAmount: 1125,
    reimbursements: 350,
    gstInclusive: true,
    gstAmount: 713.64,
    totalAmount: 7850,
    status: 'confirmed',
    deliverables: [
      '1x Dedicated 60s Reel (IG/TikTok)',
      '3x In-feed Carousel Story Frames with tracking link',
      '90-day organic digital usage rights'
    ],
    usageRights: 'Australia & NZ digital ad amplification for 90 days',
    exclusivityMonths: 1,
    invoiceId: 'inv-2026-003',
    notes: 'Products arriving by courier 25 Sep.'
  },
  {
    id: 'bk-102',
    clientId: 'cli-002',
    campaignName: 'Mecca Holiday Gifting Preview',
    bookingType: 'event_appearance',
    startDate: '2026-10-12',
    endDate: '2026-10-12',
    location: 'Mecca Flagship, George St Sydney',
    isRemote: false,
    fee: 4500,
    commissionRate: 0.15,
    commissionAmount: 675,
    reimbursements: 0,
    gstInclusive: true,
    gstAmount: 409.09,
    totalAmount: 4500,
    status: 'quote',
    deliverables: [
      '2-hour live attendance & red carpet photo call',
      '4x Live IG Stories during evening'
    ],
    usageRights: 'PR editorial and event recap reels only',
    exclusivityMonths: 0,
    notes: 'Quote sent 20 Sep. Awaiting formal acceptance.'
  },
  {
    id: 'bk-103',
    clientId: 'cli-003',
    campaignName: 'Indie Artist Single Launch Sound Trend',
    bookingType: 'ugc',
    startDate: '2026-09-15',
    endDate: '2026-09-20',
    location: 'Home Studio (Remote)',
    isRemote: true,
    fee: 3200,
    commissionRate: 0.15,
    commissionAmount: 480,
    reimbursements: 0,
    gstInclusive: true,
    gstAmount: 290.91,
    totalAmount: 3200,
    status: 'invoiced',
    deliverables: [
      '2x TikTok videos featuring audio hook',
      'Permanent pinned sound for 30 days'
    ],
    usageRights: 'Global digital organic rights',
    exclusivityMonths: 0,
    invoiceId: 'inv-2026-002',
    notes: 'Delivered on time. Invoice issued.'
  }
];

export const INITIAL_QUOTES: Quote[] = [
  {
    id: 'qte-2026-001',
    quoteNumber: 'QTE-2026-001',
    clientId: 'cli-002',
    bookingId: 'bk-102',
    issueDate: '2026-09-20',
    expiryDate: '2026-10-04',
    deliverables: [
      '2-hour personal appearance at flagship event',
      '4x IG Story clips tagged @meccabeauty',
      'High-res press photography access'
    ],
    usageRights: 'PR recap only, 30 days across Australia/NZ',
    exclusivity: 'No rival prestige beauty brands for 14 days',
    subtotal: 4090.91,
    gstAmount: 409.09,
    total: 4500.00,
    status: 'sent',
    terms: 'Payment 30 days from completion. 50% deposit required if cancelled within 7 days.'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-2026-001',
    invoiceNumber: 'INV-2026-000001',
    clientId: 'cli-004',
    isTaxInvoice: true,
    issueDate: '2026-08-15',
    dueDate: '2026-08-22',
    items: [
      {
        id: 'itm-1',
        description: 'Brand Campaign - Spring Athletic Line UGC Series (3x Reels)',
        quantity: 1,
        unitPrice: 5000,
        gstRate: 0.10,
        amount: 5000
      }
    ],
    subtotal: 5000,
    gstTotal: 500,
    total: 5500,
    status: 'paid',
    paidDate: '2026-08-20',
    paymentMethod: 'Bank Transfer (BSB 062-000)',
    notes: 'Thank you for your business. Remitted to Kira Media Pty Ltd.',
    auditTrail: [
      'Created 2026-08-15T10:00:00Z',
      'Sent to accounts@amplify.com.au 2026-08-15T10:15:00Z',
      'Paid via EFT 2026-08-20T14:32:00Z'
    ]
  },
  {
    id: 'inv-2026-002',
    invoiceNumber: 'INV-2026-000002',
    clientId: 'cli-003',
    bookingId: 'bk-103',
    isTaxInvoice: true,
    issueDate: '2026-09-18',
    dueDate: '2026-10-02',
    items: [
      {
        id: 'itm-2',
        description: 'Sound Trend Campaign - 2x TikTok Dedicated UGC Clips',
        quantity: 1,
        unitPrice: 2909.09,
        gstRate: 0.10,
        amount: 2909.09
      }
    ],
    subtotal: 2909.09,
    gstTotal: 290.91,
    total: 3200,
    status: 'issued',
    notes: 'Payment terms: 14 days. Bank details: CommBank BSB 062-111 Acc 889123.',
    auditTrail: [
      'Created 2026-09-18T11:20:00Z',
      'Issued as official ATO Tax Invoice'
    ]
  },
  {
    id: 'inv-2026-003',
    invoiceNumber: 'INV-2026-000003',
    clientId: 'cli-001',
    bookingId: 'bk-101',
    isTaxInvoice: true,
    issueDate: '2026-09-21',
    dueDate: '2026-10-05',
    items: [
      {
        id: 'itm-3',
        description: 'Gymshark Vital Seamless Campaign - Content Creation & Talent Fee',
        quantity: 1,
        unitPrice: 6818.18,
        gstRate: 0.10,
        amount: 6818.18
      },
      {
        id: 'itm-4',
        description: 'Production Assistant & Location Permit Reimbursement (at cost)',
        quantity: 1,
        unitPrice: 318.18,
        gstRate: 0.10,
        amount: 318.18
      }
    ],
    subtotal: 7136.36,
    gstTotal: 713.64,
    total: 7850,
    status: 'issued',
    notes: 'Deposit / Deliverable milestone invoice.',
    auditTrail: [
      'Created 2026-09-21T08:45:00Z',
      'Sent to Chloe Bennett'
    ]
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prd-01',
    sku: 'DIG-PRESET-01',
    name: 'Sydney Golden Hour Lightroom Mobile Preset Pack',
    description: '12 signature creator color-grading presets for DNG and Desktop Lightroom.',
    type: 'preset',
    price: 49.00,
    cost: 0,
    gstInclusive: true,
    inventoryEnabled: false,
    inventoryQuantity: 9999,
    active: true
  },
  {
    id: 'prd-02',
    sku: 'DIG-DECK-02',
    name: 'The 6-Figure Creator Media Kit & Pitch Deck Template',
    description: 'Fully customizable Notion & Canva pitch kit used by Kira Zhang.',
    type: 'digital',
    price: 89.00,
    cost: 0,
    gstInclusive: true,
    inventoryEnabled: false,
    inventoryQuantity: 9999,
    active: true
  },
  {
    id: 'prd-03',
    sku: 'MERCH-HOODIE-M',
    name: 'Kira Zhang Studios "UNFILTERED" Heavyweight Fleece Hoodie',
    description: '450gsm organic cotton custom cut and sew hoodie made in Melbourne.',
    type: 'physical',
    price: 135.00,
    cost: 45.00,
    gstInclusive: true,
    inventoryEnabled: true,
    inventoryQuantity: 28,
    active: true
  },
  {
    id: 'prd-04',
    sku: 'SRV-CONSULT-1HR',
    name: '1-on-1 Creator Strategy & Deal Negotiation Audit (60 Min)',
    description: 'Private Zoom strategy session on brand contracts and rate negotiation.',
    type: 'service',
    price: 450.00,
    cost: 0,
    gstInclusive: true,
    inventoryEnabled: false,
    inventoryQuantity: 4,
    active: true
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-801',
    orderNumber: 'ORD-2026-0801',
    customerName: 'Sarah Jenkins',
    customerEmail: 's.jenkins@gmail.com',
    channel: 'storefront',
    date: '2026-09-21',
    subtotal: 44.55,
    gstAmount: 4.45,
    shipping: 0,
    total: 49.00,
    status: 'completed',
    itemsSummary: '1x Sydney Golden Hour Lightroom Mobile Preset Pack'
  },
  {
    id: 'ord-802',
    orderNumber: 'ORD-2026-0802',
    customerName: 'Liam O’Connor',
    customerEmail: 'liam.oc@outlook.com',
    channel: 'storefront',
    date: '2026-09-20',
    subtotal: 122.73,
    gstAmount: 12.27,
    shipping: 15.00,
    total: 150.00,
    status: 'processing',
    itemsSummary: '1x "UNFILTERED" Heavyweight Fleece Hoodie (Size L)'
  },
  {
    id: 'ord-803',
    orderNumber: 'ORD-2026-0803',
    customerName: 'Monique Laurent',
    customerEmail: 'monique@laurentmedia.co',
    channel: 'storefront',
    date: '2026-09-18',
    subtotal: 409.09,
    gstAmount: 40.91,
    shipping: 0,
    total: 450.00,
    status: 'completed',
    itemsSummary: '1x 1-on-1 Creator Strategy & Deal Negotiation Audit'
  }
];

export const INITIAL_PLATFORM_PAYOUTS: PlatformPayout[] = [
  {
    id: 'pay-001',
    platform: 'OnlyFans',
    periodStart: '2026-09-01',
    periodEnd: '2026-09-14',
    depositDate: '2026-09-17',
    grossRevenue: 8400.00,
    platformFee: 1680.00, // 20% OF platform take
    paymentProcessingFee: 252.00, // ~3% processing
    managementCommission: 646.80, // 10% on creator net
    netPayout: 5821.20,
    status: 'reconciled',
    bankTransactionId: 'tx-103'
  },
  {
    id: 'pay-002',
    platform: 'YouTube',
    periodStart: '2026-08-01',
    periodEnd: '2026-08-31',
    depositDate: '2026-09-21',
    grossRevenue: 3450.00,
    platformFee: 1552.50, // YouTube 45% Partner share
    paymentProcessingFee: 0,
    managementCommission: 0,
    netPayout: 1897.50,
    status: 'reconciled',
    bankTransactionId: 'tx-105'
  },
  {
    id: 'pay-003',
    platform: 'Patreon',
    periodStart: '2026-09-01',
    periodEnd: '2026-09-15',
    depositDate: '2026-09-19',
    grossRevenue: 1200.00,
    platformFee: 96.00, // 8% Pro tier
    paymentProcessingFee: 38.40,
    managementCommission: 0,
    netPayout: 1065.60,
    status: 'deposited',
    bankTransactionId: 'tx-104'
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-501',
    date: '2026-09-10',
    supplier: 'DigiDirect Sydney',
    supplierAbn: '64 123 456 789',
    category: 'Equipment & Cameras',
    description: 'Sony FX3 Cinema Line Full-Frame Camera Body for 4K UGC',
    grossAmount: 5299.00,
    gstAmount: 481.73,
    netAmount: 4817.27,
    businessUsePercentage: 100,
    claimableAmount: 5299.00,
    claimableGst: 481.73,
    deductibilityConfidence: 'HIGH',
    taxNotes: 'Essential production equipment. Eligible for instant asset write-off / depreciation schedule.',
    receiptName: 'DigiDirect-TaxInvoice-INV88291.pdf',
    receiptOcrVerified: true,
    isReconciled: true,
    bankTransactionId: 'tx-201'
  },
  {
    id: 'exp-502',
    date: '2026-09-14',
    supplier: 'Studio Tropico Sydney',
    supplierAbn: '88 491 029 384',
    category: 'Photography & Studio',
    description: 'Full day cyclorama studio hire + Profoto strobe lighting kit',
    grossAmount: 1100.00,
    gstAmount: 100.00,
    netAmount: 1000.00,
    businessUsePercentage: 100,
    claimableAmount: 1100.00,
    claimableGst: 100.00,
    deductibilityConfidence: 'HIGH',
    taxNotes: 'Production shoot for Gymshark spring campaign.',
    receiptName: 'StudioTropico-Receipt-1409.pdf',
    receiptOcrVerified: true,
    isReconciled: true,
    bankTransactionId: 'tx-202'
  },
  {
    id: 'exp-503',
    date: '2026-09-16',
    supplier: 'Telstra Corporation Limited',
    supplierAbn: '33 051 775 556',
    category: 'Telecommunications',
    description: 'Monthly mobile 5G plan + 200GB data for creator uploads',
    grossAmount: 115.00,
    gstAmount: 10.45,
    netAmount: 104.55,
    businessUsePercentage: 70, // 70% business / 30% private
    claimableAmount: 80.50,
    claimableGst: 7.32,
    deductibilityConfidence: 'HIGH',
    taxNotes: '70% business apportionment substantiated via 4-week mobile usage log as per ATO guidelines.',
    receiptName: 'Telstra-TaxInvoice-Sep2026.pdf',
    receiptOcrVerified: true,
    isReconciled: true,
    bankTransactionId: 'tx-203'
  },
  {
    id: 'exp-504',
    date: '2026-09-18',
    supplier: 'Adobe Systems Pty Ltd',
    supplierAbn: '72 054 249 059',
    category: 'Software & Subscriptions',
    description: 'Creative Cloud All Apps (Premiere Pro, Lightroom, After Effects)',
    grossAmount: 87.99,
    gstAmount: 8.00,
    netAmount: 79.99,
    businessUsePercentage: 100,
    claimableAmount: 87.99,
    claimableGst: 8.00,
    deductibilityConfidence: 'HIGH',
    taxNotes: 'Core production software.',
    receiptName: 'Adobe-Receipt-CC-Sep26.pdf',
    receiptOcrVerified: true,
    isReconciled: true,
    bankTransactionId: 'tx-204'
  },
  {
    id: 'exp-505',
    date: '2026-09-19',
    supplier: 'Zara Australia',
    supplierAbn: '41 144 040 311',
    category: 'Costumes & Business Clothing',
    description: 'Specific on-camera styling wardrobe for brand commercial',
    grossAmount: 320.00,
    gstAmount: 29.09,
    netAmount: 290.91,
    businessUsePercentage: 60,
    claimableAmount: 192.00,
    claimableGst: 17.45,
    deductibilityConfidence: 'REVIEW',
    taxNotes: 'ATO strict warning: Everyday conventional clothing is generally not deductible unless stage costume or protective uniform. Flagged for accountant review.',
    receiptName: 'Zara-Receipt-1909.pdf',
    receiptOcrVerified: true,
    isReconciled: false
  },
  {
    id: 'exp-506',
    date: '2026-09-20',
    supplier: 'Qantas Airways Limited',
    supplierAbn: '16 009 661 901',
    category: 'Travel & Flights',
    description: 'Return flight QF420 SYD -> MEL for fashion week shoot',
    grossAmount: 480.00,
    gstAmount: 43.64,
    netAmount: 436.36,
    businessUsePercentage: 100,
    claimableAmount: 480.00,
    claimableGst: 43.64,
    deductibilityConfidence: 'HIGH',
    taxNotes: 'Travel itinerary and brand invitation linked in Document Vault.',
    receiptName: 'Qantas-E-Ticket-QF420.pdf',
    receiptOcrVerified: true,
    isReconciled: false
  }
];

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bnk-01',
    bankName: 'Up Bank',
    accountName: 'Kira Media Pty Ltd - Everyday Business',
    bsb: '633-123',
    accountNumber: '•••• 4920',
    balance: 24890.40,
    type: 'transaction',
    lastSynced: '2026-09-22T08:15:00Z'
  },
  {
    id: 'bnk-02',
    bankName: 'Commonwealth Bank of Australia',
    accountName: 'Kira Media Pty Ltd - Tax & GST Reserve',
    bsb: '062-111',
    accountNumber: '•••• 8812',
    balance: 14250.00,
    type: 'tax_reserve',
    lastSynced: '2026-09-22T08:15:00Z'
  }
];

export const INITIAL_BANK_TRANSACTIONS: BankTransaction[] = [
  {
    id: 'tx-101',
    bankAccountId: 'bnk-01',
    date: '2026-08-20',
    description: 'AMPLIFY CREATIVE PTY LTD - REMITTANCE INV-2026-000001',
    amount: 5500.00,
    status: 'RECONCILED',
    matchedType: 'invoice',
    matchedId: 'inv-2026-001'
  },
  {
    id: 'tx-103',
    bankAccountId: 'bnk-01',
    date: '2026-09-17',
    description: 'FENIX INTERNET LLC - OF SETTLEMENT WIRE 84192',
    amount: 5821.20,
    status: 'RECONCILED',
    matchedType: 'payout',
    matchedId: 'pay-001'
  },
  {
    id: 'tx-104',
    bankAccountId: 'bnk-01',
    date: '2026-09-19',
    description: 'PATREON IRELAND LIMITED - PAYOUT SEP15',
    amount: 1065.60,
    status: 'MATCHED',
    matchedType: 'payout',
    matchedId: 'pay-003'
  },
  {
    id: 'tx-105',
    bankAccountId: 'bnk-01',
    date: '2026-09-21',
    description: 'GOOGLE ASIA PACIFIC - YOUTUBE PARTNER EARNINGS',
    amount: 1897.50,
    status: 'RECONCILED',
    matchedType: 'payout',
    matchedId: 'pay-002'
  },
  {
    id: 'tx-201',
    bankAccountId: 'bnk-01',
    date: '2026-09-10',
    description: 'DIGIDIRECT SYDNEY SYDNEY NSW AU',
    amount: -5299.00,
    status: 'RECONCILED',
    matchedType: 'expense',
    matchedId: 'exp-501'
  },
  {
    id: 'tx-202',
    bankAccountId: 'bnk-01',
    date: '2026-09-14',
    description: 'STUDIO TROPICO SURRY HILLS AU',
    amount: -1100.00,
    status: 'RECONCILED',
    matchedType: 'expense',
    matchedId: 'exp-502'
  },
  {
    id: 'tx-203',
    bankAccountId: 'bnk-01',
    date: '2026-09-16',
    description: 'TELSTRA DIRECT DEBIT BILL 90218942',
    amount: -115.00,
    status: 'RECONCILED',
    matchedType: 'expense',
    matchedId: 'exp-503'
  },
  {
    id: 'tx-204',
    bankAccountId: 'bnk-01',
    date: '2026-09-18',
    description: 'ADOBE SYSTEMS PTY LTD SYDNEY AU',
    amount: -87.99,
    status: 'RECONCILED',
    matchedType: 'expense',
    matchedId: 'exp-504'
  },
  {
    id: 'tx-205',
    bankAccountId: 'bnk-01',
    date: '2026-09-21',
    description: 'TRANSFER TO CBA TAX RESERVE BSB 062-111',
    amount: -2500.00,
    status: 'REVIEW',
    matchedType: 'drawing',
    notes: 'Internal transfer to separate tax escrow account.'
  },
  {
    id: 'tx-206',
    bankAccountId: 'bnk-01',
    date: '2026-09-22',
    description: 'SHOPIFY PAYMENTS STRIPE SETTLEMENT 801-802',
    amount: 199.00,
    status: 'IMPORTED',
    notes: 'Awaiting automatic matching with Storefront Orders.'
  }
];

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'jnl-001',
    entryNumber: 'JNL-2026-0001',
    date: '2026-08-20',
    reference: 'Invoice INV-2026-000001 Payment Receipt',
    lines: [
      { accountId: '1000', accountCode: '1000', accountName: 'Cash at Bank (Up Bank)', debit: 5500.00, credit: 0, description: 'Receipt from Amplify Creative' },
      { accountId: '4200', accountCode: '4200', accountName: 'Sponsorship & UGC Revenue', debit: 0, credit: 5000.00, description: 'Net campaign income' },
      { accountId: '2100', accountCode: '2100', accountName: 'GST Payable (1A)', debit: 0, credit: 500.00, description: '10% GST on taxable supply' }
    ],
    totalDebit: 5500.00,
    totalCredit: 5500.00,
    isBalanced: true,
    isLocked: true,
    postedAt: '2026-08-20T14:35:00Z'
  },
  {
    id: 'jnl-002',
    entryNumber: 'JNL-2026-0002',
    date: '2026-09-10',
    reference: 'Camera Equipment Purchase - Sony FX3',
    lines: [
      { accountId: '1300', accountCode: '1300', accountName: 'Plant & Equipment (Camera)', debit: 4817.27, credit: 0, description: 'Sony FX3 body asset' },
      { accountId: '2200', accountCode: '2200', accountName: 'GST Input Credits (1B)', debit: 481.73, credit: 0, description: 'GST paid on capital equipment' },
      { accountId: '1000', accountCode: '1000', accountName: 'Cash at Bank (Up Bank)', debit: 0, credit: 5299.00, description: 'Payment to DigiDirect' }
    ],
    totalDebit: 5299.00,
    totalCredit: 5299.00,
    isBalanced: true,
    isLocked: true,
    postedAt: '2026-09-10T16:00:00Z'
  },
  {
    id: 'jnl-003',
    entryNumber: 'JNL-2026-0003',
    date: '2026-09-17',
    reference: 'Platform Payout Breakdown - OnlyFans Period Sep 1-14',
    lines: [
      { accountId: '1000', accountCode: '1000', accountName: 'Cash at Bank (Up Bank)', debit: 5821.20, credit: 0, description: 'Net funds received in AU bank' },
      { accountId: '6500', accountCode: '6500', accountName: 'Platform Fees (20%)', debit: 1680.00, credit: 0, description: 'OnlyFans platform commission' },
      { accountId: '6600', accountCode: '6600', accountName: 'Merchant & Wire Fees', debit: 252.00, credit: 0, description: 'Payment processing fees' },
      { accountId: '6700', accountCode: '6700', accountName: 'Management Commission (10%)', debit: 646.80, credit: 0, description: 'Talent Republic agency fee' },
      { accountId: '4000', accountCode: '4000', accountName: 'Subscription & Platform Gross Revenue', debit: 0, credit: 8400.00, description: 'Gross fan spend before deductions' }
    ],
    totalDebit: 8400.00,
    totalCredit: 8400.00,
    isBalanced: true,
    isLocked: false,
    postedAt: '2026-09-17T11:00:00Z'
  }
];

export const INITIAL_BAS_PERIOD: BASPeriod = {
  periodId: 'bas-2026-q1',
  label: 'Q1 2026-2027 (1 July 2026 - 30 September 2026)',
  startDate: '2026-07-01',
  endDate: '2026-09-30',
  dueDate: '2026-10-28', // Standard ATO quarterly BAS due date
  status: 'REVIEW',
  g1TotalSales: 32640.00,
  g2ExportSales: 5821.20, // OnlyFans / global fan payments can be GST-free exports if non-AU residents
  g3OtherGSTFree: 0,
  g10CapitalPurchases: 5299.00, // Sony FX3 camera
  g11NonCapitalPurchases: 1822.99,
  gst1aSalesGst: 1704.55, // GST collected on Australian brand deals & local sales
  gst1bPurchaseGstCredits: 642.52, // GST paid on equipment, software, studio
  netGstPayable: 1062.03, // 1A minus 1B
  w1TotalWages: 0,
  w2WithheldAmount: 0,
  accountantNotes: 'Draft workpapers calculated. Please confirm export status of US/EU Patreon & OF gross receipts before final signoff.'
};

export const INITIAL_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc-001',
    title: 'ABR ABN Registration Certificate',
    category: 'registration',
    filename: 'ABR-ABN-Confirmation-51824753556.pdf',
    fileSize: '412 KB',
    uploadDate: '2023-08-16',
    retentionUntil: '2030-08-16', // 7 years corporate
    isSensitiveVault: false
  },
  {
    id: 'doc-002',
    title: 'ASIC Certificate of Registration - Kira Media Pty Ltd',
    category: 'asic',
    filename: 'ASIC-Certificate-ACN648192381.pdf',
    fileSize: '890 KB',
    uploadDate: '2023-08-15',
    retentionUntil: '2033-08-15',
    isSensitiveVault: false
  },
  {
    id: 'doc-003',
    title: 'Gymshark Vital Seamless Campaign Agreement 2026',
    category: 'contract',
    filename: 'Gymshark-Talent-Contract-Executed.pdf',
    fileSize: '1.4 MB',
    uploadDate: '2026-09-20',
    retentionUntil: '2031-09-20',
    isSensitiveVault: true // In sensitive vault
  },
  {
    id: 'doc-004',
    title: 'DigiDirect Sony FX3 Tax Invoice INV88291',
    category: 'receipt',
    filename: 'DigiDirect-SonyFX3-TaxInvoice.pdf',
    fileSize: '320 KB',
    uploadDate: '2026-09-10',
    retentionUntil: '2031-09-10', // 5 years ATO rule
    isSensitiveVault: false,
    linkedTransactionId: 'exp-501'
  }
];

export const INITIAL_OBLIGATIONS: ObligationItem[] = [
  {
    id: 'ob-abr-01',
    authority: 'ABR',
    title: 'ABN Details & 28-Day Update Rule',
    status: 'READY',
    summary: 'ABN is verified and active. Registered address verified 10 days ago.',
    whyExplanation: 'The ABR requires all ABN holders to notify changes to business details within 28 days of becoming aware of the change.',
    authorityReference: 'ABR Important Facts - 28-day update obligation',
    dataTrigger: 'ABN verified active with current postal and physical addresses.',
    actionRequired: 'No immediate action required. Check if registered address or main activities change.'
  },
  {
    id: 'ob-ato-gst',
    authority: 'ATO',
    title: 'GST Threshold & Registration Status',
    status: 'READY',
    summary: 'Active GST registration. Current 12-month turnover is $89,450 (above $75,000 threshold).',
    whyExplanation: 'The ATO requires entities with GST turnover of $75,000 or more to be registered for GST and charge GST on taxable supplies.',
    authorityReference: 'ATO QC 22412 - Registering for GST',
    dataTrigger: 'Entity crossed $75k threshold in March 2024 and completed registration.',
    actionRequired: 'Issue compliant Tax Invoices (with ABN, items, and GST breakdown) and prepare quarterly BAS.'
  },
  {
    id: 'ob-ato-bas',
    authority: 'ATO',
    title: 'Quarterly BAS Q1 2026-2027',
    status: 'APPROACHING',
    summary: 'Due in 36 days (28 October 2026). Net GST payable estimated at $1,062.03.',
    whyExplanation: 'Quarterly activity statements must be lodged and paid by the 28th day of the month following the quarter end.',
    authorityReference: 'ATO BAS Due Dates - Quarter 1 (Jul-Sep)',
    dataTrigger: 'Period ending 30 September 2026.',
    actionRequired: 'Complete reconciliation of September expenses and share workpapers with your accountant.',
    dueDate: '2026-10-28',
    daysRemaining: 36
  },
  {
    id: 'ob-asic-annual',
    authority: 'ASIC',
    title: 'ASIC Annual Company Review & Solvency Resolution',
    status: 'APPROACHING',
    summary: 'Annual review fee ($321) & solvency minute due 15 November 2026.',
    whyExplanation: 'Proprietary companies receive an annual statement from ASIC shortly after the company anniversary date. Directors must review details, pay the fee, and pass a solvency resolution within 2 months.',
    authorityReference: 'Corporations Act 2001 s 346C & s 347A',
    dataTrigger: 'Company incorporated 15 August.',
    actionRequired: 'Confirm registered office, shareholder register, and record written solvency minute in Document Vault.',
    dueDate: '2026-11-15',
    daysRemaining: 54
  },
  {
    id: 'ob-workforce',
    authority: 'WORKFORCE',
    title: 'Worker Classification & 12% Super Guarantee',
    status: 'REVIEW_REQUIRED',
    summary: '2 contractors engaged this quarter. Check labour-only contracts for Super Guarantee.',
    whyExplanation: 'Under ATO Superannuation Guarantee (Administration) Act 1992 s 12(3), individuals engaged under a contract that is wholly or principally for labour are considered employees for super purposes, attracting the 12% rate (effective 1 July 2025).',
    authorityReference: 'ATO Super Guarantee for Contractors & QC 22412',
    dataTrigger: 'Payments made to videographer and makeup artist.',
    actionRequired: 'Run Worker Classification tool to verify if superannuation contributions are required.'
  },
  {
    id: 'ob-docs-evidence',
    authority: 'DOCUMENTS',
    title: 'ATO 5-Year Record Keeping & Missing Receipts',
    status: 'ACTION_REQUIRED',
    summary: '2 expense transactions missing attached receipt images.',
    whyExplanation: 'The ATO requires written evidence (tax invoice or detailed receipt) for business deductions over $10. Records must be kept for a minimum of 5 years.',
    authorityReference: 'ATO Record Keeping Rules for Business',
    dataTrigger: 'Zara styling purchase ($320) & Qantas flight ($480) lack uploaded PDF/image vouchers.',
    actionRequired: 'Upload receipts to clear audit flags.'
  }
];

export const INITIAL_AUDIT_TRAIL: AuditEvent[] = [
  {
    id: 'aud-001',
    timestamp: '2026-09-22T08:15:22Z',
    action: 'BANK_ACCOUNT_SYNC',
    objectType: 'BankAccount',
    objectId: 'bnk-01',
    description: 'Up Bank direct feed synchronized. 1 new transaction imported.',
    hash: 'e89a3f29b4c09d81'
  },
  {
    id: 'aud-002',
    timestamp: '2026-09-21T08:45:00Z',
    action: 'INVOICE_CREATED',
    objectType: 'Invoice',
    objectId: 'inv-2026-003',
    description: 'Generated Tax Invoice INV-2026-000003 for Gymshark AU ($7,850.00 AUD incl GST).',
    hash: '7c4b12f638d990a2'
  },
  {
    id: 'aud-003',
    timestamp: '2026-09-17T11:05:00Z',
    action: 'JOURNAL_POSTED',
    objectType: 'JournalEntry',
    objectId: 'jnl-003',
    description: 'Posted balanced double-entry breakdown for OnlyFans payout #pay-001 ($8,400 gross / $5,821.20 net).',
    hash: '5a1e809b43c682fe'
  },
  {
    id: 'aud-004',
    timestamp: '2026-09-12T09:30:00Z',
    action: 'ABN_VERIFIED',
    objectType: 'BusinessIdentity',
    objectId: '51 824 753 556',
    description: 'ABN verified against ABR public record. Entity: KIRA MEDIA PTY LTD. Active.',
    hash: '992b8d4c11fa0721'
  }
];

// Aliases for cleaner consumer imports
export const SEED_BUSINESS = INITIAL_BUSINESS_IDENTITY;
export const SEED_CREATOR = INITIAL_CREATOR_PROFILE;
export const SEED_TAX_PROFILE = INITIAL_TAX_PROFILE;
export const SEED_OPERATING_PROFILE = INITIAL_OPERATING_PROFILE;
export const SEED_CLIENTS = INITIAL_CLIENTS;
export const SEED_BOOKINGS = INITIAL_BOOKINGS;
export const SEED_QUOTES = INITIAL_QUOTES;
export const SEED_INVOICES = INITIAL_INVOICES;
export const SEED_PRODUCTS = INITIAL_PRODUCTS;
export const SEED_ORDERS = INITIAL_ORDERS;
export const SEED_PLATFORM_PAYOUTS = INITIAL_PLATFORM_PAYOUTS;
export const SEED_EXPENSES = INITIAL_EXPENSES;
export const SEED_BANK_ACCOUNTS = INITIAL_BANK_ACCOUNTS;
export const SEED_BANK_TRANSACTIONS = INITIAL_BANK_TRANSACTIONS;
export const SEED_JOURNAL_ENTRIES = INITIAL_JOURNAL_ENTRIES;
export const SEED_BAS_PERIOD = INITIAL_BAS_PERIOD;
export const SEED_OBLIGATIONS = INITIAL_OBLIGATIONS;
export const SEED_AUDIT_TRAIL = INITIAL_AUDIT_TRAIL;
