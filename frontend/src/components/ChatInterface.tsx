import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, Chart, SourceReference } from '../types';
import { api } from '../services/api';
import { 
  Send, Sparkles, User as UserIcon, BookOpen, 
  AlertCircle, ShieldAlert, ChevronDown, ChevronUp, Compass, Loader2
} from 'lucide-react';

interface ChatInterfaceProps {
  conversation: Conversation;
  activeChart: Chart | null;
  onMessageSent: (newMsg: Message) => void;
  language: 'en' | 'hi';
  onLanguageChange: (lang: 'en' | 'hi') => void;
  onNavigateToKundli: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversation,
  activeChart,
  onMessageSent,
  language,
  onLanguageChange,
  onNavigateToKundli
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, isSending]);

  const toggleSource = (msgId: string) => {
    setExpandedSources(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isSending) return;

    setInputText('');
    setErrorMsg(null);
    setIsSending(true);

    try {
      const assistantReply = await api.sendMessage(conversation.id, query, language);
      onMessageSent(assistantReply);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to get astrological response. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestions = activeChart && activeChart.is_confirmed ? (
    language === 'hi' ? [
      "💼 मेरी नौकरी और करियर के बारे में बताएं",
      "💍 मेरी कुंडली के अनुसार विवाह और जीवनसाथी कैसा होगा?",
      "💰 मेरी कुंडली में धन और आर्थिक स्थिति कैसी है?",
      "🌟 मेरे लग्न और स्वभाव की मुख्य विशेषताएं क्या हैं?"
    ] : [
      "💼 Tell me about my job & career prospects (10th house)",
      "💍 What does my chart say about my marriage & spouse (7th house)?",
      "💰 What are the wealth and financial indicators in my chart?",
      "🌟 What are the primary strengths and qualities of my Lagna?"
    ]
  ) : (
    language === 'hi' ? [
      "वैदिक ज्योतिष और पाश्चात्य ज्योतिष में क्या अंतर है?",
      "कुंडली के 12 भाव जीवन के किन क्षेत्रों को दर्शाते हैं?",
      "विंशोत्तरी दशा क्या होती है और यह कैसे काम करती है?",
      "नवग्रहों में गुरु और शनि का क्या महत्व है?"
    ] : [
      "What is the difference between Vedic (Sidereal) and Western astrology?",
      "Explain the 12 Bhavas and their life domains",
      "How does the Vimshottari Dasha planetary timing cycle work?",
      "What do Jupiter and Saturn signify in a Vedic chart?"
    ]
  );

  return (
    <div className="flex flex-col h-full bg-ivory-50 rounded-2xl border border-ivory-300 shadow-vedic overflow-hidden">
      {/* Top Banner: Chart context & Language indicator */}
      <div className="px-5 py-3.5 bg-ivory-200/90 border-b border-ivory-300 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-vedic-800 flex items-center justify-center text-gold-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-vedic font-bold text-sm text-vedic-950">
              {conversation.title || 'Vedic Astrology Consultation'}
            </h3>
            <div className="flex items-center space-x-2 text-[11px] text-stone-600">
              {activeChart ? (
                activeChart.is_confirmed ? (
                  <span className="flex items-center space-x-1 text-emerald-800 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>Active Chart: {activeChart.ascendant_sign || 'Aries'} Lagna (Verified)</span>
                  </span>
                ) : (
                  <button
                    onClick={onNavigateToKundli}
                    className="flex items-center space-x-1 text-amber-800 font-medium hover:underline"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                    <span>Chart Uploaded (Requires Confirmation)</span>
                  </button>
                )
              ) : (
                <button
                  onClick={onNavigateToKundli}
                  className="flex items-center space-x-1 text-gold-700 font-medium hover:underline"
                >
                  <Compass className="w-3 h-3" />
                  <span>Upload Kundli for personalized chart readings</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Language switch chip */}
        <div className="flex items-center space-x-1 bg-ivory-100 p-0.5 rounded-lg border border-ivory-300 text-xs">
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
              language === 'en' ? 'bg-vedic-800 text-gold-300 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            English
          </button>
          <button
            onClick={() => onLanguageChange('hi')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
              language === 'hi' ? 'bg-vedic-800 text-gold-300 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {conversation.messages.length === 0 && (
          <div className="py-12 text-center text-stone-500 space-y-2">
            <Sparkles className="w-8 h-8 mx-auto text-gold-500" />
            <p className="font-vedic font-bold text-stone-700">Begin Your Astrological Inquiry</p>
            <p className="text-xs max-w-sm mx-auto">
              Ask about your chart placements, planetary periods, or general Vedic concepts below.
            </p>
          </div>
        )}

        {conversation.messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const hasSources = msg.sources && msg.sources.length > 0;
          const isSourcesOpen = !!expandedSources[msg.id];

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                  isUser
                    ? 'bg-gold-500 text-vedic-950 shadow-sm'
                    : 'bg-vedic-800 text-gold-300 border border-gold-500/40 shadow-sm'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-gold-400" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-vedic-800 text-ivory-50 rounded-tr-none'
                    : 'bg-ivory-100 border border-ivory-300 text-stone-800 rounded-tl-none'
                }`}
              >
                {/* Content formatted */}
                <div className="whitespace-pre-wrap space-y-2">
                  {msg.content}
                </div>

                {/* RAG Reference Sources Dropdown */}
                {hasSources && (
                  <div className="mt-3 pt-2.5 border-t border-ivory-200/60">
                    <button
                      onClick={() => toggleSource(msg.id)}
                      className="flex items-center space-x-1.5 text-[11px] font-semibold text-vedic-700 hover:text-vedic-900 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-gold-600" />
                      <span>{msg.sources.length} Grounded References Retrieved (RAG)</span>
                      {isSourcesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {isSourcesOpen && (
                      <div className="mt-2 space-y-2 pl-1 border-l-2 border-gold-500/40">
                        {msg.sources.map((src, sIdx) => (
                          <div key={sIdx} className="bg-ivory-200/70 p-2 rounded-lg text-[11px] text-stone-700">
                            <div className="flex items-center justify-between font-semibold text-vedic-900 mb-0.5">
                              <span>{src.title}</span>
                              <span className="text-[10px] uppercase px-1 rounded bg-gold-400/20 text-vedic-800">
                                {src.category}
                              </span>
                            </div>
                            <p className="text-stone-600 italic line-clamp-3">{src.excerpt}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Timestamp */}
                <div className={`mt-1.5 text-[10px] ${isUser ? 'text-ivory-300 text-right' : 'text-stone-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-vedic-800 flex items-center justify-center text-gold-300 flex-shrink-0">
              <Sparkles className="w-4 h-4 text-gold-400 animate-spin" />
            </div>
            <div className="bg-ivory-100 border border-ivory-300 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-stone-600 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-vedic-700" />
              <span>
                {language === 'hi' ? 'वेदविकी कुंडली और संदर्भों का विश्लेषण कर रहा है...' : 'Synthesizing chart placements & traditional references...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 py-2 bg-ivory-100/70 border-t border-ivory-200 overflow-x-auto flex items-center space-x-2 no-scrollbar">
        <span className="text-[10px] uppercase font-bold text-stone-400 flex-shrink-0">
          {language === 'hi' ? 'सुझाव:' : 'Prompts:'}
        </span>
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(s)}
            disabled={isSending}
            className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full bg-ivory-200 hover:bg-ivory-300 text-vedic-900 border border-ivory-300 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold text-stone-400 hover:text-stone-600">✕</button>
        </div>
      )}

      {/* Input bar */}
      <div className="p-3 bg-ivory-100 border-t border-ivory-300">
        <div className="flex items-end space-x-2 bg-ivory-50 rounded-xl border border-ivory-300 focus-within:border-gold-600 focus-within:ring-1 focus-within:ring-gold-500 p-2 shadow-inner">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              language === 'hi'
                ? 'अपनी कुंडली या वैदिक ज्योतिष के बारे में पूछें... (Enter दबाएं)'
                : 'Ask about your chart placements, houses, or Vedic principles... (Press Enter)'
            }
            rows={2}
            disabled={isSending}
            className="flex-1 bg-transparent text-xs sm:text-sm text-stone-800 resize-none focus:outline-none placeholder:text-stone-400"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isSending}
            className="p-2 rounded-lg bg-vedic-800 hover:bg-vedic-900 disabled:opacity-40 text-gold-300 transition-colors flex-shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Ethical Guardrail Disclaimer */}
        <p className="text-[10px] text-stone-600 text-center mt-2 flex items-center justify-center space-x-1">
          <ShieldAlert className="w-3 h-3 text-gold-600 inline" />
          <span>
            {language === 'hi'
              ? 'वेदविकी पारंपरिक ज्योतिषीय दृष्टिकोण प्रदान करता है। यह कोई चिकित्सीय, कानूनी या वित्तीय परामर्श नहीं है।'
              : 'VedViki provides traditional Vedic perspectives for self-reflection. Not definitive medical, legal, or financial advice.'}
          </span>
        </p>
      </div>
    </div>
  );
};
