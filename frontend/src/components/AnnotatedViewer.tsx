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
  index?: number;
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

  // Segment original text into spans
  const segments: TextSegment[] = useMemo(() => {
    if (!sortedClaims.length) {
      return [{ text: originalText }];
    }

    const segs: TextSegment[] = [];
    let cursor = 0;

    for (let i = 0; i < sortedClaims.length; i++) {
      const claim = sortedClaims[i];
      const start = Math.max(cursor, claim.start_offset);
      const end = Math.min(originalText.length, claim.end_offset);

      // Preceding plain text
      if (start > cursor) {
        segs.push({ text: originalText.slice(cursor, start) });
      }

      // Claim span
      if (end > start) {
        segs.push({
          text: originalText.slice(start, end),
          claim,
          index: i + 1
        });
        cursor = end;
      }
    }

    // Trailing text
    if (cursor < originalText.length) {
      segs.push({ text: originalText.slice(cursor) });
    }

    return segs;
  }, [originalText, sortedClaims]);

  // Derive claim category based on text heuristic
  const getClaimType = (text: string): string => {
    const lower = text.toLowerCase();
    if (/\b(19\d\d|18\d\d|20\d\d|discovered|invented|century|world war)\b/.test(lower)) {
      return 'Temporal / Historical';
    }
    if (/\b(fermentation|corn steep|liquor|bacteria|penicillium|staphylococc)\b/.test(lower)) {
      return 'Biochemical Method';
    }
    if (/\b(antibiotic|synthetic|cure|curative|side effects|drug)\b/.test(lower)) {
      return 'Pharmacological Claim';
    }
    if (/\b(\d+%|percentage|rate|strain|resistance|cases|epidemiolog)\b/.test(lower)) {
      return 'Epidemiological Metric';
    }
    return 'Factual Assertion';
  };

  // Derive display grounding score
  const getGroundingScoreDisplay = (claim: Claim): string => {
    const conf = claim.confidence;
    if (claim.verdict === 'CONTRADICTED') {
      const conflictScore = (1 - conf).toFixed(2);
      return `${conflictScore} (Conflict)`;
    }
    if (claim.verdict === 'SUPPORTED') {
      return `${conf.toFixed(2)} (Match)`;
    }
    return `${conf.toFixed(2)} (Unverified)`;
  };

  return (
    <div className="w-full bg-white border border-[#bfc7d2] rounded shadow-xs">
      {/* Header with Legend */}
      <div className="p-4 md:p-5 border-b border-[#bfc7d2] flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-sans font-bold text-sm uppercase tracking-wide text-[#131b2e]">
          Annotated Text Inspection
        </h2>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="flex items-center gap-1 text-[#065f46]">
            <span className="w-2 h-2 rounded-full bg-[#059669]"></span> Supported
          </span>
          <span className="flex items-center gap-1 text-[#991b1b]">
            <span className="w-2 h-2 rounded-full bg-[#dc2626]"></span> Contradicted
          </span>
          <span className="flex items-center gap-1 text-[#92400e]">
            <span className="w-2 h-2 rounded-full bg-[#d97706]"></span> Unverified
          </span>
        </div>
      </div>

      {/* Interactive Annotated Body */}
      <div className="p-4 md:p-5 text-base md:text-lg leading-relaxed text-[#131b2e] select-text">
        <p className="space-y-1">
          {segments.map((seg, idx) => {
            if (!seg.claim) {
              return <span key={idx}>{seg.text}</span>;
            }

            const c = seg.claim;
            const isSelected = selectedClaimId === c.id;
            const indexStr = seg.index ? `#0${seg.index}` : `#${c.id}`;

            if (c.verdict === 'CONTRADICTED') {
              return (
                <span
                  key={idx}
                  onClick={() => onSelectClaim(c.id)}
                  className={`cursor-pointer bg-[#fef2f2] text-[#991b1b] border-b-2 border-[#dc2626] px-1 py-0.5 rounded-xs hover:bg-[#fee2e2] transition-colors inline mr-1 ${
                    isSelected ? 'ring-2 ring-[#ba1a1a]' : ''
                  }`}
                  title="Click to inspect contradiction evidence"
                >
                  {seg.text}
                  <span className="inline-block font-mono text-[10px] bg-[#fee2e2] text-[#991b1b] border border-[#fecaca] px-1 py-0.2 mx-1 rounded font-bold align-middle select-none">
                    {indexStr} CONTRADICTED
                  </span>
                </span>
              );
            }

            if (c.verdict === 'SUPPORTED') {
              return (
                <span
                  key={idx}
                  onClick={() => onSelectClaim(c.id)}
                  className={`cursor-pointer bg-[#ecfdf5] text-[#065f46] border-b-2 border-[#059669] px-1 py-0.5 rounded-xs hover:bg-[#d1fae5] transition-colors inline mr-1 ${
                    isSelected ? 'ring-2 ring-[#006c4a]' : ''
                  }`}
                  title="Click to inspect supported ground truth"
                >
                  {seg.text}
                  <span className="inline-block font-mono text-[10px] bg-[#d1fae5] text-[#065f46] border border-[#a7f3d0] px-1 py-0.2 mx-1 rounded font-bold align-middle select-none">
                    {indexStr} SUPPORTED
                  </span>
                </span>
              );
            }

            // UNVERIFIED
            return (
              <span
                key={idx}
                onClick={() => onSelectClaim(c.id)}
                className={`cursor-pointer bg-[#fffbeb] text-[#92400e] border-b-2 border-dashed border-[#d97706] px-1 py-0.5 rounded-xs hover:bg-[#fef3c7] transition-colors inline mr-1 ${
                  isSelected ? 'ring-2 ring-[#d97706]' : ''
                }`}
                title="Click to inspect unverified evidence"
              >
                {seg.text}
                <span className="inline-block font-mono text-[10px] bg-[#fef3c7] text-[#92400e] border border-[#fde68a] px-1 py-0.2 mx-1 rounded font-bold align-middle select-none">
                  {indexStr} UNVERIFIED
                </span>
              </span>
            );
          })}
        </p>
      </div>

      {/* Inspector Protocol Note Box */}
      <div className="m-4 md:m-5 p-3 bg-[#f2f3ff] border border-[#bfc7d2] rounded flex items-start gap-2">
        <span className="material-symbols-outlined text-[18px] text-[#707881] shrink-0 mt-0.5">
          info
        </span>
        <p className="font-mono text-[11px] text-[#3f4850] leading-normal">
          <strong className="text-[#131b2e]">Forensic Inspection Protocol:</strong> Click any
          annotated sentence to inspect Google Search Grounding evidence, semantic alignment
          diffs, and local ML classifier telemetry on the right stream.
        </p>
      </div>

      {/* Extraction Metrics Table */}
      <div className="px-4 md:px-5 pb-5">
        <div className="border border-[#bfc7d2] rounded overflow-hidden">
          <table className="w-full text-left font-mono text-[11px]">
            <thead className="bg-[#f2f3ff] text-[#707881] border-b border-[#bfc7d2] uppercase">
              <tr>
                <th className="py-2 px-3">Segment ID</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3 text-right">Grounding Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bfc7d2] text-[#3f4850]">
              {sortedClaims.map((claim, idx) => {
                const type = getClaimType(claim.text);
                const scoreDisplay = getGroundingScoreDisplay(claim);
                const segId = `#CLM-0${idx + 1}`;

                let typeColor = 'text-[#065f46]';
                if (claim.verdict === 'CONTRADICTED') typeColor = 'text-[#991b1b]';
                else if (claim.verdict === 'UNVERIFIED') typeColor = 'text-[#92400e]';

                return (
                  <tr
                    key={claim.id || idx}
                    onClick={() => onSelectClaim(claim.id)}
                    className="hover:bg-[#f2f3ff] cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-3 font-semibold text-[#131b2e]">{segId}</td>
                    <td className={`py-2 px-3 ${typeColor}`}>{type}</td>
                    <td className="py-2 px-3 text-right font-semibold">{scoreDisplay}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
