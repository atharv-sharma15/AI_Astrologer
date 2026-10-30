import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SourceReference } from '../types';
import { 
  BookOpen, Search, Database, CheckCircle2, AlertCircle, 
  Sparkles, Layers, ShieldCheck, ExternalLink, Loader2
} from 'lucide-react';

interface KnowledgePageProps {
  language: 'en' | 'hi';
}

export const KnowledgePage: React.FC<KnowledgePageProps> = ({ language }) => {
  const [status, setStatus] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SourceReference[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    api.getKnowledgeStatus().then(setStatus).catch(console.error);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const results = await api.searchKnowledge(searchQuery, 4);
      setSearchResults(results);
    } catch (err: any) {
      setSearchError(err.message || 'Failed to search knowledge base.');
    } finally {
      setIsSearching(false);
    }
  };

  const sampleQueries = [
    "Guru Jupiter wisdom and exaltation",
    "4th House Sukha Bhava emotional happiness",
    "Chesta Bala in Retrograde Vakri planets",
    "Rohini Nakshatra Lord and qualities"
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold-400/20 text-vedic-900 border border-gold-500/30 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5 text-gold-600" />
          <span>ChromaDB Vector Retrieval (RAG)</span>
        </div>
        <h1 className="font-vedic font-bold text-3xl sm:text-4xl text-vedic-950">
          Curated Vedic Knowledge Base
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto">
          Explore the traditional Jyotish reference texts that ground VedViki’s AI responses. 
          Responses cite verified excerpts directly without inventing scriptures.
        </p>
      </div>

      {/* RAG Status Bar */}
      <div className="bg-ivory-50 rounded-2xl p-5 border border-ivory-300 shadow-vedic flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-vedic-800 flex items-center justify-center text-gold-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-xs text-vedic-900">Vector Store Status:</span>
              {status?.is_configured ? (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Configured & Active</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                  <AlertCircle className="w-3 h-3" />
                  <span>Baseline Fallback Mode</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Indexed Reference Passages: <strong>{status?.indexed_chunks || 0} chunks</strong> • Storage: ChromaDB HNSW Cosine Index
            </p>
          </div>
        </div>

        <div className="text-xs text-stone-500 self-start sm:self-auto">
          <span className="px-2.5 py-1 rounded-lg bg-ivory-200 border border-ivory-300 font-mono text-[11px]">
            {status?.storage_path || './chroma_db'}
          </span>
        </div>
      </div>

      {/* Interactive Semantic Search Sandbox */}
      <div className="bg-ivory-50 rounded-2xl p-6 border border-ivory-300 shadow-vedic space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-gold-600" />
          <h3 className="font-vedic font-bold text-base text-vedic-900">
            Live Knowledge Base Retrieval Sandbox
          </h3>
        </div>
        <p className="text-xs text-stone-600">
          Test semantic vector retrieval directly against indexed Vedic astrology principles.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concepts e.g., 'What does Jupiter represent?' or '10th house career'..."
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-ivory-100 border border-ivory-300 text-stone-800 focus:outline-none focus:ring-1 focus:ring-vedic-700"
          />
          <button
            type="submit"
            disabled={!searchQuery.trim() || isSearching}
            className="px-4 py-2.5 rounded-xl bg-vedic-800 hover:bg-vedic-900 disabled:opacity-40 text-gold-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Query RAG</span>
          </button>
        </form>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-stone-400 font-semibold uppercase">Try:</span>
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchQuery(q);
              }}
              className="text-[11px] px-2 py-0.5 rounded-md bg-ivory-200 hover:bg-ivory-300 text-stone-700 border border-ivory-300"
            >
              {q}
            </button>
          ))}
        </div>

        {searchError && (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-800 text-xs border border-rose-200">
            {searchError}
          </div>
        )}

        {/* Retrieved Results Cards */}
        {searchResults.length > 0 && (
          <div className="pt-4 border-t border-ivory-200 space-y-3">
            <h4 className="text-xs font-bold text-vedic-900">
              Retrieved Reference Passages ({searchResults.length}):
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.map((res, idx) => (
                <div
                  key={idx}
                  className="bg-ivory-100/90 rounded-xl p-3.5 border border-ivory-300 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-vedic-900">{res.title}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gold-400/20 text-vedic-800 border border-gold-500/20">
                      Match: {res.relevance_score ? `${Math.round(res.relevance_score * 100)}%` : 'High'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed line-clamp-4 whitespace-pre-wrap">
                    {res.excerpt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Curated Module Cards */}
      <div className="space-y-4">
        <h3 className="font-vedic font-bold text-lg text-vedic-900">
          Core Reference Modules in VedViki
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "The Navagrahas",
              desc: "Classical karakas, elemental traits, exaltation, and debilitation signs for the 9 Vedic Grahas.",
              chunks: "10 chunks",
              category: "graha"
            },
            {
              title: "The Twelve Bhavas",
              desc: "Purusharthas (Dharma, Artha, Kama, Moksha), Kendras, Trikonas, and Dusthanas across 12 houses.",
              chunks: "7 chunks",
              category: "bhava"
            },
            {
              title: "The Twelve Rashis",
              desc: "Sidereal zodiac constellations, ruling elements (Fire, Earth, Air, Water), and mobility qualities.",
              chunks: "7 chunks",
              category: "rashi"
            },
            {
              title: "The 27 Nakshatras",
              desc: "13°20' lunar mansions, planetary lords under Vimshottari scheme, and Pada breakdowns.",
              chunks: "2 chunks",
              category: "nakshatra"
            },
            {
              title: "Core Vedic Principles",
              desc: "Primacy of Lagna, Vakri (retrograde) Chesta Bala, Asta (combustion), and ethical principles.",
              chunks: "7 chunks",
              category: "principles"
            },
            {
              title: "Astronomical Ephemeris",
              desc: "Transparent calculation provenance. Uploaded charts are explicitly flagged until calculated via engine.",
              chunks: "Engine Interface",
              category: "ephemeris"
            }
          ].map((m, idx) => (
            <div
              key={idx}
              className="bg-ivory-50 rounded-2xl p-5 border border-ivory-300 shadow-vedic space-y-2 hover:border-gold-500/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-vedic font-bold text-sm text-vedic-900">{m.title}</h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-ivory-200 text-stone-600 border border-ivory-300">
                  {m.chunks}
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
