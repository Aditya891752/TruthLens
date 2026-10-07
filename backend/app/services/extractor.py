import json
import re
from typing import List, Dict, Any, Optional
from app.config import settings


class ClaimExtractor:
    """Deconstructs text into discrete atomic factual claims with exact character offsets."""

    def __init__(self, client=None):
        self.client = client

    def extract_claims(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract atomic factual assertions from text.
        Returns a list of dicts: [{'id': 'claim-1', 'text': '...', 'start_offset': X, 'end_offset': Y}]
        """
        # If Gemini client and API key are available, use LLM extraction
        if self.client and settings.GEMINI_API_KEY:
            try:
                return self._extract_via_gemini(text)
            except Exception as e:
                # Log and gracefully fallback to deterministic rule-based segmentation
                print(f"[ClaimExtractor] Gemini extraction fallback due to: {e}")

        return self._extract_rule_based(text)

    def _extract_via_gemini(self, text: str) -> List[Dict[str, Any]]:
        """Extract atomic claims using Gemini structured JSON prompt."""
        from google.genai import types

        prompt = f"""
Deconstruct the following text into atomic, falsifiable factual claims.
For each claim, identify its exact character start and end offset in the original text.

Original Text:
\"\"\"{text}\"\"\"

Output strictly valid JSON format conforming to:
{{
  "claims": [
    {{
      "id": "claim-1",
      "text": "The exact factual assertion",
      "start_offset": 0,
      "end_offset": 45
    }}
  ]
}}
"""
        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.0,
                response_mime_type="application/json"
            )
        )

        content = response.text
        data = json.loads(content)
        raw_claims = data.get("claims", [])
        
        # Validate and adjust offsets against actual original text
        validated_claims = []
        for i, c in enumerate(raw_claims):
            c_text = c.get("text", "").strip()
            if not c_text:
                continue
            
            start = c.get("start_offset", -1)
            end = c.get("end_offset", -1)

            # If offsets provided by model match exactly, keep them; otherwise search in text
            if start >= 0 and end > start and text[start:end].strip() == c_text:
                validated_claims.append({
                    "id": f"claim-{i+1}",
                    "text": c_text,
                    "start_offset": start,
                    "end_offset": end
                })
            else:
                pos = text.find(c_text)
                if pos != -1:
                    validated_claims.append({
                        "id": f"claim-{i+1}",
                        "text": c_text,
                        "start_offset": pos,
                        "end_offset": pos + len(c_text)
                    })
                else:
                    # Partial match or best effort
                    validated_claims.append({
                        "id": f"claim-{i+1}",
                        "text": c_text,
                        "start_offset": 0,
                        "end_offset": len(c_text)
                    })

        if validated_claims:
            return validated_claims

        return self._extract_rule_based(text)

    def _extract_rule_based(self, text: str) -> List[Dict[str, Any]]:
        """
        Deterministic, robust sentence-level and clause-level extraction.
        Guarantees exact character span coverage and zero external dependencies.
        """
        claims = []
        # Sentence splitting pattern preserving positions
        sentence_pattern = re.compile(r'([A-Z0-9][^.!?]*[.!?])', re.MULTILINE)
        matches = list(sentence_pattern.finditer(text))

        if not matches:
            # Fallback if no punctuation: split by lines or treat full text as one claim
            clean = text.strip()
            if clean:
                start = text.find(clean)
                return [{
                    "id": "claim-1",
                    "text": clean,
                    "start_offset": start,
                    "end_offset": start + len(clean)
                }]
            return []

        claim_idx = 1
        for match in matches:
            sentence = match.group(1).strip()
            start = match.start() + (match.group(1).find(sentence))
            end = start + len(sentence)

            if len(sentence) < 8:
                continue

            # Sub-split compound clauses connected by ' while ', ' however, ', ' but '
            clauses = re.split(r'(\s+(?:while|whereas|however|but|and was)\s+)', sentence)
            if len(clauses) > 1 and len(sentence) > 60:
                current_cursor = start
                for clause in clauses:
                    c_clean = clause.strip()
                    if c_clean and len(c_clean) > 12 and not re.match(r'^(while|whereas|however|but|and was)$', c_clean, re.I):
                        pos = text.find(c_clean, current_cursor)
                        if pos != -1:
                            claims.append({
                                "id": f"claim-{claim_idx}",
                                "text": c_clean,
                                "start_offset": pos,
                                "end_offset": pos + len(c_clean)
                            })
                            claim_idx += 1
                            current_cursor = pos + len(c_clean)
            else:
                claims.append({
                    "id": f"claim-{claim_idx}",
                    "text": sentence,
                    "start_offset": start,
                    "end_offset": end
                })
                claim_idx += 1

        return claims
