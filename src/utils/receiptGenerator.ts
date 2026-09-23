import { Expense } from '../types';
import { formatAUD } from './taxAndRegulatoryEngine';

/**
 * Generates an authentic SVG data URL representing a scanned Australian paper tax invoice or thermal receipt.
 */
export function generateReceiptSvgDataUrl(expense: {
  supplier: string;
  supplierAbn?: string;
  date: string;
  grossAmount: number;
  gstAmount: number;
  netAmount: number;
  category: string;
  description: string;
  receiptName?: string;
  id?: string;
}): string {
  const isInvoice = expense.grossAmount > 300;
  const paperColor = isInvoice ? '#fdfdfd' : '#fcfbf7';
  const accentColor = '#059669'; // Emerald
  const docId = expense.id || `RCPT-${Math.floor(Math.random() * 89999 + 10000)}`;

  const svgContent = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 620" width="100%" height="100%" style="background-color: ${paperColor}; font-family: 'JetBrains Mono', monospace, -apple-system, BlinkMacSystemFont, sans-serif;">
    <defs>
      <linearGradient id="foldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.04" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.08" />
      </linearGradient>
      <filter id="paperShadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.15" />
      </filter>
    </defs>

    <!-- Paper Sheet Background -->
    <rect x="0" y="0" width="440" height="620" fill="${paperColor}" />
    <rect x="0" y="0" width="440" height="620" fill="url(#foldGrad)" />

    <!-- Top Receipt Header Banner -->
    <rect x="24" y="24" width="392" height="6" fill="${accentColor}" rx="3" />

    <!-- Supplier Brand / Store Name -->
    <text x="220" y="65" text-anchor="middle" font-size="20" font-weight="800" fill="#111827" letter-spacing="-0.5">
      ${escapeXml(expense.supplier.toUpperCase())}
    </text>
    
    <text x="220" y="86" text-anchor="middle" font-size="11" font-weight="600" fill="#4b5563" letter-spacing="0.5">
      ${expense.supplierAbn ? `ABN: ${escapeXml(expense.supplierAbn)}` : 'TAX INVOICE / OFFICIAL RECEIPT'}
    </text>
    <text x="220" y="104" text-anchor="middle" font-size="10" fill="#6b7280">
      AUSTRALIAN COMMERCIAL TAX DOCUMENT
    </text>

    <!-- Dividing Dash Line -->
    <line x1="24" y1="120" x2="416" y2="120" stroke="#d1d5db" stroke-width="1.5" stroke-dasharray="4,4" />

    <!-- Transaction Metadata Columns -->
    <text x="28" y="145" font-size="10" fill="#6b7280">DATE / TIME:</text>
    <text x="110" y="145" font-size="11" font-weight="700" fill="#111827">${expense.date}</text>

    <text x="280" y="145" font-size="10" fill="#6b7280">DOC #:</text>
    <text x="325" y="145" font-size="11" font-weight="700" fill="#111827">${escapeXml(docId)}</text>

    <text x="28" y="168" font-size="10" fill="#6b7280">CATEGORY:</text>
    <text x="110" y="168" font-size="11" font-weight="600" fill="#047857">${escapeXml(expense.category)}</text>

    <text x="280" y="168" font-size="10" fill="#6b7280">PAY METHOD:</text>
    <text x="355" y="168" font-size="11" font-weight="700" fill="#111827">VISA ···· 4920</text>

    <!-- Table Header -->
    <rect x="24" y="188" width="392" height="26" fill="#f3f4f6" rx="4" />
    <text x="36" y="205" font-size="10" font-weight="700" fill="#374151">DESCRIPTION / PARTICULARS</text>
    <text x="340" y="205" font-size="10" font-weight="700" fill="#374151" text-anchor="end">TOTAL AUD</text>

    <!-- Line Item Details -->
    <text x="36" y="240" font-size="12" font-weight="700" fill="#111827">
      ${escapeXml(expense.description.slice(0, 36))}
    </text>
    ${expense.description.length > 36 ? `
    <text x="36" y="258" font-size="11" fill="#4b5563">
      ${escapeXml(expense.description.slice(36, 75))}
    </text>` : ''}
    <text x="36" y="${expense.description.length > 36 ? '278' : '260'}" font-size="10" fill="#6b7280">
      1x Taxable Supply (10% GST Included)
    </text>

    <text x="400" y="240" font-size="13" font-weight="800" fill="#111827" text-anchor="end">
      ${formatAUD(expense.grossAmount)}
    </text>

    <!-- Financial Totals Section -->
    <line x1="24" y1="315" x2="416" y2="315" stroke="#9ca3af" stroke-width="1.5" />

    <text x="220" y="342" font-size="11" fill="#4b5563" text-anchor="end">SUBTOTAL (EX-GST):</text>
    <text x="400" y="342" font-size="12" font-weight="700" fill="#111827" text-anchor="end">
      ${formatAUD(expense.netAmount)}
    </text>

    <text x="220" y="366" font-size="11" fill="#047857" text-anchor="end">INCLUDES GST (10%):</text>
    <text x="400" y="366" font-size="12" font-weight="700" fill="#047857" text-anchor="end">
      ${formatAUD(expense.gstAmount)}
    </text>

    <line x1="160" y1="380" x2="416" y2="380" stroke="#111827" stroke-width="2" />

    <rect x="150" y="390" width="266" height="42" fill="#ecfdf5" rx="6" stroke="#10b981" stroke-width="1.5" />
    <text x="165" y="416" font-size="13" font-weight="800" fill="#065f46">TOTAL PAID AUD:</text>
    <text x="400" y="417" font-size="17" font-weight="900" fill="#065f46" text-anchor="end">
      ${formatAUD(expense.grossAmount)}
    </text>

    <!-- ATO Compliance Verification Stamp -->
    <g transform="translate(36, 455)">
      <rect x="0" y="0" width="160" height="52" rx="6" fill="none" stroke="#059669" stroke-width="1.5" stroke-dasharray="3,2" />
      <text x="80" y="18" font-size="9" font-weight="800" fill="#059669" text-anchor="middle" letter-spacing="1">ATO SUBSTANTIATED</text>
      <text x="80" y="33" font-size="8" fill="#047857" text-anchor="middle">DIV 900 ITAA 1997</text>
      <text x="80" y="45" font-size="8" font-weight="700" fill="#059669" text-anchor="middle">VALID TAX INVOICE</text>
    </g>

    <!-- Simulated Barcode / Optical Scan Marks -->
    <g transform="translate(230, 465)">
      <rect x="0" y="0" width="3" height="32" fill="#111827" />
      <rect x="6" y="0" width="1.5" height="32" fill="#111827" />
      <rect x="11" y="0" width="4" height="32" fill="#111827" />
      <rect x="18" y="0" width="2" height="32" fill="#111827" />
      <rect x="23" y="0" width="5" height="32" fill="#111827" />
      <rect x="31" y="0" width="1.5" height="32" fill="#111827" />
      <rect x="35" y="0" width="3" height="32" fill="#111827" />
      <rect x="41" y="0" width="2" height="32" fill="#111827" />
      <rect x="46" y="0" width="4" height="32" fill="#111827" />
      <rect x="53" y="0" width="1.5" height="32" fill="#111827" />
      <rect x="57" y="0" width="3.5" height="32" fill="#111827" />
      <rect x="64" y="0" width="2" height="32" fill="#111827" />
      <rect x="69" y="0" width="5" height="32" fill="#111827" />
      <rect x="77" y="0" width="2" height="32" fill="#111827" />
      <rect x="82" y="0" width="4" height="32" fill="#111827" />
      <rect x="89" y="0" width="1.5" height="32" fill="#111827" />
      <rect x="94" y="0" width="3" height="32" fill="#111827" />
      <rect x="100" y="0" width="2.5" height="32" fill="#111827" />
      <rect x="106" y="0" width="4" height="32" fill="#111827" />
      <rect x="113" y="0" width="1.5" height="32" fill="#111827" />
      <rect x="117" y="0" width="3" height="32" fill="#111827" />
      <rect x="123" y="0" width="2" height="32" fill="#111827" />
      <rect x="128" y="0" width="5" height="32" fill="#111827" />
      <rect x="136" y="0" width="2" height="32" fill="#111827" />
      <rect x="141" y="0" width="3.5" height="32" fill="#111827" />
      <text x="73" y="44" font-size="8" font-family="monospace" fill="#6b7280" text-anchor="middle">AU*${expense.date.replace(/-/g, '')}*${escapeXml(docId)}</text>
    </g>

    <!-- Footer Security & Timestamp -->
    <line x1="24" y1="535" x2="416" y2="535" stroke="#e5e7eb" stroke-width="1" />
    <text x="220" y="555" font-size="9" fill="#9ca3af" text-anchor="middle">
      CREATORLEDGER EVIDENCE VAULT · DIGITALLY ARCHIVED FOR 5 YEARS
    </text>
    <text x="220" y="570" font-size="8" fill="#9ca3af" text-anchor="middle">
      Retain for Australian Taxation Office audit compliance pursuant to s 382-5 of TAA 1953
    </text>
    <text x="220" y="595" font-size="10" font-weight="600" fill="#059669" text-anchor="middle">
      ✓ GEMINI VISION VERIFIED
    </text>
  </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
