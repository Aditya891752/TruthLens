export type Verdict = 'SUPPORTED' | 'CONTRADICTED' | 'UNVERIFIED';

export type RiskLevel = 'LOW' | 'MODERATE' | 'CRITICAL';

export interface Source {
  title: string;
  url: string;
  domain: string;
}

export interface Claim {
  id: string;
  text: string;
  start_offset: number;
  end_offset: number;
  verdict: Verdict;
  confidence: number;
  reasoning: string;
  sources: Source[];
}

export interface Metrics {
  truth_score: number;
  hallucination_risk: RiskLevel;
  total_claims: number;
  supported_count: number;
  contradicted_count: number;
  unverified_count: number;
}

export interface MLPrediction {
  claim_id: string;
  claim_text: string;
  predicted_verdict: Verdict;
  ml_confidence: number;
}

export interface VerificationReport {
  id: string;
  analyzed_at: string;
  original_text: string;
  metrics: Metrics;
  claims: Claim[];
  ml_predictions?: MLPrediction[];
}

export interface PresetItem {
  id: string;
  title: string;
  description: string;
  text: string;
  category: string;
}

export interface HealthStatus {
  status: string;
  uptime_seconds: number;
  environment: string;
  model: string;
  grounding_ready: boolean;
  ml_model_loaded: boolean;
}
