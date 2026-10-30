import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { KundliPage } from './pages/KundliPage';
import { ChatPage } from './pages/ChatPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { Chart, HealthStatus } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'landing' | 'kundli' | 'chat' | 'knowledge'>('landing');
  const [activeChart, setActiveChart] = useState<Chart | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    // 1. Initialize user session
    api.initSession().catch(console.error);

    // 2. Fetch system health
    api.getHealth().then(setHealth).catch(console.error);

    // 3. Load user charts if any exist
    api.listCharts().then((charts) => {
      if (charts && charts.length > 0) {
        setActiveChart(charts[0]);
      }
    }).catch(console.error);
  }, []);

  const handleToggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    try {
      const demo = await api.seedDemo();
      const loadedChart = await api.getChart(demo.chart_id);
      setActiveChart(loadedChart);
      setCurrentPage('kundli');
    } catch (err) {
      console.error('Failed to seed demo:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory-100 text-stone-800">
      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        activeChart={activeChart}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        health={health}
        onSeedDemo={handleSeedDemo}
        isSeeding={isSeeding}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {currentPage === 'landing' && (
          <LandingPage
            onStartUpload={() => setCurrentPage('kundli')}
            onExploreDemo={handleSeedDemo}
            onNavigateToChat={() => setCurrentPage('chat')}
            language={language}
          />
        )}

        {currentPage === 'kundli' && (
          <KundliPage
            activeChart={activeChart}
            onChartLoaded={(chart) => setActiveChart(chart)}
            onChartDeleted={() => setActiveChart(null)}
            onProceedToChat={() => setCurrentPage('chat')}
            language={language}
          />
        )}

        {currentPage === 'chat' && (
          <ChatPage
            activeChart={activeChart}
            language={language}
            onLanguageChange={setLanguage}
            onNavigateToKundli={() => setCurrentPage('kundli')}
          />
        )}

        {currentPage === 'knowledge' && (
          <KnowledgePage
            language={language}
          />
        )}
      </main>

      {/* Clean Indian-Aesthetic Footer */}
      <footer className="bg-ivory-50 border-t border-ivory-300 py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-vedic font-bold text-vedic-900">VedViki</span>
            <span>• Authentic Vedic Astrology & Kundli Assistant</span>
          </div>
          <div className="text-[11px] text-stone-400">
            Powered by Google Gemini 2.5 & ChromaDB RAG • Parashari Jyotish Framework
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
