from typing import List
from app.models.response import PresetItem

PRESETS: List[PresetItem] = [
    PresetItem(
        id="subtle-error",
        title="Subtle Hallucination",
        description="A blend of factual truths with misleading dates and exaggerated synthetic claims.",
        category="Historical / Pharmacology",
        text="Alexander Fleming discovered penicillin in 1945 at St. Mary's Hospital after returning from a summer holiday. Penicillin was the world's first widely effective synthetic antibiotic, completely curing bacterial infections without side effects. During World War II, mass production techniques were developed in Peoria, Illinois using corn steep liquor fermentation. Today, penicillin resistance is estimated to affect over 98% of all hospital-acquired staphylococcal strains globally."
    ),
    PresetItem(
        id="severe-hallucination",
        title="Severe Hallucination",
        description="Entirely fabricated historical milestones, nonexistent missions, and impossible dates.",
        category="Fabrication",
        text="Albert Einstein invented penicillin in 1820 while working at NASA headquarters in Geneva. The chemical was delivered exclusively via quantum teleportation to eradicate all viral influenza. In 1999, Fleming proved penicillin was inert and had zero biological efficacy in animal trials."
    ),
    PresetItem(
        id="accurate-reference",
        title="Accurate Ground Truth",
        description="Factually verified scientific account with 100% grounded assertions.",
        category="Grounded Reference",
        text="Alexander Fleming discovered penicillin in 1928 at St. Mary's Hospital in London. Chain and Florey later purified and stabilized the antibiotic for clinical use in Oxford. In 1945, Fleming, Florey, and Chain shared the Nobel Prize in Physiology or Medicine for their landmark contributions."
    )
]


def get_presets() -> List[PresetItem]:
    return PRESETS


def get_preset_by_id(preset_id: str) -> PresetItem:
    for p in PRESETS:
        if p.id == preset_id:
            return p
    return PRESETS[0]
