import { useState, useEffect, useRef } from 'react';
import './styles/global.css';
import { api, ApiError } from './services/api';
import { HealthStatus, PresetItem, VerificationReport } from './types/report';
import Header from './components/Header';
import InputWorkbench from './components/InputWorkbench';
import MetricBar from './components/MetricBar';
import AnnotatedViewer from './components/AnnotatedViewer';
import ClaimsList from './components/ClaimsList';
import ExportToolbar from './components/ExportToolbar';
import Toast from './components/Toast';
import TelemetryView from './components/TelemetryView';
import LineageView from './components/LineageView';
import DiagnosticsView from './components/DiagnosticsView';

export default function App() {
  const [activeTab, setActiveTab] = useState('forensic-audit');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [presets, setPresets] = useState<PresetItem[]>([]);

  const [text, setText] = useState('');
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState(42);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch initial telemetry & presets
  useEffect(() => {
    let isMounted = true;

    async function init() {
      const startTime = performance.now();
      try {
        const [h, p] = await Promise.allSettled([api.getHealth(), api.getPresets()]);

        if (isMounted) {
          if (h.status === 'fulfilled') setHealth(h.value);
          if (p.status === 'fulfilled') setPresets(p.value);
          setHealthLoading(false);
          const roundTrip = Math.round(performance.now() - startTime);
          setLatencyMs(roundTrip > 0 ? roundTrip : 42);
        }
      } catch (err) {
        if (isMounted) setHealthLoading(false);
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // Toast auto-clear
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Handle Preset selection
  const handleSelectPreset = (preset: PresetItem) => {
    setText(preset.text);
    setReport(null);
    setSelectedClaimId(null);
    setErrorMessage(null);
    showToast(`Loaded Preset: ${preset.title.split('(')[0].trim()}`);
  };

  // Clear input
  const handleClear = () => {
    setText('');
    setReport(null);
    setSelectedClaimId(null);
    setErrorMessage(null);
    showToast('Input workbench cleared');
  };

  // Execute Analysis
  const handleAnalyze = async () => {
    if (!text.trim() || loading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setErrorMessage(null);
    setSelectedClaimId(null);

    // Staged progression indicators
    setLoadingStep('Deconstructing text into atomic claims...');
    const stepTimer1 = setTimeout(() => {
      setLoadingStep('Querying Google Search Grounding for live evidence...');
    }, 1200);
    const stepTimer2 = setTimeout(() => {
      setLoadingStep('Synthesizing forensic verdicts & citations...');
    }, 2800);

    const callStartTime = performance.now();

    try {
      const result = await api.analyzeText(text, controller.signal);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      const measuredLatency = Math.round(performance.now() - callStartTime);
      setLatencyMs(measuredLatency);
      setReport(result);
      setLoading(false);
      setLoadingStep('');
      showToast(
        `✓ Factuality analysis completed: ${result.claims.length} claims verified in ${measuredLatency}ms`
      );
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setLoading(false);
      setLoadingStep('');

      if (err.name === 'AbortError') return;

      const msg =
        err instanceof ApiError ? err.message : 'Unable to complete analysis. Verify backend connection.';
      setErrorMessage(msg);
      showToast(msg);
    }
  };

  // Select claim & scroll card into view
  const handleSelectClaim = (id: string) => {
    setSelectedClaimId(id);
    const el = document.getElementById(`claim-card-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      el.classList.add('ring-2', 'ring-[#006194]');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-[#006194]');
      }, 1600);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#131b2e] font-sans antialiased">
      {/* Top Header */}
      <Header
        health={health}
        healthLoading={healthLoading}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        latencyMs={latencyMs}
      />

      {/* Main Container */}
      <main className="w-full pt-20 md:pt-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          {/* View Tab Router */}
          {activeTab === 'forensic-audit' && (
            <div className="flex flex-col w-full">
              {/* Input Workbench */}
              <InputWorkbench
                text={text}
                onChangeText={setText}
                onSelectPreset={handleSelectPreset}
                presets={presets}
                loading={loading}
                onAnalyze={handleAnalyze}
                onClear={handleClear}
                loadingStep={loadingStep}
              />

              {/* Error banner if any */}
              {errorMessage && (
                <div className="w-full bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] p-3 rounded mb-6 font-mono text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>ERROR: {errorMessage}</span>
                </div>
              )}

              {/* Analysis Results View */}
              {report && (
                <section id="analysis-report-view" className="w-full">
                  {/* Metric Telemetry Bar with Segmented Bar */}
                  <MetricBar
                    metrics={report.metrics}
                    claims={report.claims}
                    mlPredictions={report.ml_predictions}
                  />

                  {/* Two-Column Forensic Inspection Workspace */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Annotated Text Inspection (5 cols) */}
                    <div className="lg:col-span-5">
                      <AnnotatedViewer
                        originalText={report.original_text}
                        claims={report.claims}
                        selectedClaimId={selectedClaimId}
                        onSelectClaim={handleSelectClaim}
                      />
                    </div>

                    {/* Right Column: Extracted Claims Stream (7 cols) */}
                    <div className="lg:col-span-7">
                      <ClaimsList
                        claims={report.claims}
                        selectedClaimId={selectedClaimId}
                        onSelectClaim={handleSelectClaim}
                        mlPredictions={report.ml_predictions}
                      />
                    </div>
                  </div>

                  {/* Export Toolbar & Feedback */}
                  <ExportToolbar report={report} onShowToast={showToast} />
                </section>
              )}
            </div>
          )}

          {activeTab === 'ground-truth-telemetry' && <TelemetryView />}

          {activeTab === 'claim-lineage' && <LineageView />}

          {activeTab === 'engine-diagnostics' && (
            <DiagnosticsView
              health={health}
              healthLoading={healthLoading}
              latencyMs={latencyMs}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#bfc7d2] py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="font-mono text-[11px] text-[#707881]">
            TruthLens v1.0 • Built with Python FastAPI + React Vite • Powered by Gemini Google Search
            Grounding • Zero Client Secrets
          </p>
          <div className="flex items-center gap-3 font-mono text-[11px] text-[#707881]">
            <span>STRICT EVAL: DETERMINISTIC</span>
            <span className="inline-block w-1 h-1 rounded-full bg-[#bfc7d2]"></span>
            <span>HASH: 8F2A-09C1</span>
          </div>
        </div>
      </footer>

      {/* Floating Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
}
