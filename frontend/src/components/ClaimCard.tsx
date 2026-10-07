import { Claim, MLPrediction } from '../types/report';

interface ClaimCardProps {
  claim: Claim;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  mlPrediction?: MLPrediction;
}

export default function ClaimCard({
  claim,
  index,
  isSelected,
  onSelect,
  mlPrediction
}: ClaimCardProps) {
  const confidencePct = (claim.confidence * 100).toFixed(1);

  // Status-dependent styling tokens
  const statusConfig = {
    SUPPORTED: {
      stripColor: 'bg-[#059669]',
      borderColor: 'border-[#059669]',
      badgeBg: 'bg-[#ecfdf5]',
      badgeText: 'text-[#065f46]',
      badgeBorder: 'border-[#a7f3d0]',
      groundingTitleColor: 'text-[#065f46]',
      groundingIcon: 'verified',
      groundingLabel: 'GOOGLE SEARCH GROUNDING VERIFICATION:',
      mlIcon: 'check_circle',
      mlIconColor: 'text-[#006c4a]',
      verbatimBorder: 'border-[#059669]',
      typeTag: 'GROUNDED_FACT'
    },
    CONTRADICTED: {
      stripColor: 'bg-[#dc2626]',
      borderColor: 'border-[#dc2626]',
      badgeBg: 'bg-[#fef2f2]',
      badgeText: 'text-[#991b1b]',
      badgeBorder: 'border-[#fecaca]',
      groundingTitleColor: 'text-[#991b1b]',
      groundingIcon: 'search_check',
      groundingLabel: 'GOOGLE SEARCH GROUNDING COUNTER-PROOF:',
      mlIcon: 'warning',
      mlIconColor: 'text-[#ba1a1a]',
      verbatimBorder: 'border-[#dc2626]',
      typeTag: 'TEMPORAL_CONFLICT'
    },
    UNVERIFIED: {
      stripColor: 'bg-[#d97706]',
      borderColor: 'border-[#d97706]',
      badgeBg: 'bg-[#fffbeb]',
      badgeText: 'text-[#92400e]',
      badgeBorder: 'border-[#fde68a]',
      groundingTitleColor: 'text-[#92400e]',
      groundingIcon: 'help',
      groundingLabel: 'FORENSIC ANALYSIS & CONFLICT DETAIL:',
      mlIcon: 'sync_problem',
      mlIconColor: 'text-[#d97706]',
      verbatimBorder: 'border-[#d97706]',
      typeTag: 'EVALUATIVE_CLAIM'
    }
  }[claim.verdict] || {
    stripColor: 'bg-[#d97706]',
    borderColor: 'border-[#d97706]',
    badgeBg: 'bg-[#fffbeb]',
    badgeText: 'text-[#92400e]',
    badgeBorder: 'border-[#fde68a]',
    groundingTitleColor: 'text-[#92400e]',
    groundingIcon: 'help',
    groundingLabel: 'FORENSIC ANALYSIS & CONFLICT DETAIL:',
    mlIcon: 'sync_problem',
    mlIconColor: 'text-[#d97706]',
    verbatimBorder: 'border-[#d97706]',
    typeTag: 'FACTUAL_CLAIM'
  };

  const claimNum = index < 10 ? `0${index}` : `${index}`;

  return (
    <article
      id={`claim-card-${claim.id}`}
      onClick={onSelect}
      className={`claim-card bg-white border border-[#bfc7d2] rounded shadow-xs relative overflow-hidden transition-all duration-150 cursor-pointer ${
        isSelected ? 'ring-2 ring-[#006194] bg-[#f2f3ff]/30' : ''
      }`}
    >
      {/* 4px Status Strip */}
      <div className={`absolute top-0 bottom-0 left-0 w-[4px] ${statusConfig.stripColor}`} />

      <div className="p-4 md:p-5 pl-5 md:pl-6">
        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="font-bold text-[#131b2e]">#CLAIM-{claimNum}</span>
            <span
              className={`${statusConfig.badgeBg} ${statusConfig.badgeText} border ${statusConfig.badgeBorder} font-bold px-2 py-0.5 rounded`}
            >
              {claim.verdict}
            </span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] text-[#707881]">
            <span>
              Confidence: <strong className="text-[#131b2e]">{confidencePct}%</strong>
            </span>
            <span>Type: {statusConfig.typeTag}</span>
          </div>
        </div>

        {/* Verbatim Assertion */}
        <div
          className={`border-l-2 ${statusConfig.verbatimBorder} pl-3 py-1 bg-[#f2f3ff] rounded-r mb-3`}
        >
          <p className="font-sans text-sm font-semibold text-[#131b2e] leading-snug">
            “{claim.text}”
          </p>
        </div>

        {/* Grounding Evidence Callout */}
        <div className="border border-[#bfc7d2] rounded p-3 bg-white mb-3">
          <div
            className={`flex items-center gap-1.5 mb-1 font-mono text-[11px] font-bold ${statusConfig.groundingTitleColor}`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {statusConfig.groundingIcon}
            </span>
            <span>{statusConfig.groundingLabel}</span>
          </div>
          <p className="font-sans text-xs md:text-[13px] text-[#131b2e] leading-relaxed">
            {claim.reasoning}
          </p>
        </div>

        {/* ML Model Cross-Check & Lineage */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {mlPrediction && (
            <span className="bg-[#f2f3ff] text-[#131b2e] border border-[#bfc7d2] font-mono text-[11px] px-2.5 py-1 rounded inline-flex items-center gap-1.5">
              <span className={`material-symbols-outlined text-[14px] ${statusConfig.mlIconColor}`}>
                {statusConfig.mlIcon}
              </span>
              <span>
                ML Model Verdict: <strong>{mlPrediction.predicted_verdict}</strong> (
                {Math.round(mlPrediction.ml_confidence * 100)}%) •{' '}
                {mlPrediction.predicted_verdict === claim.verdict
                  ? 'Historical Ground Truth Match'
                  : 'Semantic Entity Conflict Detected'}
              </span>
            </span>
          )}
        </div>

        {/* Authoritative Web Citations */}
        {claim.sources && claim.sources.length > 0 && (
          <div>
            <span className="font-mono text-[11px] text-[#707881] uppercase font-semibold block mb-1.5">
              Authoritative Evidence Citations:
            </span>
            <div className="flex flex-wrap gap-2">
              {claim.sources.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="font-mono text-[11px] bg-white hover:bg-[#f2f3ff] text-[#131b2e] border border-[#bfc7d2] px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>
                    {src.title} ({src.domain})
                  </span>
                  <span className="material-symbols-outlined text-[12px]">north_east</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
