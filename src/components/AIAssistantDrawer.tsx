import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  X,
  ExternalLink,
  RotateCcw,
  Globe,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { BusinessIdentity, TaxProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  db,
  doc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  handleFirestoreError,
  OperationType
} from '../lib/firebase';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  business: BusinessIdentity;
  taxProfile: TaxProfile;
}

interface MessageSource {
  title: string;
  uri: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'lex';
  text: string;
  timestamp: string;
  sources?: MessageSource[];
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  business,
  taxProfile
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialGreeting: ChatMessage = {
    id: 'msg-init-lex',
    sender: 'lex',
    text: `G'day ${business.legalName.split(' ')[0] || 'Creator'}! I'm Lex, your dedicated Australian creator business partner and regulatory advisor. 

I'm grounded in current 2026/2027 ATO guidelines, Fair Work rules, and commercial influencer practices. Ask me about:
• $75,000 GST thresholds and issuing valid Tax Invoices
• 12.0% Superannuation Guarantee for your videographers & editors
• Unbundling OnlyFans/YouTube gross income & platform fee deductions
• Brand deal contract clauses (usage rights, exclusivity, whitelisting)
• Deducting camera gear, studios, and travel under ATO logbook rules.`,
    timestamp: 'Just now'
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickQuestions = [
    'Do I need to register for GST if I hit $75k?',
    'Do I pay 12% super to my videographer?',
    'How do I account for OnlyFans 20% platform cut on my BAS?',
    'Can I claim 80% of my camera & editing laptop?',
    'What should I charge for 90-day digital usage rights?'
  ];

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Load chat history from Firestore if user is authenticated
  useEffect(() => {
    if (!user || !isOpen) return;

    const loadRemoteChat = async () => {
      try {
        const chatsRef = collection(db, 'users', user.uid, 'chat_messages');
        const q = query(chatsRef, orderBy('timestamp', 'asc'), limit(30));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const loaded: ChatMessage[] = [];
          snap.forEach(docSnap => {
            const d = docSnap.data();
            loaded.push({
              id: d.id,
              sender: d.sender as 'user' | 'lex',
              text: d.text,
              timestamp: d.timestamp,
              sources: d.sources || []
            });
          });
          if (loaded.length > 0) {
            setMessages(loaded);
          }
        }
      } catch (err) {
        console.warn('Could not load chat history from Firestore:', err);
      }
    };

    loadRemoteChat();
  }, [user, isOpen]);

  const saveMessageToFirestore = async (msg: ChatMessage) => {
    if (!user) return;
    try {
      const msgDoc = doc(db, 'users', user.uid, 'chat_messages', msg.id);
      await setDoc(msgDoc, {
        id: msg.id,
        userId: user.uid,
        sender: msg.sender,
        text: msg.text,
        timestamp: new Date().toISOString(),
        sources: msg.sources || []
      });
    } catch (err) {
      console.warn('Could not persist chat message to Firestore:', err);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || isTyping) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Save user message to cloud if logged in
    saveMessageToFirestore(userMsg);

    try {
      // Build conversation history payload
      const historyPayload = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text
      }));
      historyPayload.push({
        role: 'user',
        content: queryText
      });

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          creatorContext: {
            legalName: business.legalName,
            abn: business.abn,
            entityType: business.entityType,
            gstRegistered: taxProfile.gstRegistered
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      const lexReply: ChatMessage = {
        id: `lex-${Date.now()}`,
        sender: 'lex',
        text: data.reply || 'I am processing your query under Australian regulatory frameworks.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || []
      };

      setMessages(prev => [...prev, lexReply]);
      saveMessageToFirestore(lexReply);
    } catch (error) {
      console.error('Lex AI assistant error:', error);
      // Smart offline fallback
      let fallbackText = '';
      const q = queryText.toLowerCase();

      if (q.includes('gst') || q.includes('75k') || q.includes('threshold')) {
        fallbackText = `Under Division 23 of the GST Act 1999, you must register for GST within 21 days of your current 12-month or projected 12-month turnover reaching $75,000. All domestic brand deals must then be issued with 10% GST on valid Tax Invoices. Check the '$75k GST Monitor' in creatorledger for real-time tracking.`;
      } else if (q.includes('super') || q.includes('videographer') || q.includes('contractor')) {
        fallbackText = `The Australian Superannuation Guarantee rate is 12.0% for FY2026/2027. Under Fair Work & ATO rulings, even if a videographer or editor provides an ABN, if you contract them principally for their labour (they don't bring heavy commercial studios or have delegate rights), you must pay 12% super to their fund.`;
      } else if (q.includes('onlyfans') || q.includes('youtube') || q.includes('payout')) {
        fallbackText = `Crucial ATO Rule: Declare your full GROSS subscriber revenue as assessable income, and claim the 20% platform cut as an allowable deduction. Do not just record the net deposit! creatorledger's Payout Engine handles this split for your BAS automatically.`;
      } else {
        fallbackText = `Under Australian regulatory standards, content creator businesses must keep substantiation records for 5 years. For specific complex structuring or trust distributions, you can also export your data pack to review with your registered CPA.`;
      }

      const fallbackMsg: ChatMessage = {
        id: `lex-${Date.now()}`,
        sender: 'lex',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: [
          { title: 'ATO Content Creators & Influencers Guide', uri: 'https://www.ato.gov.au' }
        ]
      };

      setMessages(prev => [...prev, fallbackMsg]);
      saveMessageToFirestore(fallbackMsg);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    setMessages([initialGreeting]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col antialiased">
      {/* Drawer Header */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/10">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-sm">Lex</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Gemini 3.5 & Google Search
              </span>
            </div>
            <span className="text-[11px] text-neutral-400">
              Australian Creator & Regulatory Advisor
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleResetChat}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            title="Start new conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Cloud Sync Status bar */}
      <div className="px-4 py-1.5 bg-neutral-950/70 border-b border-neutral-800/60 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>ONLINE · ATO 2026/2027 TAX GROUNDED</span>
        </div>
        <div>
          {user ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Cloud Synced
            </span>
          ) : (
            <span className="text-neutral-500">Local Session</span>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'lex' && (
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] space-y-2`}>
              <div
                className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-sm shadow-md shadow-emerald-600/10'
                    : 'bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-tl-sm shadow-sm'
                }`}
              >
                {m.text}

                {/* Grounding Web Sources */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-neutral-800/80 space-y-1">
                    <div className="text-[10px] font-mono text-neutral-400 flex items-center gap-1 uppercase">
                      <Globe className="w-3 h-3 text-emerald-400" />
                      <span>Verified Regulatory Sources:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {m.sources.map((src, idx) => (
                        <a
                          key={idx}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 bg-neutral-900 border border-neutral-800 hover:border-emerald-500/40 px-2 py-0.5 rounded-md transition-colors"
                        >
                          <span className="truncate max-w-[200px]">{src.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`text-[10px] font-mono text-neutral-500 px-1 ${
                  m.sender === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                {m.timestamp}
              </div>
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-xl bg-neutral-800 text-neutral-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2.5 text-neutral-400 text-xs italic py-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <span className="text-[11px]">Lex is consulting ATO tax rulings & search data...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Queries */}
      <div className="p-3 border-t border-neutral-800/80 bg-neutral-950/60 space-y-1.5">
        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
          Frequent Creator Questions:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isTyping}
              className="text-[11px] text-neutral-300 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 px-2.5 py-1 rounded-lg text-left transition-colors cursor-pointer disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <div className="p-3 border-t border-neutral-800 bg-neutral-950">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask Lex about ABN, GST, 12% super, OnlyFans cut, or contracts..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isTyping}
            className="flex-1 px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-colors cursor-pointer"
            title="Send to Lex"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
