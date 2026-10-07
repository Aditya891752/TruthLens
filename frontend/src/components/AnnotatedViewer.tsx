import { useMemo } from 'react';
import { Claim } from '../types/report';

interface AnnotatedViewerProps {
  originalText: string;
  claims: Claim[];
  selectedClaimId: string | null;
  onSelectClaim: (id: string) => void;
}

interface TextSegment {
  text: string;
  claim?: Claim;
}

export default function AnnotatedViewer({
  originalText,
  claims,
  selectedClaimId,
  onSelectClaim
}: AnnotatedViewerProps) {
  // Sort claims strictly by start_offset
  const sortedClaims = useMemo(() => {
    return [...claims].sort((a, b) => a.start_offset - b.start_offset);
  }, [claims]);

  // Segment original text into unannotated pieces and claim spans
  const segments: TextSegment[] = useMemo(() => {
    if (!sortedClaims.length) {
      return [{ text: originalText }];
    }

    const segs: TextSegment[] = [];
    let cursor = 0;

    for (const claim of sortedClaims) {
      const start = Math.max(cursor, claim.start_offset);
      const end = Math.min(originalText.length, claim.end_offset);

      // Add preceding unannotated text
      if (start > cursor) {
        segs.push({ text: originalText.slice(cursor, start) });
      }

      // Add annotated claim span
      if (end > start) {
        segs.push({
          text: originalText.slice(start, end),
          claim
        });
        cursor = end;
      }
    }

    // Add trailing text
    if (cursor < originalText.length) {
      segs.push({ text: originalText.slice(cursor) });
    }

    return segs;
  }, [originalText, sortedClaims]);

  return (
    <div className="surface-panel" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
      {/* Header with legend */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Annotated Text Inspection
          </h2>
          <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            (Click any highlighted assertion to inspect ground truth)
          </span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--supported-base)', borderRadius: '2px' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Supported</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--contradicted-base)', borderRadius: '2px' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Contradicted</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--unverified-base)', borderRadius: '2px' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Unverified</span>
          </span>
        </div>
      </div>

      {/* Reader Body */}
      <div style={{
        fontSize: '15px',
        lineHeight: '1.8',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap'
      }}>
        {segments.map((seg, idx) => {
          if (!seg.claim) {
            return <span key={idx}>{seg.text}</span>;
          }

          const c = seg.claim;
          const isSelected = selectedClaimId === c.id;

          let bg = 'var(--unverified-highlight)';
          let borderBottom = '2px solid var(--unverified-base)';
          if (c.verdict === 'SUPPORTED') {
            bg = 'var(--supported-highlight)';
            borderBottom = '2px solid var(--supported-base)';
          } else if (c.verdict === 'CONTRADICTED') {
            bg = 'var(--contradicted-highlight)';
            borderBottom = '2px solid var(--contradicted-base)';
          }

          return (
            <span
              key={idx}
              onClick={() => onSelectClaim(c.id)}
              style={{
                backgroundColor: bg,
                borderBottom: borderBottom,
                padding: '2px 3px',
                borderRadius: '2px',
                cursor: 'pointer',
                outline: isSelected ? '2px solid var(--accent-base)' : 'none',
                fontWeight: isSelected ? 600 : 400,
                transition: 'outline var(--transition-fast)'
              }}
              title={`[${c.verdict}] ${c.reasoning}`}
            >
              {seg.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
