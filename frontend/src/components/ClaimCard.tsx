import { Claim, MLPrediction } from '../types/report';

interface ClaimCardProps {
  claim: Claim;
  isSelected: boolean;
  onSelect: () => void;
  mlPrediction?: MLPrediction;
}

export default function ClaimCard({ claim, isSelected, onSelect, mlPrediction }: ClaimCardProps) {
  const badgeClass = claim.verdict === 'SUPPORTED'
    ? 'badge-supported'
    : claim.verdict === 'CONTRADICTED'
    ? 'badge-contradicted'
    : 'badge-unverified';

  const confidencePct = Math.round(claim.confidence * 100);

  return (
    <div
      id={`claim-card-${claim.id}`}
      className="surface-card"
      onClick={onSelect}
      style={{
        padding: 'var(--space-4)',
        border: `1px solid ${isSelected ? 'var(--accent-base)' : 'var(--border-default)'}`,
        cursor: 'pointer',
        marginBottom: 'var(--space-3)'
      }}
    >
      {/* Top row: Claim ID, Status Badge, Confidence */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
            #{claim.id.toUpperCase()}
          </span>
          <span className={`badge ${badgeClass}`}>
            {claim.verdict}
          </span>
        </div>
        <div className="mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Confidence: <strong style={{ color: 'var(--text-primary)' }}>{confidencePct}%</strong>
        </div>
      </div>

      {/* Claim Text */}
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-3)', lineHeight: '1.5' }}>
        "{claim.text}"
      </div>

      {/* Forensic Reasoning Box */}
      <div style={{
        backgroundColor: 'var(--bg-surface-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: 'var(--space-3)',
        fontSize: '13px',
        color: 'var(--text-secondary)',
        lineHeight: '1.5',
        marginBottom: 'var(--space-3)'
      }}>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
          Forensic Evidence &amp; Counter-Proof:
        </div>
        <div>{claim.reasoning}</div>
      </div>

      {/* ML Model Local Cross-Check (if available) */}
      {mlPrediction && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          marginBottom: 'var(--space-3)'
        }}>
          <span>ML Model Verdict:</span>
          <span className={`badge ${mlPrediction.predicted_verdict === claim.verdict ? 'badge-supported' : 'badge-unverified'}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
            {mlPrediction.predicted_verdict} ({Math.round(mlPrediction.ml_confidence * 100)}%)
          </span>
          {mlPrediction.predicted_verdict === claim.verdict ? (
            <span style={{ color: 'var(--supported-base)' }}>Consensus</span>
          ) : (
            <span style={{ color: 'var(--unverified-base)' }}>Divergent</span>
          )}
        </div>
      )}

      {/* Web Sources & Grounding Links */}
      {claim.sources && claim.sources.length > 0 && (
        <div>
          <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-1)' }}>
            Authoritative Web Citations ({claim.sources.length}):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {claim.sources.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 8px',
                  backgroundColor: 'var(--bg-surface-1)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'color var(--transition-fast), border-color var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--accent-hover)';
                  e.currentTarget.style.borderColor = 'var(--accent-base)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                  {src.title}
                </span>
                <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {src.domain} ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
