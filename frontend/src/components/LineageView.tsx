export default function LineageView() {
  const decompositionPipeline = [
    {
      step: '01',
      title: 'Tokenization & Boundary Slicing',
      desc: 'Raw text is scanned preserving exact 0-indexed unicode character offsets (start_offset, end_offset). Punctuation boundaries are split using abbreviation-safe lookaheads.',
      badge: 'TOKEN_OFFSET_PRESERVED'
    },
    {
      step: '02',
      title: 'Atomic Predicate Decomposition',
      desc: 'Complex sentences are decomposed into independent testable propositions (assertions with subject, predicate, and temporal/locational anchors).',
      badge: 'ATOMIC_DECOMPOSITION'
    },
    {
      step: '03',
      title: 'Grounding Query Dispatch',
      desc: 'Each proposition is dispatched to Google Search Grounding with Gemini 2.5 Flash to retrieve authoritative web passages and URI metadata.',
      badge: 'GEMINI_GROUNDING_SYNC'
    },
    {
      step: '04',
      title: 'Dual-Layer Consensus Verification',
      desc: 'Grounding search passages are cross-checked against our in-house 6.3k-fact ML classifier. Consensus and divergence metrics are synthesized into the Truth Index.',
      badge: 'ML_GROUNDING_SYNTHESIS'
    }
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header Banner */}
      <div className="bg-[#f2f3ff] border border-[#bfc7d2] p-4 rounded flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
        <div className="flex items-center gap-2 text-[#131b2e]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#006194]"></span>
          <span className="font-bold text-[#006194]">CLAIM DECOMPOSITION &amp; LINEAGE</span>
          <span className="text-[#3f4850]">•</span>
          <span>Deterministic Character Offset Tracking Architecture</span>
        </div>
        <div className="text-[#707881]">
          AST EXTRACTION: UTF-8 VERIFIED
        </div>
      </div>

      {/* Pipeline Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {decompositionPipeline.map((p) => (
          <div key={p.step} className="bg-white border border-[#bfc7d2] rounded p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-[#006194]">
                  PHASE {p.step}
                </span>
                <span className="font-mono text-[10px] bg-[#f2f3ff] text-[#3f4850] border border-[#bfc7d2] px-2 py-0.5 rounded font-semibold">
                  {p.badge}
                </span>
              </div>
              <h4 className="font-sans font-bold text-sm text-[#131b2e] mb-2">
                {p.title}
              </h4>
              <p className="font-sans text-xs text-[#3f4850] leading-relaxed">
                {p.desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#bfc7d2]/60 font-mono text-[11px] text-[#707881] flex items-center justify-between">
              <span>Status: Online</span>
              <span className="text-[#006c4a] font-semibold">Zero-Drift Bound</span>
            </div>
          </div>
        ))}
      </div>

      {/* Technical Specifications Callout */}
      <div className="bg-white border border-[#bfc7d2] rounded p-5 shadow-xs">
        <h4 className="font-sans font-bold text-xs uppercase tracking-wide text-[#131b2e] mb-3">
          Offset Verification Guarantee
        </h4>
        <p className="font-sans text-xs text-[#3f4850] leading-relaxed">
          TruthLens guarantees that every highlighted character span in the Annotated Text Inspection view
          strictly maps to the source character indexes in the submitted input. When an assertion is edited,
          all offsets are recalculated deterministically without fuzzy heuristics or phantom token shifts.
        </p>
      </div>
    </div>
  );
}
