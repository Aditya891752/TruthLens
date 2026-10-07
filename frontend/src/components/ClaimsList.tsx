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
      unverified: claims.filter((c) => c.verdict === 'UNVERIFIED').length,
    };
  }, [claims]);

  const mlMap = useMemo(() => {
    if (!mlPredictions) return new Map();
    return new Map(mlPredictions.map((p) => [p.claim_id, p]));
  }, [mlPredictions]);

  return (
    <div className="surface-panel" style={{ padding: 'var(--space-6)' }}>
      {/* Title & Filter Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-4)',
        paddingBottom: 'var(--space-3)',
        borderBottom: '1px solid var(--border-default)',
        flexWrap: 'wrap',
        gap: 'var(--space-2)'
      }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Extracted Claims Stream ({filteredClaims.length})
        </h2>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setFilter('ALL')}
            style={{
              borderColor: filter === 'ALL' ? 'var(--border-strong)' : 'transparent',
              backgroundColor: filter === 'ALL' ? 'var(--bg-surface-3)' : 'transparent',
              color: filter === 'ALL' ? 'var(--text-primary)' : 'var(--text-secondary)',
              padding: '4px 10px',
              fontSize: '12px'
            }}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setFilter('CONTRADICTED')}
            style={{
              borderColor: filter === 'CONTRADICTED' ? 'var(--contradicted-border)' : 'transparent',
              backgroundColor: filter === 'CONTRADICTED' ? 'var(--contradicted-bg)' : 'transparent',
              color: filter === 'CONTRADICTED' ? 'var(--contradicted-text)' : 'var(--text-secondary)',
              padding: '4px 10px',
              fontSize: '12px'
            }}
          >
            Contradicted ({counts.contradicted})
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setFilter('SUPPORTED')}
            style={{
              borderColor: filter === 'SUPPORTED' ? 'var(--supported-border)' : 'transparent',
              backgroundColor: filter === 'SUPPORTED' ? 'var(--supported-bg)' : 'transparent',
              color: filter === 'SUPPORTED' ? 'var(--supported-text)' : 'var(--text-secondary)',
              padding: '4px 10px',
              fontSize: '12px'
            }}
          >
            Supported ({counts.supported})
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setFilter('UNVERIFIED')}
            style={{
              borderColor: filter === 'UNVERIFIED' ? 'var(--unverified-border)' : 'transparent',
              backgroundColor: filter === 'UNVERIFIED' ? 'var(--unverified-bg)' : 'transparent',
              color: filter === 'UNVERIFIED' ? 'var(--unverified-text)' : 'var(--text-secondary)',
              padding: '4px 10px',
              fontSize: '12px'
            }}
          >
            Unverified ({counts.unverified})
          </button>
        </div>
      </div>

      {/* Claims List */}
      {filteredClaims.length === 0 ? (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          No claims match the active status filter.
        </div>
      ) : (
        <div>
          {filteredClaims.map((claim) => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              isSelected={selectedClaimId === claim.id}
              onSelect={() => onSelectClaim(claim.id)}
              mlPrediction={mlMap.get(claim.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
