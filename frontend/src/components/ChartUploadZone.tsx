import React, { useState, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, AlertCircle, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { Chart } from '../types';

interface ChartUploadZoneProps {
  onUploadSuccess: (chart: Chart) => void;
  language: 'en' | 'hi';
}

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
const MAX_SIZE_MB = 10;

export const ChartUploadZone: React.FC<ChartUploadZoneProps> = ({ onUploadSuccess, language }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported file format. Please upload JPG, PNG, WEBP, or PDF.`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File exceeds maximum size limit of ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const processUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      setLoadingStep(language === 'hi' ? 'फ़ाइल हस्ताक्षर सत्यापित हो रहा है...' : 'Validating file signature & structure...');
      await new Promise(r => setTimeout(r, 400));

      setLoadingStep(language === 'hi' ? 'दस्तावेज़ स्कैन और जेमिनी AI प्रोसेसिंग...' : 'Rendering pages & scanning with Google Gemini...');

      const chart = await api.uploadChart(file);

      setLoadingStep(language === 'hi' ? 'समीक्षा फ़ॉर्म तैयार हो रहा है...' : 'Finalizing extracted placements...');
      await new Promise(r => setTimeout(r, 300));

      onUploadSuccess(chart);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload and analyze Kundli. Please verify file integrity.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-gold-500 bg-gold-400/10 scale-[1.01]'
            : 'border-ivory-300 hover:border-gold-600 bg-ivory-50/70 hover:bg-ivory-100/80 shadow-vedic'
        } ${isLoading ? 'pointer-events-none opacity-90' : ''}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          className="hidden"
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-vedic-800 flex items-center justify-center animate-pulse">
                <Sparkles className="w-8 h-8 text-gold-400 animate-spin" />
              </div>
              <div className="absolute -inset-1 rounded-2xl bg-gold-500/20 blur -z-10 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="font-vedic font-bold text-lg text-vedic-900">
                {language === 'hi' ? 'आपकी कुंडली का विश्लेषण हो रहा है...' : 'Decoding Your Kundli Chart...'}
              </h4>
              <p className="text-xs text-stone-600 font-medium flex items-center justify-center space-x-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-vedic-700" />
                <span>{loadingStep}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-ivory-200 to-ivory-300 border border-gold-500/30 flex items-center justify-center shadow-sm text-vedic-800">
              <Upload className="w-7 h-7 text-gold-600" />
            </div>

            <div>
              <h3 className="font-vedic font-bold text-xl text-vedic-900">
                {language === 'hi' ? 'अपनी जन्म कुंडली अपलोड करें' : 'Upload Your Kundli (Birth Chart)'}
              </h3>
              <p className="text-sm text-stone-600 max-w-md mx-auto mt-1">
                {language === 'hi'
                  ? 'अपनी कुंडली छवि या पीडीएफ फाइल यहाँ खींचें और छोड़ें, या चुनने के लिए क्लिक करें।'
                  : 'Drag & drop your scanned Kundli image or PDF file here, or click to browse.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-stone-500">
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-ivory-200/80 border border-ivory-300">
                <ImageIcon className="w-3.5 h-3.5 text-vedic-700" />
                <span>JPG, PNG, WEBP</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-ivory-200/80 border border-ivory-300">
                <FileText className="w-3.5 h-3.5 text-vedic-700" />
                <span>PDF (Up to 5 pages)</span>
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-ivory-200/80 border border-ivory-300">
                Max 10MB
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error feedback */}
      {errorMsg && (
        <div className="mt-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Upload Error:</span> {errorMsg}
          </div>
        </div>
      )}
    </div>
  );
};
