import { HealthStatus } from '../types/report';

interface HeaderProps {
  health: HealthStatus | null;
  healthLoading: boolean;
}

export default function Header({ health, healthLoading }: HeaderProps) {
  const isOnline = health?.status === 'healthy';

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--space-5) 0',
      borderBottom: '1px solid var(--border-default)',
      marginBottom: 'var(--space-8)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div style={{
          width: '32px',
          height: '32px',
          backgroundColor: 'var(--bg-surface-3)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Scientific reticle icon (bespoke inline SVG) */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-base)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="3" x2="12" y2="7" />
            <line x1="12" y1="17" x2="12" y2="21" />
            <line x1="3" y1="12" x2="7" y2="12" />
            <line x1="17" y1="12" x2="21" y2="12" />
          </svg>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              TRUTHLENS
            </span>
            <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              v1.0-grounded
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Real-Time AI Output Factuality &amp; Hallucination Forensic Analyzer
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* ML Model Indicator */}
        <div className="badge badge-neutral" title="Trained over 6,300 verified facts">
          <span style={{ color: health?.ml_model_loaded ? 'var(--supported-base)' : 'var(--text-muted)' }}>●</span>
          <span>ML Classifier: {health?.ml_model_loaded ? '6.3k Facts Active' : 'Initializing'}</span>
        </div>

        {/* Engine Connectivity Status */}
        <div className="badge badge-neutral">
          <span style={{
            color: healthLoading ? 'var(--unverified-base)' : isOnline ? 'var(--supported-base)' : 'var(--contradicted-base)',
            fontSize: '10px'
          }}>
            ●
          </span>
          <span>{healthLoading ? 'Connecting...' : isOnline ? 'Engine Online' : 'Engine Offline'}</span>
        </div>
      </div>
    </header>
  );
}
