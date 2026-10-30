import React, { useState } from 'react';
import { Chart } from '../types';
import { api } from '../services/api';
import { ChartUploadZone } from '../components/ChartUploadZone';
import { KundliVisualizer } from '../components/KundliVisualizer';
import { ChartReviewForm } from '../components/ChartReviewForm';
import { Upload, Trash2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface KundliPageProps {
  activeChart: Chart | null;
  onChartLoaded: (chart: Chart) => void;
  onChartDeleted: () => void;
  onProceedToChat: () => void;
  language: 'en' | 'hi';
}

export const KundliPage: React.FC<KundliPageProps> = ({
  activeChart,
  onChartLoaded,
  onChartDeleted,
  onProceedToChat,
  language
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleDelete = async () => {
    if (!activeChart || !confirm('Are you sure you want to delete this Kundli chart?')) return;
    setIsDeleting(true);
    try {
      await api.deleteChart(activeChart.id);
      onChartDeleted();
    } catch (err) {
      alert('Failed to delete chart.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header / Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ivory-300 gap-3">
        <div>
          <h1 className="font-vedic font-bold text-2xl text-vedic-950">
            {language === 'hi' ? 'मेरी जन्म कुंडली' : 'My Vedic Birth Chart'}
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            {activeChart 
              ? `Active Chart: ${activeChart.title} (${activeChart.is_confirmed ? 'Confirmed & Verified' : 'Draft Awaiting Confirmation'})`
              : 'Upload your Kundli document to begin.'}
          </p>
        </div>

        {activeChart && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-ivory-200 hover:bg-ivory-300 text-stone-700 border border-ivory-400 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-gold-600" />
              <span>Upload Another Chart</span>
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-300 transition-colors"
              title="Delete this chart"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            {activeChart.is_confirmed && (
              <button
                onClick={onProceedToChat}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-vedic-800 hover:bg-vedic-900 text-gold-300 border border-gold-500/40 shadow-sm transition-colors"
              >
                <span>Ask AI Astrologer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {!activeChart ? (
        <div className="max-w-2xl mx-auto py-8">
          <ChartUploadZone
            onUploadSuccess={(newChart) => onChartLoaded(newChart)}
            language={language}
          />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Unconfirmed Notification Banner if pending */}
          {!activeChart.is_confirmed && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 text-xs">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <span className="font-bold">Confirmation Required:</span> Review and verify your planetary placements below before asking chart-specific questions.
                </div>
              </div>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-200/60 px-2 py-1 rounded">
                Unconfirmed Draft
              </span>
            </div>
          )}

          {/* Grid Layout: Visualizer on Left, Review Form on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-4">
              <KundliVisualizer chart={activeChart} />
            </div>

            <div className="lg:col-span-7">
              <ChartReviewForm
                chart={activeChart}
                onChartUpdated={(updated) => onChartLoaded(updated)}
                onProceedToChat={onProceedToChat}
                language={language}
              />
            </div>
          </div>
        </div>
      )}

      {/* Upload Another Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ivory-50 max-w-xl w-full rounded-2xl p-6 border border-ivory-300 shadow-vedic-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-vedic font-bold text-lg text-vedic-900">Upload New Kundli</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-stone-400 hover:text-stone-600 text-sm font-bold">✕</button>
            </div>
            <ChartUploadZone
              onUploadSuccess={(newChart) => {
                onChartLoaded(newChart);
                setShowUploadModal(false);
              }}
              language={language}
            />
          </div>
        </div>
      )}
    </div>
  );
};
