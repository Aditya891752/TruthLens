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
  const charCount = text.length;
  const maxChars = 15000;
  const isTooLong = charCount > maxChars;
  const isReady = charCount >= 10 && !isTooLong && !loading;

  return (
    <section className="surface-panel" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
      {/* Top toolbar: Presets & Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <span className="mono" style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
            DEMO PRESETS:
          </span>
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="btn-secondary"
              onClick={() => onSelectPreset(preset)}
              disabled={loading}
              title={preset.description}
            >
              {preset.title.split('(')[0].trim()}
            </button>
          ))}
        </div>

        {text && !loading && (
          <button
            type="button"
            onClick={onClear}
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              borderBottom: '1px dotted var(--text-muted)',
              padding: '2px 0'
            }}
          >
            Clear Input
          </button>
        )}
      </div>

      {/* Input Textarea */}
      <div style={{ position: 'relative' }}>
        <textarea
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="Paste AI-generated text, articles, or statements here to evaluate factuality against live web truth..."
          disabled={loading}
          rows={6}
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-surface-2)',
            color: 'var(--text-primary)',
            border: `1px solid ${isTooLong ? 'var(--contradicted-base)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            fontSize: '14px',
            lineHeight: '1.6',
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'var(--font-sans)',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Bottom action bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 'var(--space-4)',
        flexWrap: 'wrap',
        gap: 'var(--space-3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span className="mono" style={{
            fontSize: '12px',
            color: isTooLong ? 'var(--contradicted-base)' : 'var(--text-muted)'
          }}>
            {charCount.toLocaleString()} / {maxChars.toLocaleString()} characters
          </span>
          {loading && (
            <span className="mono" style={{ fontSize: '12px', color: 'var(--accent-hover)' }}>
              [{loadingStep || 'Processing forensic evaluation...'}]
            </span>
          )}
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={onAnalyze}
          disabled={!isReady}
        >
          {loading ? 'Analyzing Ground Truth...' : 'Analyze Factuality'}
        </button>
      </div>
    </section>
  );
}
