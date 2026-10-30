import React from 'react';
import { Sparkles, Moon, BookOpen, MessageSquare, Compass, ShieldCheck } from 'lucide-react';
import { Chart, HealthStatus } from '../types';

interface NavbarProps {
  currentPage: 'landing' | 'kundli' | 'chat' | 'knowledge';
  onNavigate: (page: 'landing' | 'kundli' | 'chat' | 'knowledge') => void;
  activeChart: Chart | null;
  language: 'en' | 'hi';
  onToggleLanguage: () => void;
  health: HealthStatus | null;
  onSeedDemo: () => void;
  isSeeding: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  activeChart,
  language,
  onToggleLanguage,
  health,
  onSeedDemo,
  isSeeding
}) => {
  return (
    <header className="sticky top-0 z-50 bg-ivory-50/90 backdrop-blur-md border-b border-ivory-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div 
            onClick={() => onNavigate('landing')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vedic-800 to-vedic-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200 border border-gold-500/40">
              <Sparkles className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-vedic font-bold text-2xl text-vedic-900 tracking-wide">VedViki</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-gold-400/20 text-vedic-800 border border-gold-500/30">
                  AI Jyotish
                </span>
              </div>
              <p className="text-[11px] text-stone-500 -mt-1 hidden sm:block">Vedic Astrology & Kundli Assistant</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'landing'
                  ? 'bg-vedic-800 text-ivory-50 shadow-sm'
                  : 'text-stone-700 hover:text-vedic-900 hover:bg-ivory-200/60'
              }`}
            >
              {language === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}
            </button>
            <button
              onClick={() => onNavigate('kundli')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                currentPage === 'kundli'
                  ? 'bg-vedic-800 text-ivory-50 shadow-sm'
                  : 'text-stone-700 hover:text-vedic-900 hover:bg-ivory-200/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{language === 'hi' ? 'मेरी कुंडली' : 'My Kundli'}</span>
              {activeChart && (
                <span className={`w-2 h-2 rounded-full ${activeChart.is_confirmed ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              )}
            </button>
            <button
              onClick={() => onNavigate('chat')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                currentPage === 'chat'
                  ? 'bg-vedic-800 text-ivory-50 shadow-sm'
                  : 'text-stone-700 hover:text-vedic-900 hover:bg-ivory-200/60'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{language === 'hi' ? 'ज्योतिष चैट' : 'AI Astrologer'}</span>
            </button>
            <button
              onClick={() => onNavigate('knowledge')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                currentPage === 'knowledge'
                  ? 'bg-vedic-800 text-ivory-50 shadow-sm'
                  : 'text-stone-700 hover:text-vedic-900 hover:bg-ivory-200/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{language === 'hi' ? 'ज्ञानकोष (RAG)' : 'Knowledge'}</span>
            </button>
          </nav>

          {/* Right Actions: Demo Loader, Language Toggle, Status */}
          <div className="flex items-center space-x-2.5">
            {/* Quick Demo Seed */}
            <button
              onClick={onSeedDemo}
              disabled={isSeeding}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-ivory-200/80 hover:bg-ivory-300 text-stone-700 border border-ivory-400 transition-colors"
              title="Loads a sample verified Aries Lagna Kundli and conversation for rapid testing"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              <span>{isSeeding ? 'Loading...' : 'Try Demo Chart'}</span>
            </button>

            {/* Language Switch */}
            <button
              onClick={onToggleLanguage}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-ivory-200 hover:bg-ivory-300 text-vedic-900 border border-ivory-400 transition-colors"
              title="Switch Language (English / हिंदी)"
            >
              <span className={language === 'en' ? 'text-vedic-900 underline' : 'text-stone-500'}>EN</span>
              <span className="text-stone-400">/</span>
              <span className={language === 'hi' ? 'text-vedic-900 underline' : 'text-stone-500'}>हिंदी</span>
            </button>

            {/* Health / AI Indicator */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-[11px]">
                {health?.rag_vector_db?.is_configured ? 'RAG Ready' : 'AI Ready'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation bar */}
      <div className="md:hidden flex items-center justify-around py-2 bg-ivory-100 border-t border-ivory-300">
        <button
          onClick={() => onNavigate('landing')}
          className={`flex flex-col items-center text-xs ${currentPage === 'landing' ? 'text-vedic-800 font-bold' : 'text-stone-600'}`}
        >
          <Sparkles className="w-4 h-4 mb-0.5" />
          <span>Home</span>
        </button>
        <button
          onClick={() => onNavigate('kundli')}
          className={`flex flex-col items-center text-xs ${currentPage === 'kundli' ? 'text-vedic-800 font-bold' : 'text-stone-600'}`}
        >
          <Compass className="w-4 h-4 mb-0.5" />
          <span>Kundli</span>
        </button>
        <button
          onClick={() => onNavigate('chat')}
          className={`flex flex-col items-center text-xs ${currentPage === 'chat' ? 'text-vedic-800 font-bold' : 'text-stone-600'}`}
        >
          <MessageSquare className="w-4 h-4 mb-0.5" />
          <span>Chat</span>
        </button>
        <button
          onClick={() => onNavigate('knowledge')}
          className={`flex flex-col items-center text-xs ${currentPage === 'knowledge' ? 'text-vedic-800 font-bold' : 'text-stone-600'}`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span>Docs</span>
        </button>
      </div>
    </header>
  );
};
