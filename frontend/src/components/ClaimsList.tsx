import { useState, useMemo } from 'react';
import { Claim, MLPrediction, Verdict } from '../types/report';
import ClaimCard from './ClaimCard';

interface ClaimsListProps {
  claims: Claim[];
  selectedClaimId: string | null;
  onSelectClaim: (id: string) => void;
  mlPredictions?: MLPrediction[];
}

export default function ClaimsList({
  claims,
  selectedClaimId,
  onSelectClaim,
  mlPredictions
}: ClaimsListProps) {
  const [filter, setFilter] = useState<'ALL' | Verdict>('ALL');

  const filteredClaims = useMemo(() => {
    if (filter === 'ALL') return claims;
    return claims.filter((c) => c.verdict === filter);
  }, [claims, filter]);

  const counts = useMemo(() => {
    return {
      all: claims.length,
      contradicted: claims.filter((c) => c.verdict === 'CONTRADICTED').length,
      supported: claims.filter((c) => c.verdict === 'SUPPORTED').length,
      unverified: claims.filter((c) => c.verdict === 'UNVERIFIED').length
    };
  }, [claims]);

  const mlMap = useMemo(() => {
    if (!mlPredictions) return new Map();
    return new Map(mlPredictions.map((p) => [p.claim_id, p]));
  }, [mlPredictions]);

  return (
    <div className="flex flex-col gap-4">
      {/* Filter and Header */}
      <div className="bg-white border border-[#bfc7d2] rounded p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-sans font-bold text-sm uppercase tracking-wide text-[#131b2e]">
          Extracted Claims Stream
        </h2>
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`font-medium px-2.5 py-1 rounded transition-colors cursor-pointer ${
              filter === 'ALL'
                ? 'bg-[#131b2e] text-white'
                : 'bg-white text-[#131b2e] border border-[#bfc7d2] hover:bg-[#f2f3ff]'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setFilter('CONTRADICTED')}
            className={`font-medium px-2.5 py-1 rounded transition-colors cursor-pointer ${
              filter === 'CONTRADICTED'
                ? 'bg-[#131b2e] text-white'
                : 'bg-white text-[#991b1b] border border-[#fecaca] hover:bg-[#fef2f2]'
            }`}
          >
            Contradicted ({counts.contradicted})
          </button>
          <button
            type="button"
            onClick={() => setFilter('SUPPORTED')}
            className={`font-medium px-2.5 py-1 rounded transition-colors cursor-pointer ${
              filter === 'SUPPORTED'
                ? 'bg-[#131b2e] text-white'
                : 'bg-white text-[#065f46] border border-[#a7f3d0] hover:bg-[#ecfdf5]'
            }`}
          >
            Supported ({counts.supported})
          </button>
          <button
            type="button"
            onClick={() => setFilter('UNVERIFIED')}
            className={`font-medium px-2.5 py-1 rounded transition-colors cursor-pointer ${
              filter === 'UNVERIFIED'
                ? 'bg-[#131b2e] text-white'
                : 'bg-white text-[#92400e] border border-[#fde68a] hover:bg-[#fffbeb]'
            }`}
          >
            Unverified ({counts.unverified})
          </button>
        </div>
      </div>

      {/* Stack of Claim Cards */}
      <div className="flex flex-col gap-4">
        {filteredClaims.map((claim, idx) => (
          <ClaimCard
            key={claim.id}
            claim={claim}
            index={idx + 1}
            isSelected={selectedClaimId === claim.id}
            onSelect={() => onSelectClaim(claim.id)}
            mlPrediction={mlMap.get(claim.id)}
          />
        ))}

        {filteredClaims.length === 0 && (
          <div className="p-8 text-center bg-white border border-[#bfc7d2] rounded font-mono text-xs text-[#707881]">
            No claims match the active filter ({filter}).
          </div>
        )}
      </div>
    </div>
  );
}
