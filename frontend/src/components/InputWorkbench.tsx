import { useState } from 'react';
import { PresetItem } from '../types/report';

interface InputWorkbenchProps {
  text: string;
  onChangeText: (val: string) => void;
  onSelectPreset: (preset: PresetItem) => void;
  presets: PresetItem[];
  loading: boolean;
  onAnalyze: () => void;
  onClear: () => void;
  loadingStep: string;
}

export default function InputWorkbench({
  text,
  onChangeText,
  onSelectPreset,
  presets,
  loading,
  onAnalyze,
  onClear,
  loadingStep
}: InputWorkbenchProps) {
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const charCount = text.length;
  const maxChars = 15000;
  const isTooLong = charCount > maxChars;
  const estimatedTokens = Math.max(1, Math.round(charCount / 4.8));

  const handlePresetClick = (preset: PresetItem) => {
    setActivePresetId(preset.id);
    onSelectPreset(preset);
  };

  const handleClearClick = () => {
    setActivePresetId(null);
    onClear();
  };

  const handleTextChange = (val: string) => {
    setActivePresetId(null);
    onChangeText(val);
  };

  return (
    <div className="w-full flex flex-col mb-6">
      {/* Top Notification Banner */}
      <div className="w-full bg-[#f2f3ff] border border-[#bfc7d2] px-4 py-2 rounded mb-4 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2 text-[#131b2e]">
          <span className="w-2 h-2 rounded-full bg-[#006c4a]"></span>
          <span className="font-semibold text-[#006c4a]">SESSION ACTIVE:</span>
          <span className="text-[#3f4850]">
            Deterministic Grounding Pipeline • Google Search Grounding v2.4 + ML BioFact Base
          </span>
        </div>
        <div className="flex items-center gap-4 text-[#707881]">
          <span>EVAL_CYCLE: #9940</span>
          <span>MODEL: GEMINI-PRO-GROUNDED</span>
          <span className="text-[#006c4a] font-semibold">ZERO-LEAK COMPLIANT</span>
        </div>
      </div>

      {/* Input Workbench Container */}
      <section className="w-full bg-white border border-[#bfc7d2] rounded p-4 md:p-6 shadow-xs">
        {/* Toolbar Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#bfc7d2]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-[#707881] uppercase tracking-wider">
              Test Bench Presets:
            </span>
            {presets.map((preset) => {
              const isActive = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  disabled={loading}
                  className={`font-mono text-[11px] px-3 py-1.5 rounded transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#131b2e] text-white font-medium shadow-xs'
                      : 'bg-white hover:bg-[#f2f3ff] text-[#3f4850] border border-[#bfc7d2] font-medium'
                  }`}
                  title={preset.description}
                >
                  {preset.title.split('(')[0].trim()}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleClearClick}
            disabled={loading || !text}
            className="flex items-center gap-1 font-mono text-[11px] text-[#707881] hover:text-[#131b2e] transition-colors cursor-pointer disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Clear Input</span>
          </button>
        </div>

        {/* Textarea Input Area */}
        <div className="mt-3 bg-[#f2f3ff] p-1 rounded border border-[#bfc7d2]">
          <label className="sr-only" htmlFor="forensic-input">
            AI text under forensic audit
          </label>
          <textarea
            id="forensic-input"
            rows={5}
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            disabled={loading}
            placeholder="Paste generated AI telemetry, response tokens, or analytical claims here for factual verification..."
            className="w-full bg-white text-[#131b2e] font-sans text-sm p-4 rounded outline-none focus:ring-1 focus:ring-[#006194] border border-[#bfc7d2]/60 leading-relaxed resize-y select-text disabled:opacity-60"
            spellCheck="false"
          />
        </div>

        {/* Loading Progress Bar */}
        {loading && (
          <div className="mt-3 p-3 bg-[#f2f3ff] border border-[#bfc7d2] rounded flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px] text-[#006194] animate-spin">
              refresh
            </span>
            <div className="flex flex-col">
              <span className="font-mono text-xs font-semibold text-[#006194]">
                RUNNING FORENSIC TELEMETRY...
              </span>
              <span className="text-xs text-[#3f4850]">
                {loadingStep || 'Deconstructing text into atomic claims...'}
              </span>
            </div>
          </div>
        )}

        {/* Footer Controls & Counters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 mt-1">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-[#707881]">
            <span className={`font-medium ${isTooLong ? 'text-[#ba1a1a]' : 'text-[#3f4850]'}`}>
              {charCount.toLocaleString()} / {maxChars.toLocaleString()} characters
            </span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Tokens: ~{estimatedTokens}</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Latency: ~420ms</span>
            <span className="hidden md:inline">•</span>
            <span className="text-[#006c4a] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a]"></span>
              Search Grounding: Active
            </span>
          </div>

          <button
            type="button"
            id="btn-analyze"
            onClick={onAnalyze}
            disabled={loading || charCount < 5 || isTooLong}
            className="bg-[#006194] hover:bg-[#0369a1] active:scale-[0.99] text-white font-sans text-xs font-semibold px-6 py-2.5 rounded flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">
              {loading ? 'refresh' : 'document_scanner'}
            </span>
            <span>{loading ? 'Analyzing Factuality...' : 'Analyze Factuality'}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
