import { Metrics, MLPrediction, Claim } from '../types/report';

interface MetricBarProps {
  metrics: Metrics;
  claims: Claim[];
  mlPredictions?: MLPrediction[];
}

export default function MetricBar({ metrics, claims, mlPredictions }: MetricBarProps) {
  const { truth_score, hallucination_risk, total_claims, supported_count, contradicted_count, unverified_count } = metrics;

  // Determine color for truth score
  let scoreColor = 'var(--supported-base)';
  if (truth_score < 50) {
    scoreColor = 'var(--contradicted-base)';
  } else if (truth_score < 80) {
    scoreColor = 'var(--unverified-base)';
  }

  // Calculate ML agreement rate
  let mlAgreementText = 'N/A';
  if (mlPredictions && mlPredictions.length > 0 && claims.length > 0) {
    let agreements = 0;
    const mlMap = new Map(mlPredictions.map(p => [p.claim_id, p.predicted_verdict]));
    claims.forEach(c => {
      if (mlMap.get(c.id) === c.verdict) {
        agreements++;
      }
    });
    const rate = Math.round((agreements / claims.length) * 100);
    mlAgreementText = `${rate}% Consensus`;
  }

  const riskClass = hallucination_risk === 'LOW'
    ? 'badge-supported'
    : hallucination_risk === 'MODERATE'
    ? 'badge-unverified'
    : 'badge-contradicted';

  return (
    <div className="surface-panel" style={{
      padding: 'var(--space-5) var(--space-6)',
      marginBottom: 'var(--space-6)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 'var(--space-5)',
      alignItems: 'center'
    }}>
      {/* Metric 1: Truth Index Gauge */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
          <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Truth Index
          </span>
          <span className="mono" style={{ fontSize: '20px', fontWeight: 700, color: scoreColor }}>
            {truth_score}%
          </span>
        </div>
        <div style={{ height: '6px', backgroundColor: 'var(--bg-surface-3)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.max(2, truth_score)}%`,
            backgroundColor: scoreColor,
            transition: 'width 300ms ease'
          }} />
        </div>
      </div>

      {/* Metric 2: Hallucination Risk Level */}
      <div>
        <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 'var(--space-2)' }}>
          Hallucination Risk
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span className={`badge ${riskClass}`} style={{ fontSize: '13px', padding: '4px 10px' }}>
            {hallucination_risk} RISK
          </span>
          {mlPredictions && mlPredictions.length > 0 && (
            <span className="mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              (ML: {mlAgreementText})
            </span>
          )}
        </div>
      </div>

      {/* Metric 3: Claim Categorization Tally */}
      <div>
        <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 'var(--space-2)' }}>
          Claim Breakdown ({total_claims} Total)
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <span className="badge badge-supported">
            {supported_count} Supported
          </span>
          <span className="badge badge-contradicted">
            {contradicted_count} Contradicted
          </span>
          <span className="badge badge-unverified">
            {unverified_count} Unverified
          </span>
        </div>
      </div>
    </div>
  );
}
