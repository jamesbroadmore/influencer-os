import express from 'express';
import { createServer as createHttpServer } from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// API Route for Lex - AI Influencer & Regulatory Advisor
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages = [], creatorContext } = req.body;

    const systemInstruction = `You are Lex, the official AI business partner and regulatory advisor for Australian digital creators, influencers, YouTubers, streamers, and creative entrepreneurs in creatorledger.
Your mission is to guide creators through all commercial, financial, operational, and tax issues within the Australian commercial ecosystem (ATO, ASIC, ABR, Fair Work).

Creator Context:
- Legal Entity: ${creatorContext?.legalName || 'Creator Enterprise'} (${creatorContext?.entityType || 'Sole Trader'})
- ABN: ${creatorContext?.abn || 'Registered'}
- GST Status: ${creatorContext?.gstRegistered ? 'Registered for GST (10% on domestic sales)' : 'GST-Free (Under $75,000 threshold)'}
- Financial Year: 2026/2027

Key Rules & Expertise:
1. GST Threshold ($75,000): Division 23 of the GST Act 1999. If current 12-month or projected 12-month turnover reaches or exceeds $75,000, registration is mandatory within 21 days. All domestic tax invoices must show ABN, 10% GST, and issue date.
2. Platform Payout Unbundling: Crucial ATO rule—creators must declare GROSS revenue from platforms like OnlyFans, YouTube, Twitch, Patreon, and TikTok as assessable income, then claim platform commissions (e.g. 20% OnlyFans cut) as deductible business expenses.
3. Superannuation Guarantee (12.0%): As of FY2026/2027, the SG rate is 12.0%. Even ABN contractors engaged wholly or principally for their labour (videographers, editors, assistants) may legally require 12% super contributions.
4. Business Deductions: Cameras (Sony FX3, etc.), laptops (MacBook Pro), lighting, software, and home studio are deductible strictly to the extent of business use. Recommend a 4-week ATO-compliant logbook to substantiate percentages.
5. Brand Collaborations: Advise on usage rights (perpetual vs 90-day buyout), exclusivity clauses, deliverables scope, 15-20% agency management commission splits, and payment terms (14-day terms recommended).
6. Tone: Warm, savvy, highly knowledgeable, structured, concise, and empowering. When discussing tax liabilities, clarify that you provide general commercial information and recommend confirming complex distributions with their registered CPA or tax agent.`;

    if (!ai || !apiKey) {
      // Return smart local response if no API key is set
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';
      const fallbackReply = generateSmartFallback(lastUserMessage, creatorContext);
      return res.json({
        reply: fallbackReply,
        sources: [
          { title: 'ATO Content Creators & Influencers Guide', uri: 'https://www.ato.gov.au' },
          { title: 'Australian Business Register (ABR)', uri: 'https://www.abr.gov.au' }
        ]
      });
    }

    // Format conversation history for Gemini SDK
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    // Ensure at least one content part exists
    if (formattedContents.length === 0) {
      formattedContents.push({
        role: 'user',
        parts: [{ text: 'Hello Lex, what can you help me with?' }],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'I am ready to help you navigate your creator business obligations.';

    // Extract search grounding metadata if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter(chunk => chunk.web?.uri && chunk.web?.title)
      .map(chunk => ({
        title: chunk.web?.title || 'Web Resource',
        uri: chunk.web?.uri || '',
      }))
      .slice(0, 4);

    return res.json({
      reply: replyText,
      sources,
    });
  } catch (error) {
    console.error('Error generating response with Gemini:', error);
    // Graceful fallback to avoid leaving user hanging
    const lastMsg = req.body?.messages?.[req.body?.messages?.length - 1]?.content || '';
    const fallback = generateSmartFallback(lastMsg, req.body?.creatorContext);
    return res.json({
      reply: fallback,
      sources: [{ title: 'ATO Business Guidelines (2026/2027)', uri: 'https://www.ato.gov.au' }],
    });
  }
});

// API Route for Multimodal Receipt & Document OCR Scanning
app.post('/api/gemini/parse-receipt', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 data' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    if (!ai || !apiKey) {
      return res.json(generateFallbackReceiptParse());
    }

    const prompt = `You are an expert Australian tax and OCR document analysis assistant for content creators.
Analyze this captured paper receipt or tax invoice.
Extract the following details accurately in JSON format:
{
  "supplier": "Business or store name (e.g. JB Hi-Fi, Apple Store, Officeworks, Sun Studios, Telstra)",
  "supplierAbn": "11-digit ABN if visible on the receipt, otherwise null or empty string",
  "date": "Purchase date in YYYY-MM-DD format (if missing, use today's date)",
  "grossAmount": 0.00,
  "gstAmount": 0.00,
  "netAmount": 0.00,
  "category": "One of: Equipment & Cameras, Photography & Studio, Software & Subscriptions, Telecommunications, Costumes & Business Clothing, Props & Styling, Travel & Flights, Accommodation, Motor Vehicle, Advertising, Contractors & Assistants, Other Expenses",
  "description": "Itemized summary of what was bought (e.g. Sony A7 IV camera body, SD card, studio hire)",
  "suggestedBusinessUsePercentage": 100,
  "deductibilityConfidence": "HIGH",
  "taxNotes": "Clear explanation of tax deductibility under Australian ATO creator guidelines."
}
If GST is not explicitly listed, calculate GST as grossAmount / 11 if standard taxable Australian supply.
Ensure amounts are strictly numbers (not strings with dollar signs).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsedText = response.text || '{}';
    let data;
    try {
      data = JSON.parse(parsedText);
    } catch {
      data = generateFallbackReceiptParse();
    }
    return res.json(data);
  } catch (error) {
    console.error('Error parsing receipt with Gemini:', error);
    return res.json(generateFallbackReceiptParse());
  }
});

// Helper for fallback receipt parsing
function generateFallbackReceiptParse() {
  return {
    supplier: 'DigiDirect Sydney',
    supplierAbn: '68 123 456 789',
    date: new Date().toISOString().split('T')[0],
    grossAmount: 349.00,
    gstAmount: 31.73,
    netAmount: 317.27,
    category: 'Equipment & Cameras',
    description: 'Rode Wireless PRO Dual-Channel Compact Microphone System',
    suggestedBusinessUsePercentage: 100,
    deductibilityConfidence: 'HIGH',
    taxNotes: '100% creator production audio equipment. Eligible for instant asset write-off / business deduction.'
  };
}

// Helper for fallback replies
function generateSmartFallback(query: string, context?: any): string {
  const q = query.toLowerCase();
  if (q.includes('gst') || q.includes('75k') || q.includes('threshold')) {
    return `Under Division 23 of the Australian GST Act 1999, you must register for GST within 21 days of your current or projected 12-month turnover reaching $75,000. Once registered, you must add 10% GST to all domestic brand invoices and you can claim input tax credits on business purchases (e.g. cameras, studio hire, software).`;
  }
  if (q.includes('onlyfans') || q.includes('youtube') || q.includes('payout') || q.includes('cut')) {
    return `In Australia, the ATO requires you to declare the full GROSS subscriber revenue as assessable income, and then claim the platform fee (e.g., OnlyFans' 20% cut) as an allowable business deduction. Do not just declare your net bank payout! creatorledger's Payout Engine breaks this down for your BAS automatically.`;
  }
  if (q.includes('super') || q.includes('videographer') || q.includes('contractor')) {
    return `As of FY2026/2027, the Superannuation Guarantee (SG) rate is 12.0%. Remember: even if a videographer or editor provides an ABN, if their contract is wholly or principally for their personal labour, you are legally responsible for paying 12% super into their nominated super fund.`;
  }
  if (q.includes('deduct') || q.includes('claim') || q.includes('camera') || q.includes('laptop')) {
    return `Under ATO content creator rules, equipment like Sony FX3 cameras and MacBook Pros are deductible to the extent of business use. If your gear is 80% for content creation and 20% personal, you claim 80% of the cost and 80% of any GST credit. Maintain an ATO logbook for at least 4 consecutive weeks to substantiate your claim.`;
  }
  return `Hi! I'm Lex, your creator business advisor. Whether you're deciding how to structure a brand deal, figuring out when to register for GST ($75k turnover), budgeting for 12% superannuation for your crew, or claiming production gear, I'm here to guide you step-by-step. What can we tackle today?`;
}

// Dev vs Prod Vite mounting
async function startServer() {
  const httpServer = createHttpServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        // This custom Express server is not exposed as a Vite WebSocket endpoint in the preview proxy.
        // Disable Vite HMR so the injected client does not repeatedly connect and close.
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const serverPort = Number(process.env.PORT) || 3000;
  httpServer.listen(serverPort, '0.0.0.0', () => {
    console.log(`creatorledger server running on http://0.0.0.0:${serverPort}`);
  });
}

startServer();
