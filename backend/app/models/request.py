from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    """Payload for text factuality analysis."""
    text: str = Field(
        ...,
        min_length=5,
        max_length=15000,
        description="The AI-generated text or statement to analyze for hallucinations and factual accuracy."
    )


class PresetRequest(BaseModel):
    """Request identifier for loading built-in demo scenarios."""
    preset_id: str = Field(
        ...,
        description="Identifier of the demo preset scenario."
    )
