import React, { useState, useEffect } from 'react';
import { Conversation, Chart, Message } from '../types';
import { api } from '../services/api';
import { ChatInterface } from '../components/ChatInterface';
import { 
  Plus, MessageSquare, Trash2, Compass, Sparkles, 
  CheckCircle2, AlertTriangle, RefreshCw
} from 'lucide-react';

interface ChatPageProps {
  activeChart: Chart | null;
  language: 'en' | 'hi';
  onLanguageChange: (lang: 'en' | 'hi') => void;
  onNavigateToKundli: () => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  activeChart,
  language,
  onLanguageChange,
  onNavigateToKundli
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const list = await api.listConversations();
      setConversations(list);
      if (list.length > 0 && !activeConv) {
        setActiveConv(list[0]);
      } else if (list.length === 0) {
        // Automatically create a starting consultation session
        await handleCreateConversation();
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [activeChart?.id]);

  const handleCreateConversation = async () => {
    setIsCreating(true);
    try {
      const title = activeChart 
        ? `${activeChart.ascendant_sign || 'Kundli'} Reading` 
        : 'Astrology Inquiry';
      const newConv = await api.createConversation(activeChart?.id, title, language);
      setConversations(prev => [newConv, ...prev]);
      setActiveConv(newConv);
    } catch (err) {
      console.error('Failed to create conversation:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation history?')) return;
    try {
      await api.deleteConversation(convId);
      const remaining = conversations.filter(c => c.id !== convId);
      setConversations(remaining);
      if (activeConv?.id === convId) {
        setActiveConv(remaining[0] || null);
      }
    } catch (err) {
      alert('Could not delete conversation.');
    }
  };

  const handleMessageSent = (assistantMsg: Message) => {
    if (!activeConv) return;
    const updatedMessages = [...activeConv.messages, assistantMsg];
    const updatedConv = { ...activeConv, messages: updatedMessages, updated_at: new Date().toISOString() };
    setActiveConv(updatedConv);
    setConversations(prev => prev.map(c => c.id === updatedConv.id ? updatedConv : c));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
        {/* Left Column: Conversation Sessions & Active Chart Card */}
        <div className="hidden md:flex md:col-span-4 lg:col-span-3 flex-col space-y-4 h-full">
          {/* Active Chart Quick Card */}
          <div className="bg-ivory-50 rounded-2xl p-4 border border-ivory-300 shadow-vedic">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                Attached Kundli
              </span>
              {activeChart ? (
                activeChart.is_confirmed ? (
                  <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Unconfirmed</span>
                  </span>
                )
              ) : (
                <span className="text-[10px] text-stone-400">None</span>
              )}
            </div>

            {activeChart ? (
              <div className="space-y-2">
                <div className="font-vedic font-bold text-sm text-vedic-900 truncate">
                  {activeChart.title}
                </div>
                <div className="text-xs text-stone-600 flex items-center justify-between">
                  <span>Lagna: <strong>{activeChart.ascendant_sign || 'Aries'}</strong></span>
                  <span>{activeChart.placements.length} Grahas</span>
                </div>
                <button
                  onClick={onNavigateToKundli}
                  className="w-full text-center text-xs py-1.5 rounded-lg bg-ivory-200 hover:bg-ivory-300 text-vedic-900 font-semibold border border-ivory-300 transition-colors flex items-center justify-center space-x-1"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Inspect Placements</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-2 space-y-2">
                <p className="text-xs text-stone-500">No chart linked to this session.</p>
                <button
                  onClick={onNavigateToKundli}
                  className="text-xs px-3 py-1.5 rounded-lg bg-vedic-800 hover:bg-vedic-900 text-gold-300 font-semibold border border-gold-500/30 transition-colors inline-flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Kundli</span>
                </button>
              </div>
            )}
          </div>

          {/* Conversations List Card */}
          <div className="flex-1 bg-ivory-50 rounded-2xl p-4 border border-ivory-300 shadow-vedic flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-ivory-200">
              <h3 className="font-vedic font-bold text-sm text-vedic-900 flex items-center space-x-1.5">
                <MessageSquare className="w-4 h-4 text-gold-600" />
                <span>Consultations</span>
              </h3>
              <button
                onClick={handleCreateConversation}
                disabled={isCreating}
                className="p-1 rounded-lg bg-ivory-200 hover:bg-ivory-300 text-stone-700 transition-colors"
                title="New Chat Session"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pt-2 space-y-1.5 pr-1">
              {isLoading && conversations.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-500 flex items-center justify-center space-x-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading chats...</span>
                </div>
              ) : conversations.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-500">
                  No active chats. Click + above to begin.
                </div>
              ) : (
                conversations.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setActiveConv(c)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                      activeConv?.id === c.id
                        ? 'bg-vedic-800 text-ivory-50 shadow-xs'
                        : 'hover:bg-ivory-200/70 text-stone-700'
                    }`}
                  >
                    <div className="truncate flex-1 pr-2">
                      <div className="font-semibold truncate">{c.title}</div>
                      <div className={`text-[10px] ${activeConv?.id === c.id ? 'text-ivory-300' : 'text-stone-400'}`}>
                        {new Date(c.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(c.id, e)}
                      className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-stone-400 hover:text-rose-600 transition-opacity`}
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Full Height Chat Interface */}
        <div className="col-span-1 md:col-span-8 lg:col-span-9 h-full">
          {activeConv ? (
            <ChatInterface
              conversation={activeConv}
              activeChart={activeChart}
              onMessageSent={handleMessageSent}
              language={language}
              onLanguageChange={onLanguageChange}
              onNavigateToKundli={onNavigateToKundli}
            />
          ) : (
            <div className="h-full bg-ivory-50 rounded-2xl border border-ivory-300 p-8 flex flex-col items-center justify-center text-center space-y-3">
              <Sparkles className="w-10 h-10 text-gold-500" />
              <h3 className="font-vedic font-bold text-xl text-vedic-900">VedViki Astrologer</h3>
              <p className="text-xs text-stone-500 max-w-sm">
                Create a consultation to start asking questions about your birth chart in English or Hindi.
              </p>
              <button
                onClick={handleCreateConversation}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-vedic-800 text-gold-300 shadow-sm"
              >
                Start New Consultation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
