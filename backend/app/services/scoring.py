from typing import List
from app.models.response import Claim, Metrics, VerdictEnum, RiskLevelEnum


class ScoringService:
    """Computes aggregate Truth Index and Hallucination Risk metrics."""

    @staticmethod
    def calculate_metrics(claims: List[Claim]) -> Metrics:
        total = len(claims)
        if total == 0:
            return Metrics(
                truth_score=100.0,
                hallucination_risk=RiskLevelEnum.LOW,
                total_claims=0,
                supported_count=0,
                contradicted_count=0,
                unverified_count=0
            )

        supported = [c for c in claims if c.verdict == VerdictEnum.SUPPORTED]
        contradicted = [c for c in claims if c.verdict == VerdictEnum.CONTRADICTED]
        unverified = [c for c in claims if c.verdict == VerdictEnum.UNVERIFIED]

        supported_count = len(supported)
        contradicted_count = len(contradicted)
        unverified_count = len(unverified)

        # Weighted confidence sum of supported claims
        sum_supported_conf = sum(c.confidence for c in supported)
        truth_score = round((sum_supported_conf / total) * 100.0, 1)

        # Hallucination Risk determination
        if contradicted_count >= 2 or truth_score < 50.0:
            risk = RiskLevelEnum.CRITICAL
        elif contradicted_count == 1 or truth_score < 80.0:
            risk = RiskLevelEnum.MODERATE
        else:
            risk = RiskLevelEnum.LOW

        return Metrics(
            truth_score=truth_score,
            hallucination_risk=risk,
            total_claims=total,
            supported_count=supported_count,
            contradicted_count=contradicted_count,
            unverified_count=unverified_count
        )
