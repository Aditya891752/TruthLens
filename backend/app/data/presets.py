from typing import List
from app.models.response import PresetItem

PRESETS: List[PresetItem] = [
    PresetItem(
        id="subtle-error",
        title="Subtle Hallucination (Historical / Discovery)",
        description="A blend of factual truths with subtle, misleading dates and institutions.",
        category="Historical",
        text="Alexander Fleming was a Scottish biologist who discovered penicillin in 1945 while conducting laboratory research at Cambridge University. Penicillin revolutionized modern medicine by serving as the first widely used antibiotic."
    ),
    PresetItem(
        id="severe-hallucination",
        title="Severe Hallucination (Fabricated Space Mission)",
        description="Entirely fabricated historical milestones and nonexistent spaceflight missions.",
        category="Science & Aerospace",
        text="NASA successfully launched Apollo 18 in July 1974, landing astronauts Thomas Miller and Robert Shaw in the Elysium Planitia region of Mars. The crew collected over 40 kilograms of Martian soil before returning safely to Earth."
    ),
    PresetItem(
        id="accurate-reference",
        title="Accurate Ground Truth (James Webb Telescope)",
        description="Factually verified scientific account with 100% grounded assertions.",
        category="Astronomy",
        text="The James Webb Space Telescope was launched on December 25, 2021, aboard an Ariane 5 rocket from Kourou, French Guiana. It currently orbits the Sun at the second Lagrange point (L2), approximately 1.5 million kilometers from Earth."
    )
]


def get_presets() -> List[PresetItem]:
    return PRESETS


def get_preset_by_id(preset_id: str) -> PresetItem:
    for p in PRESETS:
        if p.id == preset_id:
            return p
    return PRESETS[0]
