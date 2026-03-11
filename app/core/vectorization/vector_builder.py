import numpy as np
from app.models.profile import PsychologicalProfile
from app.models.vectors import StateVector
from app.utils.normalization import normalize_components

COMPONENT_ORDER = ["big_five", "maslow", "schwartz"]

"""
ХАРДКОД ДАНИХ
В майбутньому отримувати інфу
"""

PROFILE_BEFORE = PsychologicalProfile(
    big_five={
        "neuroticism":       3,
        "openness":          1,
        "conscientiousness": 2,
        "extraversion":      1,
        "agreeableness":     2,
    },
    maslow={
        "physiological":      2,
        "safety":             3,
        "love":               1,
        "esteem":             1,
        "self_actualization": 0,
    },
    schwartz={
        "power":        1,
        "achievement":  0,
        "hedonism":     1,
        "security":     3,
        "benevolence":  1,
        "universalism": 0,
    },
)

PROFILE_AFTER_A = PsychologicalProfile(
    big_five={
        "neuroticism":       1,
        "openness":          3,
        "conscientiousness": 3,
        "extraversion":      2,
        "agreeableness":     3,
    },
    maslow={
        "physiological":      1,
        "safety":             2,
        "love":               3,
        "esteem":             2,
        "self_actualization": 2,
    },
    schwartz={
        "power":        0,
        "achievement":  2,
        "hedonism":     2,
        "security":     1,
        "benevolence":  3,
        "universalism": 2,
    },
)

PROFILE_AFTER_B = PsychologicalProfile(
    big_five={
        "neuroticism":       2,
        "openness":          2,
        "conscientiousness": 2,
        "extraversion":      2,
        "agreeableness":     2,
    },
    maslow={
        "physiological":      2,
        "safety":             2,
        "love":               2,
        "esteem":             2,
        "self_actualization": 1,
    },
    schwartz={
        "power":        1,
        "achievement":  1,
        "hedonism":     1,
        "security":     2,
        "benevolence":  2,
        "universalism": 1,
    },
)

PROFILE_AFTER_C = PsychologicalProfile(
    big_five={
        "neuroticism":       0,
        "openness":          4,
        "conscientiousness": 3,
        "extraversion":      3,
        "agreeableness":     4,
    },
    maslow={
        "physiological":      1,
        "safety":             1,
        "love":               4,
        "esteem":             3,
        "self_actualization": 3,
    },
    schwartz={
        "power":        0,
        "achievement":  3,
        "hedonism":     2,
        "security":     1,
        "benevolence":  4,
        "universalism": 3,
    },
)

# Еталонний вектор психолога — ℝ¹⁶
EXPERT_VECTOR_VALUES = np.array([
    0.2, 0.8, 0.7, 0.6, 0.9,        # big_five
    0.3, 0.5, 0.8, 0.7, 0.6,        # maslow
    0.1, 0.6, 0.5, 0.3, 0.9, 0.7,   # schwartz
], dtype=float)


# ── Функції ───────────────────────────────────────────────────────────────

def profile_to_components(profile):
    """
    PsychologicalProfile → dict {str: np.ndarray}
    big_five  → ℝ⁵
    maslow    → ℝ⁵
    schwartz  → ℝ⁶
    """
    data = profile.to_dict()
    components = {}

    for key in COMPONENT_ORDER:
        if key in data:
            components[key] = np.array(list(data[key].values()), dtype=float)

    return components


def build_state_vector(profile, label="", normalize=True):
    """
    Профіль → компоненти → нормалізація → конкатенація → StateVector.
    E = concat(E₁, E₂, E₃) ∈ ℝ¹⁶
    """
    components = profile_to_components(profile)

    if normalize:
        components = normalize_components(components)

    arrays = []
    for key in COMPONENT_ORDER:
        if key in components:
            arrays.append(components[key])

    vector = np.concatenate(arrays)

    return StateVector(components=components, vector=vector, label=label)