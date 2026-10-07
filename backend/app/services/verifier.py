import re
from typing import Dict, Any, List
from app.models.response import Claim, VerdictEnum, Source


class ClaimVerifier:
    """Parses and synthesizes forensic verdicts for extracted atomic claims."""

    def synthesize_claim(
        self,
        claim_data: Dict[str, Any],
        analysis_text: str,
        sources: List[Source]
    ) -> Claim:
        """
        Synthesizes raw grounding analysis into a validated Claim object.
        """
        verdict = self._parse_verdict(analysis_text)
        confidence = self._parse_confidence(analysis_text)
        reasoning = self._parse_reasoning(analysis_text)

        return Claim(
            id=claim_data["id"],
            text=claim_data["text"],
            start_offset=claim_data["start_offset"],
            end_offset=claim_data["end_offset"],
            verdict=verdict,
            confidence=confidence,
            reasoning=reasoning,
            sources=sources
        )

    def _parse_verdict(self, text: str) -> VerdictEnum:
        match = re.search(r'VERDICT:\s*(SUPPORTED|CONTRADICTED|UNVERIFIED)', text, re.IGNORECASE)
        if match:
            val = match.group(1).upper()
            if val in VerdictEnum.__members__:
                return VerdictEnum(val)

        # Fallback keyword scan
        upper = text.upper()
        if "CONTRADICTED" in upper or "REFUTED" in upper or "FALSE" in upper:
            return VerdictEnum.CONTRADICTED
        if "SUPPORTED" in upper or "VERIFIED" in upper or "TRUE" in upper:
            return VerdictEnum.SUPPORTED
        return VerdictEnum.UNVERIFIED

    def _parse_confidence(self, text: str) -> float:
        match = re.search(r'CONFIDENCE:\s*([0-1]?\.[0-9]+|1\.0|0)', text, re.IGNORECASE)
        if match:
            try:
                val = float(match.group(1))
                return max(0.0, min(1.0, val))
            except ValueError:
                pass
        return 0.85

    def _parse_reasoning(self, text: str) -> str:
        match = re.search(r'REASONING:\s*(.+)', text, re.IGNORECASE | re.DOTALL)
        if match:
            cleaned = match.group(1).strip()
            # Truncate to first paragraph or two sentences
            sentences = cleaned.split("\n")[0].strip()
            return sentences if len(sentences) > 10 else cleaned[:300]

        # If no explicit REASONING prefix, extract first non-empty lines
        lines = [l.strip() for l in text.split("\n") if l.strip() and not l.startswith("VERDICT:") and not l.startswith("CONFIDENCE:")]
        if lines:
            return " ".join(lines)[:300]
        return "Claim evaluated against retrieved web evidence."
