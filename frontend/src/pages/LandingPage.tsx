import React from 'react';
import { 
  Sparkles, Upload, CheckCircle2, MessageSquare, 
  ShieldCheck, Compass, BookOpen, ArrowRight, Star
} from 'lucide-react';

interface LandingPageProps {
  onStartUpload: () => void;
  onExploreDemo: () => void;
  onNavigateToChat: () => void;
  language: 'en' | 'hi';
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartUpload,
  onExploreDemo,
  onNavigateToChat,
  language
}) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pb-24 border-b border-ivory-300">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gold-400/20 border border-gold-500/30 text-vedic-900 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            <span>
              {language === 'hi' ? 'बुद्धिमान वैदिक ज्योतिष सहायक' : 'Next-Generation Vedic Astrology Intelligence'}
            </span>
          </div>

          <h1 className="font-vedic font-extrabold text-3xl sm:text-5xl md:text-6xl text-vedic-950 tracking-tight leading-tight">
            {language === 'hi' ? (
              <>
                अपनी <span className="text-gold-600">जन्म कुंडली</span> को समझें<br />सरल व प्रामाणिक रूप से
              </>
            ) : (
              <>
                Understand Your <span className="text-gold-600">Kundli</span> with<br />Authentic AI Guidance
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
            {language === 'hi'
              ? 'अपनी कुंडली की छवि या पीडीएफ अपलोड करें। जेमिनी AI द्वारा ग्रहों और भावों की सटीक पहचान, मानवीय सत्यापन, और शुद्ध पराशरी सिद्धांतों पर आधारित व्यक्तिगत मार्गदर्शन प्राप्त करें।'
              : 'Upload your scanned birth chart image or PDF. Review multimodal AI extracted placements, verify your planetary positions, and explore traditional Vedic insights in English or Hindi.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={onStartUpload}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-vedic font-bold text-sm bg-vedic-800 hover:bg-vedic-900 text-gold-300 border border-gold-500/40 shadow-vedic flex items-center justify-center space-x-2 transition-transform hover:-translate-y-0.5"
            >
              <Upload className="w-4 h-4 text-gold-400" />
              <span>{language === 'hi' ? 'कुंडली अपलोड करें' : 'Upload Your Kundli'}</span>
              <ArrowRight className="w-4 h-4 text-gold-400 ml-1" />
            </button>

            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-ivory-200 hover:bg-ivory-300 text-stone-800 border border-ivory-400 transition-colors flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span>{language === 'hi' ? 'डेमो चार्ट देखें' : 'Try Demo Kundli'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3-Step Guided Workflow */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-2 mb-10">
          <h2 className="font-vedic font-bold text-2xl sm:text-3xl text-vedic-900">
            {language === 'hi' ? 'वेदविकी कैसे काम करता है' : 'How VedViki Works'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
            A transparent, human-in-the-loop pipeline designed for accuracy and ethical grounding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-ivory-50 rounded-2xl p-6 border border-ivory-300 shadow-vedic space-y-3 relative overflow-hidden group hover:border-gold-500/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-ivory-200 border border-gold-500/30 flex items-center justify-center text-gold-700 font-vedic font-bold text-base">
              1
            </div>
            <h3 className="font-vedic font-bold text-base text-vedic-900">
              {language === 'hi' ? 'दस्तावेज़ अपलोड व OCR' : 'Upload Kundli Document'}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Upload any JPG, PNG, WEBP, or PDF Kundli. Strict file signature validation, PyMuPDF rendering, and Google Gemini multimodal extraction detect your Lagna and 9 Grahas.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-ivory-50 rounded-2xl p-6 border border-ivory-300 shadow-vedic space-y-3 relative overflow-hidden group hover:border-gold-500/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-ivory-200 border border-gold-500/30 flex items-center justify-center text-gold-700 font-vedic font-bold text-base">
              2
            </div>
            <h3 className="font-vedic font-bold text-base text-vedic-900">
              {language === 'hi' ? 'समीक्षा व मानवीय पुष्टि' : 'Review & Confirm Placements'}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Never accept unverified AI outputs blindly. Review every house, sign, and retrograde flag in an editable form. You must explicitly confirm the chart before personalized readings unlock.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-ivory-50 rounded-2xl p-6 border border-ivory-300 shadow-vedic space-y-3 relative overflow-hidden group hover:border-gold-500/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-ivory-200 border border-gold-500/30 flex items-center justify-center text-gold-700 font-vedic font-bold text-base">
              3
            </div>
            <h3 className="font-vedic font-bold text-base text-vedic-900">
              {language === 'hi' ? 'संवादी RAG ज्योतिष परामर्श' : 'Grounded AI Consultation'}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Inquire in English or Hindi. Powered by Google Gemini and ChromaDB RAG with curated traditional texts. Separates verified chart facts from symbolic interpretations.
            </p>
          </div>
        </div>
      </section>

      {/* Ethical Astrological Foundations */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-br from-vedic-900 to-vedic-800 rounded-2xl p-8 text-ivory-50 shadow-vedic-lg border border-gold-500/30 space-y-4">
          <div className="flex items-center space-x-2 text-gold-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-vedic font-bold text-lg text-gold-300">
              {language === 'hi' ? 'वेदविकी का नैतिक ज्योतिष संकल्प' : 'VedViki Ethical Astrology Charter'}
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-ivory-200 leading-relaxed">
            Astrology is an ancient, cultural, and symbolic lens for self-understanding—not an empirical science of fatalistic certainty. VedViki strictly adheres to ethical safeguards:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-ivory-100">
            <div className="flex items-start space-x-2">
              <span className="text-gold-400 font-bold">•</span>
              <span><strong>No Fatalistic Claims:</strong> We never promise exact dates of wealth, disaster, or marriage.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-gold-400 font-bold">•</span>
              <span><strong>Medical & Legal Prohibition:</strong> No medical diagnoses or financial speculation advice.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-gold-400 font-bold">•</span>
              <span><strong>Fact vs Interpretation:</strong> Verified chart placements are strictly demarcated from classical commentaries.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-gold-400 font-bold">•</span>
              <span><strong>No Fabricated Positions:</strong> If a planet is missing or illegible in your scan, it is labeled as unknown.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
