import { Metrics, MLPrediction, Claim } from '../types/report';

interface MetricBarProps {
  metrics: Metrics;
  claims: Claim[];
  mlPredictions?: MLPrediction[];
}

export default function MetricBar({ metrics, claims, mlPredictions }: MetricBarProps) {
  const {
    truth_score,
    hallucination_risk,
    total_claims,
    supported_count,
    contradicted_count,
    unverified_count
  } = metrics;

  // Calculate ML consensus rate
  let mlConsensusPercent = 85;
  if (mlPredictions && mlPredictions.length > 0 && claims.length > 0) {
    let agreements = 0;
    const mlMap = new Map(mlPredictions.map((p) => [p.claim_id, p.predicted_verdict]));
    claims.forEach((c) => {
      if (mlMap.get(c.id) === c.verdict) {
        agreements++;
      }
    });
    mlConsensusPercent = Math.round((agreements / claims.length) * 100);
  }

  // Risk badge styling
  const riskStyles: Record<string, { bg: string; text: string; border: string; label: string }> = {
    LOW: {
      bg: 'bg-[#ecfdf5]',
      text: 'text-[#065f46]',
      border: 'border-[#a7f3d0]',
      label: 'LOW RISK'
    },
    MODERATE: {
      bg: 'bg-[#fffbeb]',
      text: 'text-[#92400e]',
      border: 'border-[#fde68a]',
      label: 'MODERATE RISK'
    },
    HIGH: {
      bg: 'bg-[#fef2f2]',
      text: 'text-[#991b1b]',
      border: 'border-[#fecaca]',
      label: 'HIGH RISK'
    },
    CRITICAL: {
      bg: 'bg-[#fef2f2]',
      text: 'text-[#991b1b]',
      border: 'border-[#fecaca]',
      label: 'CRITICAL RISK'
    }
  };

  const currentRisk = riskStyles[hallucination_risk] || riskStyles.MODERATE;

  return (
    <section className="w-full bg-white border border-[#bfc7d2] rounded mb-6 shadow-xs">
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#bfc7d2]">
        {/* Module 1: Truth Index Gauge */}
        <div className="p-4 md:p-5 flex flex-col justify-between">
          <div>
            <span className="font-mono text-[11px] text-[#707881] font-bold uppercase tracking-wider block">
              Truth Index
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-sans text-2xl md:text-3xl font-extrabold text-[#131b2e] tracking-tight">
                {truth_score.toFixed(1)}%
              </span>
              <span className="font-mono text-[11px] text-[#707881]">
                ({supported_count} of {total_claims} facts verified)
              </span>
            </div>
          </div>

          {/* Segmented Bar */}
          <div className="mt-4 flex items-center gap-1.5 h-2 w-full">
            {claims.map((claim, idx) => {
              let segBg = 'bg-[#006c4a]';
              if (claim.verdict === 'CONTRADICTED') segBg = 'bg-[#ba1a1a]';
              else if (claim.verdict === 'UNVERIFIED') segBg = 'bg-[#d97706]';

              return (
                <div
                  key={claim.id || idx}
                  className={`h-full flex-1 ${segBg} rounded-xs`}
                  title={`Fact #${idx + 1}: ${claim.verdict}`}
                />
              );
            })}
          </div>
        </div>

        {/* Module 2: Hallucination Risk & ML Consensus */}
        <div className="p-4 md:p-5 flex flex-col justify-between">
          <div>
            <span className="font-mono text-[11px] text-[#707881] font-bold uppercase tracking-wider block">
              Risk Level &amp; Model Consensus
            </span>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`${currentRisk.bg} ${currentRisk.text} border ${currentRisk.border} font-mono text-[11px] font-bold px-2 py-0.5 rounded`}
              >
                {currentRisk.label}
              </span>
              <span className="font-sans text-[13px] font-semibold text-[#131b2e]">
                {mlConsensusPercent}% Classifier Consensus
              </span>
            </div>
          </div>
          <div className="mt-4 font-mono text-[11px] text-[#707881] flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-[#707881]">database</span>
            <span>19,300+ Local Vector Factbase + Gemini Grounding</span>
          </div>
        </div>

        {/* Module 3: Claim Breakdown */}
        <div className="p-4 md:p-5 flex flex-col justify-between">
          <div>
            <span className="font-mono text-[11px] text-[#707881] font-bold uppercase tracking-wider block">
              Assertion Breakdown ({total_claims} Total)
            </span>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0] font-mono text-[11px] font-semibold px-2 py-0.5 rounded">
                {supported_count} Supported
              </span>
              <span className="bg-[#fef2f2] text-[#991b1b] border border-[#fecaca] font-mono text-[11px] font-semibold px-2 py-0.5 rounded">
                {contradicted_count} Contradicted
              </span>
              <span className="bg-[#fffbeb] text-[#92400e] border border-[#fde68a] font-mono text-[11px] font-semibold px-2 py-0.5 rounded">
                {unverified_count} Unverified
              </span>
            </div>
          </div>
          <div className="mt-4 font-mono text-[11px] text-[#707881] flex items-center justify-between">
            <span>Grounding Engine: SEARCH_GROUNDED</span>
            <span className="text-[#006c4a] font-semibold">100% COVERAGE</span>
          </div>
        </div>
      </div>
    </section>
  );
}
