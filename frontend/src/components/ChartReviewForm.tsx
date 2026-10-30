import React, { useState } from 'react';
import { Chart, Placement } from '../types';
import { api } from '../services/api';
import { 
  CheckCircle2, AlertTriangle, Save, Plus, Trash2, 
  HelpCircle, ShieldCheck, ArrowRight, RefreshCw, FileText
} from 'lucide-react';

interface ChartReviewFormProps {
  chart: Chart;
  onChartUpdated: (chart: Chart) => void;
  onProceedToChat: () => void;
  language: 'en' | 'hi';
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const STANDARD_PLANETS = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu',
  'Uranus', 'Neptune', 'Pluto'
];

export const ChartReviewForm: React.FC<ChartReviewFormProps> = ({
  chart,
  onChartUpdated,
  onProceedToChat,
  language
}) => {
  const [title, setTitle] = useState(chart.title);
  const [chartType, setChartType] = useState(chart.chart_type);
  const [ascSign, setAscSign] = useState(chart.ascendant_sign || 'Aries');
  const [ascDegree, setAscDegree] = useState<number | ''>(
    chart.ascendant_degree !== null && chart.ascendant_degree !== undefined ? chart.ascendant_degree : ''
  );
  const [placements, setPlacements] = useState<Placement[]>(chart.placements);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userNotes, setUserNotes] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePlacementChange = (index: number, field: keyof Placement, value: any) => {
    const updated = [...placements];
    updated[index] = { ...updated[index], [field]: value };
    setPlacements(updated);
  };

  const handleAddPlacement = () => {
    setPlacements([
      ...placements,
      {
        planet: 'Sun',
        sign: 'Aries',
        house: 1,
        degree: 0,
        nakshatra: '',
        nakshatra_pada: 1,
        is_retrograde: false,
        is_combust: false,
      }
    ]);
  };

  const handleRemovePlacement = (index: number) => {
    setPlacements(placements.filter((_, idx) => idx !== index));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setFeedbackMsg(null);
    try {
      const updated = await api.updateChart(chart.id, {
        title,
        chart_type: chartType,
        ascendant_sign: ascSign,
        ascendant_degree: ascDegree === '' ? null : Number(ascDegree),
        placements: placements.map(p => ({
          ...p,
          house: Number(p.house),
          degree: p.degree === null || p.degree === undefined || (p.degree as any) === '' ? null : Number(p.degree),
          nakshatra_pada: p.nakshatra_pada ? Number(p.nakshatra_pada) : null
        }))
      });
      onChartUpdated(updated);
      setFeedbackMsg({ type: 'success', text: 'Chart corrections saved successfully.' });
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to save chart updates.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmChart = async () => {
    setIsConfirming(true);
    setFeedbackMsg(null);
    try {
      // Save changes first if pending
      await api.updateChart(chart.id, {
        title,
        chart_type: chartType,
        ascendant_sign: ascSign,
        ascendant_degree: ascDegree === '' ? null : Number(ascDegree),
        placements: placements.map(p => ({
          ...p,
          house: Number(p.house),
          degree: p.degree === null || p.degree === undefined || (p.degree as any) === '' ? null : Number(p.degree)
        }))
      });

      const confirmed = await api.confirmChart(chart.id, userNotes);
      onChartUpdated(confirmed);
      setShowConfirmModal(false);
      setFeedbackMsg({
        type: 'success',
        text: 'Chart verified and confirmed! You can now start personalized AI consultations.'
      });
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to confirm chart.' });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="bg-ivory-50 rounded-2xl p-6 border border-ivory-300 shadow-vedic space-y-6">
      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ivory-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="font-vedic font-bold text-xl text-vedic-900">
              {language === 'hi' ? 'कुंडली समीक्षा व सत्यापन' : 'Review & Verify Extracted Placements'}
            </h2>
            {chart.is_confirmed ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirmed</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Unconfirmed Draft</span>
              </span>
            )}
          </div>
          <p className="text-xs text-stone-600 mt-1">
            {language === 'hi'
              ? 'कृपया AI द्वारा निकाले गए डेटा की अपनी मूल कुंडली से पुष्टि करें। पुष्टि के बाद ही व्यक्तिगत व्याख्याएं सक्षम होंगी।'
              : 'Compare the AI-extracted positions against your original Kundli document. Confirm to unlock personalized readings.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-ivory-200 hover:bg-ivory-300 text-stone-800 border border-ivory-400 transition-colors"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Draft</span>
          </button>

          {!chart.is_confirmed ? (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-vedic-800 hover:bg-vedic-900 text-gold-300 border border-gold-500/40 shadow-sm transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              <span>Confirm Chart</span>
            </button>
          ) : (
            <button
              onClick={onProceedToChat}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-colors"
            >
              <span>Ask Questions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-stone-400 hover:text-stone-600 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Uncertainty & Review Flags Notice */}
      {((chart.review_flags && chart.review_flags.length > 0) || (chart.uncertain_fields && chart.uncertain_fields.length > 0)) && (
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>AI Extraction Warnings & Ambiguities Flagged for Review:</span>
          </div>
          <ul className="list-disc list-inside text-xs space-y-1 text-amber-900 pl-1">
            {chart.review_flags?.map((flag, idx) => (
              <li key={`flag-${idx}`}><span className="font-medium">Review Notice:</span> {flag}</li>
            ))}
            {chart.uncertain_fields?.map((unc, idx) => (
              <li key={`unc-${idx}`}><span className="font-medium">Uncertain Reading:</span> {unc}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Primary Chart Attributes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-ivory-100 rounded-xl border border-ivory-300">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Chart Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg bg-ivory-50 border border-ivory-300 text-stone-800 focus:outline-none focus:ring-1 focus:ring-vedic-700"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Ascendant (Lagna) Sign</label>
          <select
            value={ascSign}
            onChange={(e) => setAscSign(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg bg-ivory-50 border border-ivory-300 text-stone-800 focus:outline-none focus:ring-1 focus:ring-vedic-700"
          >
            {ZODIAC_SIGNS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Lagna Degree (0° - 30°)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="30"
            value={ascDegree}
            onChange={(e) => setAscDegree(e.target.value === '' ? '' : parseFloat(e.target.value))}
            placeholder="e.g. 14.5"
            className="w-full text-xs px-3 py-2 rounded-lg bg-ivory-50 border border-ivory-300 text-stone-800 focus:outline-none focus:ring-1 focus:ring-vedic-700"
          />
        </div>
      </div>

      {/* Editable Planetary Placements Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-vedic font-bold text-sm text-vedic-900">
            {language === 'hi' ? 'ग्रहों की स्थिति (Graha Placements)' : 'Planetary Positions & Bhavas'}
          </h4>
          <button
            onClick={handleAddPlacement}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-ivory-200 hover:bg-ivory-300 text-vedic-900 border border-ivory-400"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Planet</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-ivory-300 shadow-sm">
          <table className="w-full text-left text-xs bg-ivory-50">
            <thead className="bg-ivory-200 text-vedic-900 font-semibold uppercase text-[10px] border-b border-ivory-300">
              <tr>
                <th className="py-2.5 px-3">Graha (Planet)</th>
                <th className="py-2.5 px-3">Rashi (Sign)</th>
                <th className="py-2.5 px-3">Bhava (House)</th>
                <th className="py-2.5 px-3">Degree</th>
                <th className="py-2.5 px-3">Nakshatra</th>
                <th className="py-2.5 px-3 text-center">Vakri (R)</th>
                <th className="py-2.5 px-3 text-center">Asta (C)</th>
                <th className="py-2.5 px-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200">
              {placements.map((p, idx) => (
                <tr key={idx} className="hover:bg-ivory-100/60 transition-colors">
                  <td className="py-2 px-3">
                    <select
                      value={p.planet}
                      onChange={(e) => handlePlacementChange(idx, 'planet', e.target.value)}
                      className="text-xs px-2 py-1 rounded bg-ivory-50 border border-ivory-300 font-semibold text-vedic-900"
                    >
                      {STANDARD_PLANETS.map((pl) => (
                        <option key={pl} value={pl}>{pl}</option>
                      ))}
                    </select>
                  </td>

                  <td className="py-2 px-3">
                    <select
                      value={p.sign}
                      onChange={(e) => handlePlacementChange(idx, 'sign', e.target.value)}
                      className="text-xs px-2 py-1 rounded bg-ivory-50 border border-ivory-300"
                    >
                      {ZODIAC_SIGNS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>

                  <td className="py-2 px-3">
                    <select
                      value={p.house}
                      onChange={(e) => handlePlacementChange(idx, 'house', parseInt(e.target.value))}
                      className="text-xs px-2 py-1 rounded bg-ivory-50 border border-ivory-300 font-semibold"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                        <option key={h} value={h}>House {h}</option>
                      ))}
                    </select>
                  </td>

                  <td className="py-2 px-3">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="30"
                      value={p.degree ?? ''}
                      onChange={(e) => handlePlacementChange(idx, 'degree', e.target.value === '' ? null : parseFloat(e.target.value))}
                      placeholder="°"
                      className="w-16 text-xs px-2 py-1 rounded bg-ivory-50 border border-ivory-300"
                    />
                  </td>

                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={p.nakshatra || ''}
                      onChange={(e) => handlePlacementChange(idx, 'nakshatra', e.target.value)}
                      placeholder="e.g. Rohini"
                      className="w-28 text-xs px-2 py-1 rounded bg-ivory-50 border border-ivory-300"
                    />
                  </td>

                  <td className="py-2 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={p.is_retrograde}
                      onChange={(e) => handlePlacementChange(idx, 'is_retrograde', e.target.checked)}
                      className="rounded text-vedic-700 focus:ring-vedic-500 w-4 h-4 cursor-pointer"
                      title="Retrograde (Vakri)"
                    />
                  </td>

                  <td className="py-2 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={p.is_combust}
                      onChange={(e) => handlePlacementChange(idx, 'is_combust', e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                      title="Combust (Asta)"
                    />
                  </td>

                  <td className="py-2 px-2 text-center">
                    <button
                      onClick={() => handleRemovePlacement(idx)}
                      className="text-stone-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Delete placement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Extracted Evidence Preview */}
      {chart.raw_evidence && (
        <details className="text-xs text-stone-600 bg-ivory-100 p-3 rounded-xl border border-ivory-300">
          <summary className="cursor-pointer font-semibold text-vedic-900 select-none flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5 text-gold-600" />
            <span>View OCR / Extracted Evidence Text</span>
          </summary>
          <pre className="mt-2 text-[11px] font-mono whitespace-pre-wrap bg-ivory-50 p-2.5 rounded border border-ivory-200 text-stone-700 max-h-36 overflow-y-auto">
            {chart.raw_evidence}
          </pre>
        </details>
      )}

      {/* Explicit Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ivory-50 max-w-lg w-full rounded-2xl p-6 border-2 border-gold-500/50 shadow-vedic-lg space-y-4">
            <div className="flex items-center space-x-3 text-vedic-900">
              <div className="w-10 h-10 rounded-xl bg-gold-400/20 flex items-center justify-center border border-gold-500/40">
                <ShieldCheck className="w-6 h-6 text-gold-700" />
              </div>
              <div>
                <h3 className="font-vedic font-bold text-lg">Explicit Chart Confirmation</h3>
                <p className="text-xs text-stone-500">Verify extracted data against your document</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-ivory-100 border border-ivory-300 text-xs text-stone-700 space-y-2">
              <p className="font-semibold text-vedic-950">Please review before confirming:</p>
              <ul className="list-disc list-inside space-y-1 text-stone-600">
                <li>You are confirming that the Lagna ({ascSign}) and the {placements.length} planetary positions match your physical birth chart.</li>
                <li><strong>Astronomical Disclaimer:</strong> User confirmation verifies document agreement, but is not scientific proof that the chart was astronomically calculated without errors by original source software.</li>
                <li>VedViki provides traditional philosophical and symbolic perspectives, not definitive scientific, medical, legal, or financial predictions.</li>
              </ul>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Optional Verification Note (e.g., verified against Varanasi almanac / family record):
              </label>
              <input
                type="text"
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="e.g. Verified with birth certificate & horary chart"
                className="w-full text-xs px-3 py-2 rounded-lg bg-ivory-100 border border-ivory-300 text-stone-800 focus:outline-none focus:ring-1 focus:ring-vedic-700"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmChart}
                disabled={isConfirming}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-vedic-800 hover:bg-vedic-900 text-gold-300 border border-gold-500/40 shadow-sm flex items-center space-x-1.5"
              >
                {isConfirming ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>I Confirm Placements</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
