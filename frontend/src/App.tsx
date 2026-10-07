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

export default function App() {
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

  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch initial telemetry & presets
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const [h, p] = await Promise.allSettled([
          api.getHealth(),
          api.getPresets()
        ]);

        if (isMounted) {
          if (h.status === 'fulfilled') setHealth(h.value);
          if (p.status === 'fulfilled') setPresets(p.value);
          setHealthLoading(false);
        }
      } catch (err) {
        if (isMounted) setHealthLoading(false);
      }
    }

    init();
    return () => { isMounted = false; };
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
    showToast(`Loaded preset: ${preset.title.split('(')[0].trim()}`);
  };

  // Clear input
  const handleClear = () => {
    setText('');
    setReport(null);
    setSelectedClaimId(null);
    setErrorMessage(null);
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

    try {
      const result = await api.analyzeText(text, controller.signal);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setReport(result);
      setLoading(false);
      setLoadingStep('');
      showToast(`Analyzed ${result.claims.length} claims (Truth Index: ${result.metrics.truth_score}%)`);
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setLoading(false);
      setLoadingStep('');

      if (err.name === 'AbortError') return;

      const msg = err instanceof ApiError ? err.message : 'Unable to complete analysis. Verify backend connection.';
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
    }
  };

  return (
    <div className="app-container">
      <Header health={health} healthLoading={healthLoading} />

      <main>
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

        {/* Error notification banner if any */}
        {errorMessage && (
          <div style={{
            backgroundColor: 'var(--contradicted-bg)',
            color: 'var(--contradicted-text)',
            border: '1px solid var(--contradicted-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-4)',
            marginBottom: 'var(--space-6)',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)'
          }}>
            ERROR: {errorMessage}
          </div>
        )}

        {/* Analysis Results View */}
        {report && (
          <section id="analysis-report-view">
            {/* Metric Telemetry Bar */}
            <MetricBar
              metrics={report.metrics}
              claims={report.claims}
              mlPredictions={report.ml_predictions}
            />

            {/* Split Forensic Workbench: Annotated Reader + Claims Stream */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)',
              gap: 'var(--space-6)',
              alignItems: 'start'
            }}>
              <div>
                <AnnotatedViewer
                  originalText={report.original_text}
                  claims={report.claims}
                  selectedClaimId={selectedClaimId}
                  onSelectClaim={handleSelectClaim}
                />
              </div>

              <div>
                <ClaimsList
                  claims={report.claims}
                  selectedClaimId={selectedClaimId}
                  onSelectClaim={handleSelectClaim}
                  mlPredictions={report.ml_predictions}
                />
              </div>
            </div>

            {/* Export Toolbar */}
            <ExportToolbar report={report} onShowToast={showToast} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'var(--space-12)',
        paddingTop: 'var(--space-6)',
        borderTop: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: 'var(--text-muted)',
        flexWrap: 'wrap',
        gap: 'var(--space-3)'
      }}>
        <div>
          TruthLens v1.0 • Built with Python FastAPI + React Vite • Powered by Gemini Google Search Grounding
        </div>
        <div className="mono" style={{ fontSize: '11px' }}>
          Zero Client Secrets • Strict Security Baseline Enforced
        </div>
      </footer>

      {/* Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
}
